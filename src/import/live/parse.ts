import fs from 'fs'
import path from 'path'

import { sanitizeWebsite } from './website'
import type {
  CountryCode,
  GuideLocale,
  LocaleCode,
  LocaleText,
  ParsedGuide,
  ParsedLive,
  ParsedShop,
  ParsedTown,
  SkippedRow,
} from './types'
import { LOCALES } from './types'

const COUNTRY_SLUG: Record<CountryCode, string> = {
  MY: 'malaysia',
  SG: 'singapore',
  AU: 'australia',
}

const COUNTRY_FROM_SLUG: Record<string, CountryCode> = {
  malaysia: 'MY',
  singapore: 'SG',
  australia: 'AU',
}

/** Names already used by the directory seed. Source files can override a locale. */
const COUNTRY_NAMES: Record<CountryCode, Required<LocaleText>> = {
  MY: { en: 'Malaysia', ms: 'Malaysia', zh: '马来西亚', 'zh-Hant': '馬來西亞' },
  SG: { en: 'Singapore', ms: 'Singapura', zh: '新加坡', 'zh-Hant': '新加坡' },
  AU: { en: 'Australia', ms: 'Australia', zh: '澳大利亚', 'zh-Hant': '澳大利亞' },
}

const SHOP_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SHOP_PATH = /^find-a-shop\/(malaysia|singapore|australia)\/([a-z0-9-]+)\/([a-z0-9-]+)$/
const TOWN_PATH = /^find-a-shop\/(malaysia|singapore|australia)\/([a-z0-9-]+)$/
const GUIDE_PATH = /^(?:guides\/[a-z0-9-]+|(?:ms|zh|zh-Hant|zh-hant)\/blog\/[A-Za-z0-9-]+)$/
const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', 'img', 'images', '.wrangler', '.next'])

type ShopDraft = {
  country: CountryCode
  townSlug: string
  slug: string
  name: LocaleText
  address: LocaleText
  hours: LocaleText
  phone: string | null
  lat: number | null
  lng: number | null
  placeId: string | null
  websiteRaw: string | null
  path: string
}

type TownDraft = {
  country: CountryCode
  slug: string
  name: LocaleText
  placeholder: boolean
}

type GuideDraft = GuideLocale & {
  locale: LocaleCode
  alternates: Partial<Record<LocaleCode, string>>
  group: string | null
}

