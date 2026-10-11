import type { Payload } from 'payload'

import { relationId } from '../../lib/directory'

import type { WriteResult } from './report'
import { emptyWrites } from './report'
import type { CountryCode, LocaleCode, LocaleText, ParsedGuide, ParsedLive, ParsedShop, SkippedRow } from './types'
import { LOCALES } from './types'

type Counts = WriteResult['countries']

export async function upsertLive(payload: Payload, parsed: ParsedLive): Promise<WriteResult> {
  const skipped: SkippedRow[] = []
  const countries = await upsertCountries(payload, parsed, skipped)
  const countryIds = await loadCountryIds(payload)
  const towns = await upsertTowns(payload, parsed, countryIds, skipped)
  const townIds = await loadTownIds(payload, countryIds)
  const shops = await upsertShops(payload, parsed, countryIds, townIds, skipped)
  const guides = await upsertGuides(payload, parsed, skipped)
  return { countries, towns, shops, guides, skipped }
}

async function upsertCountries(payload: Payload, parsed: ParsedLive, skipped: SkippedRow[]): Promise<Counts> {
  const counts = emptyWrites()
  for (const country of parsed.countries) {
    try {
      const existing = await payload.find({
        collection: 'countries',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { code: { equals: country.code } },
      })
      const doc = existing.docs[0]
      if (!doc) {
        const created = await payload.create({
          collection: 'countries',
          locale: 'en',
          overrideAccess: true,
          data: {
            code: country.code,
            slug: country.slug,
            name: country.name.en || country.slug,
          },
        })
        await writeLocales(payload, 'countries', created.id, { name: country.name }, true)
        counts.created += 1
        continue
      }
      let changed = await writeLocales(payload, 'countries', doc.id, { name: country.name }, false)
      if (doc.slug !== country.slug) {
        await payload.update({
          collection: 'countries',
          id: doc.id,
          overrideAccess: true,
          data: { slug: country.slug },
        })
        changed = true
      }
      if (changed) counts.updated += 1
      else counts.unchanged += 1
    } catch (error) {
      counts.skipped += 1
      skipped.push({ type: 'country', key: country.code, reason: errorText(error) })
    }
  }
  return counts
}

async function upsertTowns(
  payload: Payload,
  parsed: ParsedLive,
  countryIds: Map<CountryCode, number>,
  skipped: SkippedRow[],
): Promise<Counts> {
  const counts = emptyWrites()
  for (const town of parsed.towns) {
    const countryId = countryIds.get(town.country)
    const key = `${town.country}/${town.slug}`
    if (countryId == null) {
      counts.skipped += 1
      skipped.push({ type: 'town', key, reason: 'Country was not upserted' })
      continue
    }
    try {
      const existing = await payload.find({
        collection: 'towns',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: {
          and: [{ slug: { equals: town.slug } }, { country: { equals: countryId } }],
        },
      })
      const doc = existing.docs[0]
      if (!doc) {
        const created = await payload.create({
          collection: 'towns',
          locale: 'en',
          overrideAccess: true,
          data: {
            slug: town.slug,
            country: countryId,
            name: town.name.en || town.slug,
          },
        })
        await writeLocales(payload, 'towns', created.id, { name: town.name }, true)
        counts.created += 1
        continue
      }
      const changed = await writeLocales(payload, 'towns', doc.id, { name: town.name }, false)
      if (changed) counts.updated += 1
      else counts.unchanged += 1
    } catch (error) {
      counts.skipped += 1
      skipped.push({ type: 'town', key, reason: errorText(error) })
    }
  }
  return counts
}

