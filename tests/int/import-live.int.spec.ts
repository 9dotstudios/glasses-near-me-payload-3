import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload, type Payload } from 'payload'
import { describe, expect, it, beforeAll } from 'vitest'

import config from '@/payload.config'
import { parseLiveSource } from '@/import/live/parse'
import { upsertLive } from '@/import/live/upsert'
import { sanitizeWebsite } from '@/import/live/website'

const fixtureRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/live-site',
)

describe('live directory parser', () => {
  const parsed = parseLiveSource(fixtureRoot)

  it('counts the sitemap and keeps Relume slugs', () => {
    expect(parsed.sitemapUrls).toBe(13)
    const optics = parsed.shops.find((shop) => shop.slug === 'd-optics-miri')
    expect(optics).toMatchObject({
      country: 'MY',
      townSlug: 'miri',
      path: 'find-a-shop/malaysia/miri/d-optics-miri',
      placeId: 'ChIJdopticsmiri0000000001',
      phone: '+60 19-413 7558',
      lat: 4.3990675,
      lng: 113.9904875,
      website: null,
      websiteBlanked: true,
      address: { en: 'Level 2, Imperial Mall, Miri' },
      hours: { en: 'Monday 10:00–19:00' },
    })
  })

  it('keeps http websites and blanks other schemes', () => {
    expect(sanitizeWebsite('https://optician.example/book')).toEqual({
      website: 'https://optician.example/book',
      blanked: false,
    })
    expect(sanitizeWebsite('instagram.com/d_optics').website).toBeNull()
    expect(sanitizeWebsite('ftp://files.example/shop').blanked).toBe(true)
    expect(sanitizeWebsite('javascript:alert(1)').website).toBeNull()

    const sight = parsed.shops.find((shop) => shop.slug === '20-20-sight-and-style-mornington')
    expect(sight?.website).toBe('http://www.sightandstyle.com.au/')
    expect(sight?.websiteBlanked).toBe(false)
    expect(sight?.address.en).toBe('1 Main Street, Mornington, AU')

    const ftp = parsed.shops.find((shop) => shop.slug === 'bad-scheme-miri')
    expect(ftp?.website).toBeNull()
    expect(ftp?.websiteBlanked).toBe(true)
  })

  it('imports towns, countries, and localized guides', () => {
    expect(parsed.countries.map((country) => country.code).sort()).toEqual(['AU', 'MY', 'SG'])
    expect(parsed.countries.find((country) => country.code === 'MY')?.name.zh).toBe('马来西亚')
    expect(parsed.towns.find((town) => town.slug === 'miri')?.name).toMatchObject({
      en: 'Miri',
      zh: '美里',
      'zh-Hant': '美里',
    })
    expect(parsed.towns.find((town) => town.slug === 'petaling-jaya')?.name.en).toBe('Petaling Jaya')
    expect(parsed.towns.find((town) => town.slug === 'mornington')?.name.en).toBe('Mornington')

    expect(parsed.guides).toHaveLength(1)
    const guide = parsed.guides[0]
    expect(guide.locales.en?.slug).toBe('guides/how-to-read-your-glasses-prescription')
    expect(guide.locales.en?.body).toContain('SPH is your main power')
    expect(guide.locales.en?.body).not.toContain('Footer note')
    expect(guide.locales.ms?.slug).toBe('ms/blog/how-to-read-glasses-prescription')
    expect(guide.locales.zh?.slug).toBe('zh/blog/how-to-read-glasses-prescription')
    expect(guide.locales['zh-Hant']?.title).toBe('如何看懂眼鏡處方')
  })

  it('records skipped rows', () => {
    const reasons = parsed.skipped.map((row) => `${row.type}:${row.key}:${row.reason}`)
    expect(reasons.some((reason) => reason.includes('Duplicate placeId'))).toBe(true)
    expect(reasons.some((reason) => reason.includes('lowercase Relume segment'))).toBe(true)
    expect(
      parsed.skipped.some(
        (row) => row.type === 'guide' && row.key === 'guides/missing-article' && row.reason.includes('no guide content'),
      ),
    ).toBe(true)
    expect(parsed.shops.some((shop) => shop.slug === 'duplicate-optics-miri')).toBe(false)
  })
})

describe('live directory upsert', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  }, 120_000)

  it('upserts the fixture twice without creating duplicates', async () => {
    const parsed = parseLiveSource(fixtureRoot)
    await upsertLive(payload, parsed)
    const second = await upsertLive(payload, parsed)

    expect(second.countries.created).toBe(0)
    expect(second.towns.created).toBe(0)
    expect(second.shops.created).toBe(0)
    expect(second.guides.created).toBe(0)
    expect(second.shops.updated).toBe(0)
    expect(second.guides.updated).toBe(0)
    expect(second.shops.unchanged).toBe(parsed.shops.length)

    const town = await payload.find({
      collection: 'towns',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: 'miri' } },
    })
    const zhTown = await payload.findByID({
      collection: 'towns',
      id: town.docs[0].id,
      locale: 'zh',
      depth: 0,
      overrideAccess: true,
    })
    expect(zhTown.name).toBe('美里')

    const shop = await payload.find({
      collection: 'shops',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { placeId: { equals: 'ChIJdopticsmiri0000000001' } },
    })
    expect(shop.docs).toHaveLength(1)
    expect(shop.docs[0]).toMatchObject({
      slug: 'd-optics-miri',
      website: null,
      hasWebsite: false,
      claimStatus: 'unclaimed',
      phone: '+60 19-413 7558',
    })

    const guide = await payload.find({
      collection: 'guides',
      depth: 0,
      limit: 1,
      locale: 'ms',
      overrideAccess: true,
      where: { slug: { equals: 'ms/blog/how-to-read-glasses-prescription' } },
    })
    expect(guide.docs[0]?.title).toContain('preskripsi')
    const hant = await payload.findByID({
      collection: 'guides',
      id: guide.docs[0].id,
      locale: 'zh-Hant',
      depth: 0,
      overrideAccess: true,
    })
    expect(hant.slug).toBe('zh-Hant/blog/how-to-read-glasses-prescription')
    expect(hant.title).toBe('如何看懂眼鏡處方')
  }, 120_000)
})