export function parseLiveSource(root: string): ParsedLive {
  const files = walk(root)
  const skipped: SkippedRow[] = []
  let htmlFiles = 0
  let dataFiles = 0
  let sitemapUrls = 0
  let bestSitemap = 0

  const towns = new Map<string, TownDraft>()
  const shops = new Map<string, ShopDraft>()
  const guides = new Map<string, GuideDraft>()
  const countryNames: Record<CountryCode, LocaleText> = {
    MY: { ...COUNTRY_NAMES.MY },
    SG: { ...COUNTRY_NAMES.SG },
    AU: { ...COUNTRY_NAMES.AU },
  }

  const htmlPaths: string[] = []
  const dataPaths: string[] = []
  const markdownPaths: string[] = []
  const sitemaps: string[] = []
  const sitemapGuidePaths = new Set<string>()

  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/')
    if (rel === 'sitemap.xml' || rel.endsWith('/sitemap.xml')) sitemaps.push(file)
    else if (file.endsWith('.html') || file.endsWith('.htm')) htmlPaths.push(file)
    else if (/\.(json|jsonl|csv)$/i.test(file)) dataPaths.push(file)
    else if (/\.mdx?$/i.test(file)) markdownPaths.push(file)
  }

  for (const file of sitemaps) {
    const text = readText(file)
    if (text == null) {
      skipped.push({ type: 'file', key: path.basename(file), reason: 'Could not read sitemap' })
      continue
    }
    const urls = sitemapLocs(text)
    if (urls.length > bestSitemap) {
      bestSitemap = urls.length
      sitemapUrls = urls.length
    }
    for (const url of urls) {
      const publicPath = pathFromUrl(url)
      if (!publicPath) continue
      const shop = publicPath.match(SHOP_PATH)
      if (shop) {
        ensureShop(shops, shop[1], shop[2], shop[3])
        ensureTown(towns, COUNTRY_FROM_SLUG[shop[1]], shop[2])
        continue
      }
      const town = publicPath.match(TOWN_PATH)
      if (town) {
        ensureTown(towns, COUNTRY_FROM_SLUG[town[1]], town[2])
        continue
      }
      if (GUIDE_PATH.test(publicPath) && !isGuideIndex(publicPath)) sitemapGuidePaths.add(publicPath)
    }
  }

  for (const file of htmlPaths) {
    const text = readText(file)
    if (text == null) continue
    htmlFiles += 1
    const publicPath = canonicalPath(text) || publicPathFromFile(root, file)
    if (!publicPath) continue
    applyHtml(publicPath, text, towns, shops, guides)
  }

  for (const file of dataPaths) {
    const text = readText(file)
    if (text == null) {
      skipped.push({ type: 'file', key: path.relative(root, file), reason: 'Could not read data file' })
      continue
    }
    dataFiles += 1
    try {
      consumeDataFile(text, file, towns, shops, guides, countryNames, skipped)
    } catch (error) {
      skipped.push({
        type: 'file',
        key: path.relative(root, file),
        reason: error instanceof Error ? error.message : 'Could not parse data file',
      })
    }
  }

  for (const file of markdownPaths) {
    const text = readText(file)
    if (text == null) continue
    dataFiles += 1
    const rel = path.relative(root, file).split(path.sep).join('/')
    applyMarkdown(rel, text, guides, skipped)
  }

  const countries = (Object.keys(COUNTRY_NAMES) as CountryCode[]).map((code) => ({
    code,
    slug: COUNTRY_SLUG[code],
    name: countryNames[code],
  }))

  const parsedTowns: ParsedTown[] = []
  for (const town of towns.values()) {
    if (!SHOP_SLUG.test(town.slug)) {
      skipped.push({ type: 'town', key: `${town.country}/${town.slug}`, reason: 'Slug is not a lowercase Relume segment' })
      continue
    }
    const name = withFallbackName(town.name, titleFromSlug(town.slug))
    parsedTowns.push({ country: town.country, slug: town.slug, name })
  }

  const placeOwners = new Map<string, string>()
  const parsedShops: ParsedShop[] = []
  for (const shop of shops.values()) {
    const name = firstText(shop.name)
    if (!name) {
      skipped.push({ type: 'shop', key: shop.path, reason: 'Missing name' })
      continue
    }
    if (!SHOP_SLUG.test(shop.slug)) {
      skipped.push({ type: 'shop', key: shop.path, reason: 'Slug is not a lowercase Relume segment' })
      continue
    }
    if (!SHOP_SLUG.test(shop.townSlug)) {
      skipped.push({ type: 'shop', key: shop.path, reason: 'Town slug is not a lowercase Relume segment' })
      continue
    }
    if (shop.placeId) {
      const owner = placeOwners.get(shop.placeId)
      if (owner && owner !== shop.path) {
        skipped.push({
          type: 'shop',
          key: shop.path,
          reason: `Duplicate placeId ${shop.placeId} already used by ${owner}`,
        })
        continue
      }
      placeOwners.set(shop.placeId, shop.path)
    }
    const website = sanitizeWebsite(shop.websiteRaw)
    if (!towns.has(townKey(shop.country, shop.townSlug))) {
      ensureTown(towns, shop.country, shop.townSlug)
      parsedTowns.push({
        country: shop.country,
        slug: shop.townSlug,
        name: { en: titleFromSlug(shop.townSlug) },
      })
    }
    parsedShops.push({
      country: shop.country,
      townSlug: shop.townSlug,
      slug: shop.slug,
      name: shop.name.en ? shop.name : { ...shop.name, en: name },
      address: shop.address,
      hours: shop.hours,
      phone: shop.phone,
      lat: inRange(shop.lat, -90, 90),
      lng: inRange(shop.lng, -180, 180),
      placeId: shop.placeId,
      website: website.website,
      websiteBlanked: website.blanked,
      path: shop.path,
    })
  }

  const parsedGuides = clusterGuides(guides, skipped)
  const seenGuidePaths = new Set<string>()
  for (const guide of parsedGuides) {
    for (const locale of LOCALES) {
      const content = guide.locales[locale]
      if (content) seenGuidePaths.add(content.slug)
    }
  }
  for (const publicPath of sitemapGuidePaths) {
    if (!seenGuidePaths.has(publicPath)) {
      skipped.push({ type: 'guide', key: publicPath, reason: 'Sitemap URL has no guide content' })
    }
  }

  return {
    sitemapUrls,
    countries,
    towns: parsedTowns,
    shops: parsedShops,
    guides: parsedGuides,
    skipped,
    htmlFiles,
    dataFiles,
  }
}