async function upsertShops(
  payload: Payload,
  parsed: ParsedLive,
  countryIds: Map<CountryCode, number>,
  townIds: Map<string, number>,
  skipped: SkippedRow[],
): Promise<Counts> {
  const counts = emptyWrites()
  const existing = await findAll<ShopShape>(payload, 'shops')
  const byPlace = new Map<string, number>()
  const byPath = new Map<string, number>()
  const townKeyById = new Map<number, string>()
  for (const [key, id] of townIds) townKeyById.set(id, key)
  for (const shop of existing) {
    if (typeof shop.placeId === 'string' && shop.placeId) byPlace.set(shop.placeId, shop.id)
    const town = relationId(shop.town)
    if (typeof town === 'number' && typeof shop.slug === 'string') {
      const townKey = townKeyById.get(town)
      if (townKey) byPath.set(`${townKey}/${shop.slug}`, shop.id)
    }
  }

  let index = 0
  for (const shop of parsed.shops) {
    index += 1
    if (index % 200 === 0) console.error(`shops ${index}/${parsed.shops.length}`)
    const countryId = countryIds.get(shop.country)
    const townId = townIds.get(`${shop.country}/${shop.townSlug}`)
    if (countryId == null || townId == null) {
      counts.skipped += 1
      skipped.push({ type: 'shop', key: shop.path, reason: 'Town or country was not upserted' })
      continue
    }
    const placeHit = shop.placeId ? byPlace.get(shop.placeId) : undefined
    const pathHit = byPath.get(`${shop.country}/${shop.townSlug}/${shop.slug}`)
    if (placeHit != null && pathHit != null && placeHit !== pathHit) {
      counts.skipped += 1
      skipped.push({ type: 'shop', key: shop.path, reason: 'placeId and path point at different shops' })
      continue
    }
    const data = shopData(shop, townId, countryId)
    try {
      const existingId = placeHit ?? pathHit
      if (existingId == null) {
        const created = await payload.create({
          collection: 'shops',
          locale: 'en',
          overrideAccess: true,
          data: { ...data, claimStatus: 'unclaimed' },
        })
        await writeLocales(payload, 'shops', created.id, shopLocales(shop), true)
        byPath.set(`${shop.country}/${shop.townSlug}/${shop.slug}`, created.id)
        if (shop.placeId) byPlace.set(shop.placeId, created.id)
        counts.created += 1
        continue
      }
      const current = existing.find((doc) => doc.id === existingId)
      const localesChanged = await writeLocales(payload, 'shops', existingId, shopLocales(shop), false)
      const scalarsChanged = !current || !sameShop(current, data)
      if (scalarsChanged) {
        await payload.update({
          collection: 'shops',
          id: existingId,
          locale: 'en',
          overrideAccess: true,
          data,
        })
      }
      if (scalarsChanged || localesChanged) counts.updated += 1
      else counts.unchanged += 1
    } catch (error) {
      counts.skipped += 1
      skipped.push({ type: 'shop', key: shop.path, reason: errorText(error) })
    }
  }
  return counts
}

async function upsertGuides(payload: Payload, parsed: ParsedLive, skipped: SkippedRow[]): Promise<Counts> {
  const counts = emptyWrites()
  const bySlug = new Map<string, number>()
  for (const locale of LOCALES) {
    const docs = await findAll<{ id: number; slug?: string | null }>(payload, 'guides', locale)
    for (const doc of docs) {
      if (typeof doc.slug === 'string') bySlug.set(`${locale}:${doc.slug}`, doc.id)
    }
  }

  for (const guide of parsed.guides) {
    try {
      let id = findGuideId(guide, bySlug)
      const wasCreated = id == null
      if (id == null) {
        const primary = guide.locales.en || guide.locales.ms || guide.locales.zh || guide.locales['zh-Hant']
        if (!primary) {
          counts.skipped += 1
          skipped.push({ type: 'guide', key: guide.key, reason: 'Guide has no locale content' })
          continue
        }
        const created = await payload.create({
          collection: 'guides',
          locale: 'en',
          overrideAccess: true,
          data: guideData(guide.locales.en || primary),
        })
        id = created.id
        counts.created += 1
      }
      let changed = false
      for (const locale of LOCALES) {
        const content = guide.locales[locale]
        if (!content) continue
        const current = (await payload.findByID({
          collection: 'guides',
          id,
          locale,
          depth: 0,
          overrideAccess: true,
        })) as GuideShape
        const data = guideData(content)
        if (sameGuide(current, data) && current.slug === content.slug) continue
        await payload.update({
          collection: 'guides',
          id,
          locale,
          overrideAccess: true,
          data,
        })
        bySlug.set(`${locale}:${content.slug}`, id)
        changed = true
      }
      if (!wasCreated) {
        if (changed) counts.updated += 1
        else counts.unchanged += 1
      }
    } catch (error) {
      counts.skipped += 1
      skipped.push({ type: 'guide', key: guide.key, reason: errorText(error) })
    }
  }
  return counts
}

function findGuideId(guide: ParsedGuide, bySlug: Map<string, number>) {
  for (const locale of LOCALES) {
    const content = guide.locales[locale]
    if (!content) continue
    const id = bySlug.get(`${locale}:${content.slug}`)
    if (id != null) return id
  }
  return undefined
}

function guideData(content: NonNullable<ParsedGuide['locales'][LocaleCode]>) {
  return {
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt,
    body: content.body,
    seo: {
      title: content.seoTitle,
      description: content.seoDescription,
    },
  }
}

type GuideShape = {
  slug?: string | null
  title?: string | null
  excerpt?: string | null
  body?: string | null
  seo?: { title?: string | null; description?: string | null } | null
}