function applyHtml(
  publicPath: string,
  html: string,
  towns: Map<string, TownDraft>,
  shops: Map<string, ShopDraft>,
  guides: Map<string, GuideDraft>,
) {
  const shopMatch = publicPath.match(SHOP_PATH)
  if (shopMatch) {
    const country = COUNTRY_FROM_SLUG[shopMatch[1]]
    const draft = ensureShop(shops, shopMatch[1], shopMatch[2], shopMatch[3])
    const town = ensureTown(towns, country, shopMatch[2])
    const ld = opticianLd(html)
    const name = textOrNull(ld?.name) || headingText(html)
    const address = formatAddress(ld?.address) || listingAddress(html)
    const phone = textOrNull(ld?.telephone) || phoneFromHtml(html)
    const hours = hoursFromSpec(ld?.openingHoursSpecification) || hoursFromTable(html)
    const geo = geoFromLd(ld)
    const websiteRaw = websiteFromLd(ld) || websiteFromHtml(html)
    const townName = linkedText(html, `find-a-shop/${shopMatch[1]}/${shopMatch[2]}`)
    fillText(draft.name, 'en', name)
    fillText(draft.address, 'en', address)
    fillText(draft.hours, 'en', hours)
    if (!draft.phone && phone) draft.phone = phone
    if (draft.lat == null && geo.lat != null) draft.lat = geo.lat
    if (draft.lng == null && geo.lng != null) draft.lng = geo.lng
    if (!draft.websiteRaw && websiteRaw) draft.websiteRaw = websiteRaw
    if (townName) setTownName(town, 'en', townName)
    return
  }

  const townMatch = publicPath.match(TOWN_PATH)
  if (townMatch) {
    const town = ensureTown(towns, COUNTRY_FROM_SLUG[townMatch[1]], townMatch[2])
    const fromLink = linkedText(html, publicPath)
    const fromHeading = townNameFromHeading(headingText(html))
    setTownName(town, 'en', fromLink || fromHeading)
    return
  }

  if (!GUIDE_PATH.test(publicPath) || isGuideIndex(publicPath)) return
  const locale = localeFromHtml(html, publicPath)
  const title = blogTitle(html) || headingText(html)
  if (!title) return
  const description = metaContent(html, 'description') || blogDescription(html)
  guides.set(publicPath, {
    locale,
    slug: publicPath,
    title,
    excerpt: description,
    body: guideBody(html),
    seoTitle: metaContent(html, 'og:title') || title,
    seoDescription: description,
    alternates: alternatesFromHtml(html),
    group: null,
  })
}

function consumeDataFile(
  text: string,
  file: string,
  towns: Map<string, TownDraft>,
  shops: Map<string, ShopDraft>,
  guides: Map<string, GuideDraft>,
  countryNames: Record<CountryCode, LocaleText>,
  skipped: SkippedRow[],
) {
  if (file.endsWith('.csv')) {
    for (const row of parseCsv(text)) consumeRecord(row, towns, shops, guides, countryNames, skipped, file)
    return
  }
  const trimmed = text.replace(/^\uFEFF/, '').trim()
  if (!trimmed) return
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    consumeJson(JSON.parse(trimmed), towns, shops, guides, countryNames, skipped, file)
    return
  }
  for (const line of trimmed.split('\n')) {
    const row = line.trim()
    if (!row) continue
    consumeJson(JSON.parse(row), towns, shops, guides, countryNames, skipped, file)
  }
}

function consumeJson(
  value: unknown,
  towns: Map<string, TownDraft>,
  shops: Map<string, ShopDraft>,
  guides: Map<string, GuideDraft>,
  countryNames: Record<CountryCode, LocaleText>,
  skipped: SkippedRow[],
  file: string,
) {
  if (Array.isArray(value)) {
    for (const item of value) consumeJson(item, towns, shops, guides, countryNames, skipped, file)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (looksLikeShop(record)) {
    applyShopRecord(record, towns, shops)
    return
  }
  if (looksLikeGuide(record)) {
    applyGuideRecord(record, guides, skipped, file)
    return
  }
  if (looksLikeTown(record)) {
    applyTownRecord(record, towns)
    return
  }
  if (looksLikeCountry(record)) {
    applyCountryRecord(record, countryNames)
    return
  }
  for (const key of ['shops', 'towns', 'guides', 'countries', 'places', 'listings', 'items', 'results', 'data', 'nav']) {
    if (key in record) consumeJson(record[key], towns, shops, guides, countryNames, skipped, file)
  }
}

function consumeRecord(
  record: Record<string, unknown>,
  towns: Map<string, TownDraft>,
  shops: Map<string, ShopDraft>,
  guides: Map<string, GuideDraft>,
  countryNames: Record<CountryCode, LocaleText>,
  skipped: SkippedRow[],
  file: string,
) {
  consumeJson(record, towns, shops, guides, countryNames, skipped, file)
}

function applyShopRecord(record: Record<string, unknown>, towns: Map<string, TownDraft>, shops: Map<string, ShopDraft>) {
  const fromPath = pathFromUrl(firstString(record.url) || firstString(record.path) || firstString(record.href) || '')
  const shopMatch = fromPath?.match(SHOP_PATH)
  const country =
    countryCode(record.country) ||
    countryCode(record.countryCode) ||
    countryCode(record.country_code) ||
    (shopMatch ? COUNTRY_FROM_SLUG[shopMatch[1]] : null)
  const townSlug = shopMatch?.[2] || slugField(record.town) || slugField(record.town_slug) || slugField(record.townSlug) || slugField(record.city)
  const slug = shopMatch?.[3] || slugField(record.slug)
  if (!country || !townSlug || !slug) return
  const draft = ensureShop(shops, COUNTRY_SLUG[country], townSlug, slug)
  const town = ensureTown(towns, country, townSlug)
  const name = asLocaleMap(record.name) || asLocaleMap(record.title)
  const address = asLocaleMap(record.address)
  const hours = asLocaleMap(record.hours) || asLocaleMap(hoursToText(record.opening_hours || record.openingHours || record.hours))
  overrideText(draft.name, name)
  overrideText(draft.address, address)
  overrideText(draft.hours, hours)
  const phone = firstString(record.phone) || firstString(record.telephone)
  if (phone) draft.phone = phone
  const lat = asNumber(record.lat ?? record.latitude)
  const lng = asNumber(record.lng ?? record.longitude ?? record.lon)
  if (lat != null) draft.lat = lat
  if (lng != null) draft.lng = lng
  const placeId = firstString(record.placeId) || firstString(record.place_id) || firstString(record.googlePlaceId)
  if (placeId) draft.placeId = placeId
  const website = firstString(record.website) || firstString(record.url_website) || firstString(record.site)
  if (website) draft.websiteRaw = website
  const townName = asLocaleMap(record.town_name) || asLocaleMap(record.townName)
  if (townName) {
    overrideText(town.name, townName)
    town.placeholder = false
  }
}

function applyTownRecord(record: Record<string, unknown>, towns: Map<string, TownDraft>) {
  const country =
    countryCode(record.country) || countryCode(record.countryCode) || countryCode(record.country_code)
  const slug = slugField(record.slug)
  if (!country || !slug) return
  const town = ensureTown(towns, country, slug)
  const name = asLocaleMap(record.name) || asLocaleMap(record.names) || asLocaleMap(record.nameLocalized)
  if (name) {
    overrideText(town.name, name)
    town.placeholder = false
  }
}

function applyCountryRecord(record: Record<string, unknown>, countryNames: Record<CountryCode, LocaleText>) {
  const code = countryCode(record.code) || countryCode(record.country)
  if (!code) return
  const name = asLocaleMap(record.name) || asLocaleMap(record.names)
  if (name) overrideText(countryNames[code], name)
}

function applyGuideRecord(
  record: Record<string, unknown>,
  guides: Map<string, GuideDraft>,
  skipped: SkippedRow[],
  file: string,
) {
  const locale = localeCode(record.locale) || 'en'
  const slug = normalizeGuidePath(firstString(record.slug) || firstString(record.path) || pathFromUrl(firstString(record.url) || '') || '')
  const titleMap = asLocaleMap(record.title) || asLocaleMap(record.headline)
  const title = titleMap?.[locale] || titleMap?.en || firstText(titleMap)
  if (!slug || !title || isGuideIndex(slug) || !GUIDE_PATH.test(slug)) {
    skipped.push({ type: 'guide', key: slug || path.basename(file), reason: 'Guide is missing a live path or title' })
    return
  }
  const bodyMap = asLocaleMap(record.body) || asLocaleMap(record.content) || asLocaleMap(record.html)
  const body = bodyMap?.[locale] || bodyMap?.en || firstText(bodyMap)
  const excerptMap = asLocaleMap(record.excerpt) || asLocaleMap(record.description)
  const excerpt = excerptMap?.[locale] || excerptMap?.en || firstText(excerptMap)
  const groupRaw = firstString(record.group) || firstString(record.canonical) || firstString(record.translationKey) || ''
  const group = groupRaw ? pathFromUrl(groupRaw) || normalizeGuidePath(groupRaw) : ''
  guides.set(slug, {
    locale,
    slug,
    title,
    excerpt,
    body,
    seoTitle: firstString(record.seoTitle) || title,
    seoDescription: excerpt,
    alternates: {},
    group: group || null,
  })
}

function applyMarkdown(rel: string, text: string, guides: Map<string, GuideDraft>, skipped: SkippedRow[]) {
  const front = parseFrontmatter(text)
  if (!front) return
  const data = front.data
  const inferred = guidePathFromFile(rel)
  const record: Record<string, unknown> = {
    ...data,
    body: front.body.trim(),
    slug: data.slug || inferred,
    locale: data.locale || localeFromPath(data.slug || inferred || rel),
  }
  applyGuideRecord(record, guides, skipped, rel)
}

function clusterGuides(guides: Map<string, GuideDraft>, skipped: SkippedRow[]): ParsedGuide[] {
  const parent = new Map<string, string>()
  const find = (value: string): string => {
    if (!parent.has(value)) parent.set(value, value)
    let root = value
    while (parent.get(root) !== root) root = parent.get(root) as string
    let cursor = value
    while (parent.get(cursor) !== root) {
      const next = parent.get(cursor) as string
      parent.set(cursor, root)
      cursor = next
    }
    return root
  }
  const union = (left: string, right: string) => {
    const a = find(left)
    const b = find(right)
    if (a !== b) parent.set(a, b)
  }

  for (const guide of guides.values()) {
    find(guide.slug)
    for (const alternate of Object.values(guide.alternates)) {
      if (alternate) union(guide.slug, alternate)
    }
    if (guide.group && guide.group !== guide.slug) union(guide.slug, guide.group)
  }

  const groups = new Map<string, GuideDraft[]>()
  for (const guide of guides.values()) {
    const root = find(guide.slug)
    const list = groups.get(root) || []
    list.push(guide)
    groups.set(root, list)
  }

  const parsed: ParsedGuide[] = []
  for (const [root, list] of groups) {
    const locales: ParsedGuide['locales'] = {}
    for (const guide of list) {
      const current = locales[guide.locale]
      if (current && (current.body?.length || 0) >= (guide.body?.length || 0)) continue
      locales[guide.locale] = {
        slug: guide.slug,
        title: guide.title,
        excerpt: guide.excerpt,
        body: guide.body,
        seoTitle: guide.seoTitle,
        seoDescription: guide.seoDescription,
      }
    }
    if (!locales.en && !locales.ms && !locales.zh && !locales['zh-Hant']) {
      skipped.push({ type: 'guide', key: root, reason: 'Guide group has no locale content' })
      continue
    }
    const key = locales.en?.slug || list.find((item) => item.group)?.group || list[0].slug
    parsed.push({ key, locales })
  }
  return parsed.sort((a, b) => a.key.localeCompare(b.key))
}

function ensureShop(shops: Map<string, ShopDraft>, countrySlug: string, townSlug: string, slug: string) {
  const country = COUNTRY_FROM_SLUG[countrySlug]
  const key = `${country}/${townSlug}/${slug}`
  const existing = shops.get(key)
  if (existing) return existing
  const draft: ShopDraft = {
    country,
    townSlug,
    slug,
    name: {},
    address: {},
    hours: {},
    phone: null,
    lat: null,
    lng: null,
    placeId: null,
    websiteRaw: null,
    path: `find-a-shop/${countrySlug}/${townSlug}/${slug}`,
  }
  shops.set(key, draft)
  return draft
}

function ensureTown(towns: Map<string, TownDraft>, country: CountryCode, slug: string) {
  const key = townKey(country, slug)
  const existing = towns.get(key)
  if (existing) return existing
  const draft: TownDraft = {
    country,
    slug,
    name: { en: titleFromSlug(slug) },
    placeholder: true,
  }
  towns.set(key, draft)
  return draft
}

function setTownName(town: TownDraft, locale: LocaleCode, name: string | null) {
  if (!name) return
  if (!town.placeholder && town.name[locale]) return
  town.name[locale] = name
  if (locale === 'en') town.placeholder = false
}

function townKey(country: CountryCode, slug: string) {
  return `${country}/${slug}`
}

function fillText(target: LocaleText, locale: LocaleCode, value: string | null) {
  if (!value || target[locale]) return
  target[locale] = value
}

function overrideText(target: LocaleText, value: LocaleText | null) {
  if (!value) return
  for (const locale of LOCALES) {
    const next = value[locale]
    if (next) target[locale] = next
  }
}

function withFallbackName(name: LocaleText, fallback: string): LocaleText {
  if (firstText(name)) return name.en ? name : { ...name, en: firstText(name) as string }
  return { en: fallback }
}

function looksLikeShop(record: Record<string, unknown>) {
  const name = asLocaleMap(record.name) || asLocaleMap(record.title)
  if (!name) return false
  const detailKeys = ['place_id', 'placeId', 'googlePlaceId', 'lat', 'latitude', 'address', 'phone', 'telephone', 'website', 'hours']
  const hasDetail = detailKeys.some((key) => {
    const value = record[key]
    return value != null && value !== ''
  })
  const publicPath = pathFromUrl(firstString(record.url) || firstString(record.path) || firstString(record.href) || '')
  const hasPlace = Boolean(
    (publicPath && SHOP_PATH.test(publicPath)) || record.town || record.town_slug || record.townSlug || record.city,
  )
  return hasDetail && hasPlace
}

function looksLikeGuide(record: Record<string, unknown>) {
  const title = asLocaleMap(record.title) || asLocaleMap(record.headline)
  const slug = firstString(record.slug) || firstString(record.path)
  const body = record.body || record.content || record.html || record.markdown
  return Boolean(title && slug && (typeof body === 'string' || asLocaleMap(body)))
}

function looksLikeTown(record: Record<string, unknown>) {
  return Boolean(
    slugField(record.slug) &&
      (countryCode(record.country) || countryCode(record.countryCode) || countryCode(record.country_code)) &&
      (asLocaleMap(record.name) || asLocaleMap(record.names)) &&
      !looksLikeShop(record),
  )
}

function looksLikeCountry(record: Record<string, unknown>) {
  const code = countryCode(record.code) || countryCode(record.country)
  return Boolean(code && (asLocaleMap(record.name) || asLocaleMap(record.names)) && !record.town && !record.placeId && !record.place_id)
}

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile() && fs.statSync(full).size <= 8_000_000) out.push(full)
  }
  return out
}