function sameGuide(current: GuideShape, data: ReturnType<typeof guideData>) {
  return (
    textEq(current.title, data.title) &&
    textEq(current.slug, data.slug) &&
    textEq(current.excerpt, data.excerpt) &&
    textEq(current.body, data.body) &&
    textEq(current.seo?.title, data.seo.title) &&
    textEq(current.seo?.description, data.seo.description)
  )
}

function shopData(shop: ParsedShop, townId: number, countryId: number) {
  return {
    name: shop.name.en || firstLocale(shop.name) || shop.slug,
    slug: shop.slug,
    town: townId,
    country: countryId,
    address: shop.address.en ?? null,
    phone: shop.phone,
    hours: shop.hours.en ?? null,
    lat: shop.lat,
    lng: shop.lng,
    placeId: shop.placeId,
    website: shop.website,
  }
}

function shopLocales(shop: ParsedShop) {
  return { name: shop.name, address: shop.address, hours: shop.hours }
}

type ShopShape = {
  id: number
  slug: string
  name?: string | null
  address?: string | null
  phone?: string | null
  hours?: string | null
  lat?: number | string | null
  lng?: number | string | null
  placeId?: string | null
  website?: string | null
  town?: unknown
  country?: unknown
}

function sameShop(current: ShopShape, data: ReturnType<typeof shopData>) {
  return (
    current.slug === data.slug &&
    relationId(current.town) === data.town &&
    relationId(current.country) === data.country &&
    textEq(current.name, data.name) &&
    textEq(current.address, data.address) &&
    textEq(current.phone, data.phone) &&
    textEq(current.hours, data.hours) &&
    textEq(current.placeId, data.placeId) &&
    textEq(current.website, data.website) &&
    numEq(current.lat, data.lat) &&
    numEq(current.lng, data.lng)
  )
}

async function writeLocales(
  payload: Payload,
  collection: 'countries' | 'towns' | 'shops' | 'guides',
  id: number,
  fields: Record<string, LocaleText>,
  skipEnglish: boolean,
) {
  let changed = false
  for (const locale of LOCALES) {
    if (skipEnglish && locale === 'en') continue
    const data: Record<string, string | null> = {}
    for (const [field, map] of Object.entries(fields)) {
      const value = map[locale]
      if (locale !== 'en' && !value) continue
      if (value) data[field] = value
    }
    if (!Object.keys(data).length) continue
    const current = (await payload.findByID({
      collection,
      id,
      locale,
      depth: 0,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>
    const differs = Object.entries(data).some(([field, value]) => !textEq(current[field] as string | null, value))
    if (!differs) continue
    await payload.update({
      collection,
      id,
      locale,
      overrideAccess: true,
      data,
    })
    changed = true
  }
  return changed
}

async function loadCountryIds(payload: Payload) {
  const docs = await findAll<{ id: number; code?: string }>(payload, 'countries')
  const ids = new Map<CountryCode, number>()
  for (const doc of docs) {
    if (doc.code === 'MY' || doc.code === 'SG' || doc.code === 'AU') ids.set(doc.code, doc.id)
  }
  return ids
}

async function loadTownIds(payload: Payload, countryIds: Map<CountryCode, number>) {
  const codeById = new Map<number, CountryCode>()
  for (const [code, id] of countryIds) codeById.set(id, code)
  const docs = await findAll<{ id: number; slug?: unknown; country?: unknown }>(payload, 'towns')
  const ids = new Map<string, number>()
  for (const doc of docs) {
    const country = relationId(doc.country)
    const code = typeof country === 'number' ? codeById.get(country) : undefined
    if (!code || typeof doc.slug !== 'string') continue
    ids.set(`${code}/${doc.slug}`, doc.id)
  }
  return ids
}

async function findAll<T extends { id: number }>(
  payload: Payload,
  collection: 'countries' | 'towns' | 'shops' | 'guides',
  locale?: LocaleCode,
) {
  const docs: T[] = []
  let page = 1
  while (page < 1000) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 100,
      locale,
      overrideAccess: true,
      page,
    })
    docs.push(...(result.docs as unknown as T[]))
    if (!result.hasNextPage) break
    page += 1
  }
  return docs
}

function firstLocale(value: LocaleText) {
  for (const locale of LOCALES) {
    if (value[locale]) return value[locale]
  }
  return null
}

function textEq(left: unknown, right: string | null | undefined) {
  return (typeof left === 'string' ? left : '') === (right ?? '')
}

function numEq(left: unknown, right: number | null) {
  if (left == null || left === '') return right == null
  const value = typeof left === 'number' ? left : Number(left)
  if (!Number.isFinite(value) || right == null) return false
  return Math.abs(value - right) < 0.00001
}

function errorText(error: unknown) {
  const message = error instanceof Error ? error.message : 'Upsert failed'
  return message.replace(/https?:\/\/[^@\s]+@/g, 'https://').slice(0, 300)
}