function readText(file: string) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }
}

function sitemapLocs(xml: string) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeHtml(match[1].trim()))
}

export function pathFromUrl(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = trimmed.startsWith('http') ? new URL(trimmed) : new URL(trimmed, 'https://glassesnearme.org')
    const pathname = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '')
    return pathname || null
  } catch {
    return null
  }
}

function publicPathFromFile(root: string, file: string) {
  let rel = path.relative(root, file).split(path.sep).join('/')
  rel = rel.replace(/^(?:public|dist|out|site|build|www)\//, '')
  rel = rel.replace(/\/index\.html?$/i, '').replace(/\.html?$/i, '')
  if (!rel || rel.startsWith('..')) return null
  return rel
}

function canonicalPath(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]
  const href = tag ? attr(tag, 'href') : null
  return pathFromUrl(href)
}

function opticianLd(html: string) {
  for (const block of ldBlocks(html)) {
    if (isOptician(block)) return block
  }
  return null
}

function ldBlocks(html: string) {
  const out: Record<string, unknown>[] = []
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      flattenLd(JSON.parse(match[1]), out)
    } catch {
      // Generated pages sometimes embed a second, non-JSON script. Skip that block.
    }
  }
  return out
}

function flattenLd(value: unknown, out: Record<string, unknown>[]) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    for (const item of value) flattenLd(item, out)
    return
  }
  const record = value as Record<string, unknown>
  if (Array.isArray(record['@graph'])) flattenLd(record['@graph'], out)
  out.push(record)
}

function isOptician(record: Record<string, unknown>) {
  const type = record['@type']
  const types = Array.isArray(type) ? type : [type]
  return types.some((item) => typeof item === 'string' && /optician|store|localbusiness/i.test(item))
}

function headingText(html: string) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  return match ? htmlToText(match[1]) : null
}

function blogTitle(html: string) {
  for (const block of ldBlocks(html)) {
    const type = block['@type']
    const types = Array.isArray(type) ? type : [type]
    if (types.some((item) => typeof item === 'string' && /blog|article/i.test(item))) {
      return textOrNull(block.headline) || textOrNull(block.name)
    }
  }
  return null
}

function blogDescription(html: string) {
  for (const block of ldBlocks(html)) {
    const description = textOrNull(block.description)
    if (description) return description
  }
  return null
}

function guideBody(html: string) {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
  const source = article || html
  const withoutChrome = source
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
  const afterHeading = withoutChrome.split(/<h1\b[^>]*>/i)[1] || ''
  const afterClose = afterHeading.replace(/^[\s\S]*?<\/h1>/i, '')
  const text = htmlToText(afterClose).replace(/^Glasses Near Me\s·\s.*$/m, '').trim()
  return text || null
}

function listingAddress(html: string) {
  const match = html.match(/<h3[^>]*>\s*Listing\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/i)
  return match ? htmlToText(match[1]) : null
}

function phoneFromHtml(html: string) {
  const match = html.match(/href=["']tel:([^"']+)["']/i)
  if (!match) return null
  const visible = html.match(/href=["']tel:[^"']+["'][^>]*>([\s\S]*?)<\/a>/i)
  const text = visible ? htmlToText(visible[1]) : ''
  if (text && !/^call\b/i.test(text)) return text
  return decodeHtml(match[1])
}

function websiteFromLd(ld: Record<string, unknown> | null) {
  if (!ld) return null
  const sameAs = firstString(ld.sameAs)
  if (!sameAs || sameAs.includes('glassesnearme.org')) return null
  return sameAs
}

function websiteFromHtml(html: string) {
  const labelled = html.match(/Website<\/dt>[\s\S]{0,400}?href=["']([^"']+)["']/i)
  if (labelled && isExternalAttempt(labelled[1])) return decodeHtml(labelled[1])
  const button = html.match(/href=["']([^"']+)["'][^>]*>\s*View Website/i)
  if (button && isExternalAttempt(button[1])) return decodeHtml(button[1])
  return null
}

function isExternalAttempt(value: string) {
  if (!value || value.startsWith('/') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('#')) {
    return false
  }
  return !value.includes('glassesnearme.org')
}

function hoursFromTable(html: string) {
  const lines: string[] = []
  for (const match of html.matchAll(/<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi)) {
    const day = htmlToText(match[1])
    const hours = htmlToText(match[2])
    if (day && hours) lines.push(`${day} ${hours}`)
  }
  return lines.length ? lines.join('\n') : null
}

function hoursFromSpec(spec: unknown) {
  const list = Array.isArray(spec) ? spec : spec ? [spec] : []
  const lines: string[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const dayValue = Array.isArray(row.dayOfWeek) ? row.dayOfWeek[0] : row.dayOfWeek
    if (typeof dayValue !== 'string') continue
    const day = dayValue.split('/').pop() || dayValue
    const opens = typeof row.opens === 'string' ? row.opens : ''
    const closes = typeof row.closes === 'string' ? row.closes : ''
    if (!opens && !closes) continue
    lines.push(`${day} ${opens}–${closes}`.trim())
  }
  return lines.length ? lines.join('\n') : null
}

function hoursToText(value: unknown) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const lines = value
      .map((item) => {
        if (!item || typeof item !== 'object') return ''
        const row = item as Record<string, unknown>
        const day = firstString(row.day) || firstString(row.dayOfWeek)
        const opens = firstString(row.opens) || firstString(row.open)
        const closes = firstString(row.closes) || firstString(row.close)
        if (!day) return ''
        return `${day} ${opens || ''}${closes ? `–${closes}` : ''}`.trim()
      })
      .filter(Boolean)
    return lines.length ? lines.join('\n') : null
  }
  if (value && typeof value === 'object') {
    const lines = Object.entries(value as Record<string, unknown>)
      .map(([day, hours]) => (typeof hours === 'string' ? `${day} ${hours}` : ''))
      .filter(Boolean)
    return lines.length ? lines.join('\n') : null
  }
  return null
}

function geoFromLd(ld: Record<string, unknown> | null) {
  const geo = ld?.geo
  if (!geo || typeof geo !== 'object') return { lat: null, lng: null }
  const record = geo as Record<string, unknown>
  return { lat: asNumber(record.latitude), lng: asNumber(record.longitude) }
}

function formatAddress(address: unknown) {
  if (typeof address === 'string' && address.trim()) return address.trim()
  if (!address || typeof address !== 'object') return null
  const record = address as Record<string, unknown>
  const parts = ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry']
    .map((key) => (typeof record[key] === 'string' ? record[key].trim() : ''))
    .filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

function linkedText(html: string, publicPath: string) {
  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    if (pathFromUrl(match[1]) === publicPath) {
      const text = htmlToText(match[2])
      if (text) return text
    }
  }
  return null
}

function townNameFromHeading(heading: string | null) {
  if (!heading) return null
  const match = heading.match(/\bin\s+(.+)$/i)
  return match ? match[1].replace(/\s+—.*$/, '').trim() : null
}

function alternatesFromHtml(html: string) {
  const alternates: Partial<Record<LocaleCode, string>> = {}
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(tag[0], 'rel')
    if (rel !== 'alternate') continue
    const lang = localeCode(attr(tag[0], 'hreflang'))
    const href = pathFromUrl(attr(tag[0], 'href'))
    if (!lang || !href || isGuideIndex(href)) continue
    alternates[lang] = href
  }
  return alternates
}

function localeFromHtml(html: string, publicPath: string) {
  const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1]
  return localeCode(lang) || localeFromPath(publicPath)
}

function localeFromPath(publicPath: string): LocaleCode {
  if (publicPath.startsWith('ms/')) return 'ms'
  if (publicPath.startsWith('zh-Hant/') || publicPath.startsWith('zh-hant/')) return 'zh-Hant'
  if (publicPath.startsWith('zh/')) return 'zh'
  return 'en'
}

function localeCode(value: unknown): LocaleCode | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (normalized === 'en' || normalized.toLowerCase() === 'en') return 'en'
  if (normalized === 'ms') return 'ms'
  if (normalized === 'zh' || normalized.toLowerCase() === 'zh-cn' || normalized.toLowerCase() === 'zh-hans') return 'zh'
  if (normalized === 'zh-Hant' || normalized.toLowerCase() === 'zh-hant' || normalized.toLowerCase() === 'zh-tw' || normalized.toLowerCase() === 'zh-hk') {
    return 'zh-Hant'
  }
  return null
}

function isGuideIndex(publicPath: string) {
  return publicPath === 'guides' || publicPath === 'ms/blog' || publicPath === 'zh/blog' || publicPath === 'zh-Hant/blog' || publicPath === 'zh-hant/blog'
}

function normalizeGuidePath(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, '')
}

function guidePathFromFile(rel: string) {
  const match = rel.match(/(guides\/[a-z0-9-]+|(?:ms|zh|zh-Hant|zh-hant)\/blog\/[A-Za-z0-9-]+)/)
  return match ? match[1] : null
}

function parseFrontmatter(text: string) {
  if (!text.startsWith('---')) return null
  const end = text.indexOf('\n---', 3)
  if (end === -1) return null
  const data: Record<string, string> = {}
  for (const line of text.slice(3, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue
    data[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
  }
  return { data, body: text.slice(end + 4).replace(/^\r?\n/, '') }
}

function countryCode(value: unknown): CountryCode | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'my' || normalized === 'malaysia') return 'MY'
  if (normalized === 'sg' || normalized === 'singapore') return 'SG'
  if (normalized === 'au' || normalized === 'australia') return 'AU'
  return null
}

function slugField(value: unknown) {
  if (typeof value !== 'string') return null
  const slug = value.trim().toLowerCase().replace(/^\/+|\/+$/g, '')
  return slug || null
}

function asLocaleMap(value: unknown): LocaleText | null {
  if (typeof value === 'string' && value.trim()) return { en: decodeHtml(value.trim()) }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const out: LocaleText = {}
  const record = value as Record<string, unknown>
  for (const locale of LOCALES) {
    const text = textOrNull(record[locale])
    if (text) out[locale] = text
  }
  return Object.keys(out).length ? out : null
}

function firstText(value: LocaleText | null | undefined) {
  if (!value) return null
  for (const locale of LOCALES) {
    if (value[locale]) return value[locale] as string
  }
  return null
}

function firstString(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) return item.trim()
    }
  }
  return null
}

function textOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? decodeHtml(value.trim()) : null
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function inRange(value: number | null, min: number, max: number) {
  if (value == null || value < min || value > max) return null
  return value
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))
  return match ? decodeHtml(match[1]) : null
}

function metaContent(html: string, name: string) {
  const escaped = name.replace(':', '\\:')
  const first = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'))
  const second = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, 'i'))
  const value = first?.[1] || second?.[1]
  return value ? decodeHtml(value) : null
}

export function htmlToText(html: string) {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h1|h2|h3|h4|li|tr|div|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
  return decodeHtml(withBreaks)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const source = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i += 1
        } else quoted = false
      } else cell += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') cell += char
  }
  if (cell.length || row.length) {
    row.push(cell)
    rows.push(row)
  }
  const [header, ...body] = rows.filter((item) => item.some((value) => value.trim()))
  if (!header) return []
  return body.map((values) => {
    const record: Record<string, unknown> = {}
    header.forEach((key, index) => {
      record[key.trim()] = values[index]?.trim() ?? ''
    })
    return record
  })
}
