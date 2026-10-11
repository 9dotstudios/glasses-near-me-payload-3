import type { LiveSource } from './source'
import type { LocaleCode, LocaleText, ParsedGuide, ParsedLive, ParsedShop, SkippedRow } from './types'
import { LOCALES } from './types'

export type WriteCounts = {
  created: number
  updated: number
  unchanged: number
  skipped: number
}

export type WriteResult = {
  countries: WriteCounts
  towns: WriteCounts
  shops: WriteCounts
  guides: WriteCounts
  skipped: SkippedRow[]
}

export type ImportReport = {
  generatedAt: string
  dryRun: boolean
  source: {
    kind: LiveSource['kind']
    repo: string
    note?: string
    sitemapUrls: number
    htmlFiles: number
    dataFiles: number
    downloadFailures: number
  }
  counts: {
    countries: WriteCounts & { byCode: Record<string, number>; byLocale: Record<LocaleCode, number> }
    towns: WriteCounts & { byCountry: Record<string, number>; byLocale: Record<LocaleCode, number> }
    shops: WriteCounts & {
      byCountry: Record<string, number>
      byLocale: Record<LocaleCode, number>
      websiteKept: number
      websiteBlanked: number
      placeIdPresent: number
      placeIdMissing: number
    }
    guides: WriteCounts & { byLocale: Record<LocaleCode, number> }
  }
  skipped: SkippedRow[]
}

const EMPTY_WRITES: WriteCounts = { created: 0, updated: 0, unchanged: 0, skipped: 0 }

export function buildReport(input: {
  source: LiveSource
  parsed: ParsedLive
  writes: WriteResult | null
  dryRun: boolean
}): ImportReport {
  const { parsed, writes, dryRun, source } = input
  const skipped = [...parsed.skipped, ...(writes?.skipped ?? [])]
  return {
    generatedAt: new Date().toISOString(),
    dryRun,
    source: {
      kind: source.kind,
      repo: source.repo,
      note: source.note,
      sitemapUrls: parsed.sitemapUrls,
      htmlFiles: parsed.htmlFiles,
      dataFiles: parsed.dataFiles,
      downloadFailures: source.downloadFailures.length,
    },
    counts: {
      countries: {
        ...(writes?.countries ?? { ...EMPTY_WRITES, skipped: 0 }),
        byCode: countBy(parsed.countries, (country) => country.code),
        byLocale: countLocaleText(parsed.countries.map((country) => country.name)),
      },
      towns: {
        ...(writes?.towns ?? EMPTY_WRITES),
        byCountry: countBy(parsed.towns, (town) => town.country),
        byLocale: countLocaleText(parsed.towns.map((town) => town.name)),
      },
      shops: {
        ...(writes?.shops ?? EMPTY_WRITES),
        byCountry: countBy(parsed.shops, (shop) => shop.country),
        byLocale: countShopLocales(parsed.shops),
        websiteKept: parsed.shops.filter((shop) => shop.website).length,
        websiteBlanked: parsed.shops.filter((shop) => shop.websiteBlanked).length,
        placeIdPresent: parsed.shops.filter((shop) => shop.placeId).length,
        placeIdMissing: parsed.shops.filter((shop) => !shop.placeId).length,
      },
      guides: {
        ...(writes?.guides ?? EMPTY_WRITES),
        byLocale: countGuideLocales(parsed.guides),
      },
    },
    skipped,
  }
}

export function formatReport(report: ImportReport) {
  const lines = [
    `import:live ${report.dryRun ? 'dry run' : 'write'}`,
    `source ${report.source.kind} sitemap ${report.source.sitemapUrls} html ${report.source.htmlFiles} data ${report.source.dataFiles}`,
  ]
  if (report.source.note) lines.push(report.source.note)
  for (const type of ['countries', 'towns', 'shops', 'guides'] as const) {
    const counts = report.counts[type]
    lines.push(
      `${type} parsed-ready ${ready(type, report)} created ${counts.created} updated ${counts.updated} unchanged ${counts.unchanged} skipped ${counts.skipped}`,
    )
  }
  const shops = report.counts.shops
  lines.push(
    `shops by country MY ${shops.byCountry.MY || 0} SG ${shops.byCountry.SG || 0} AU ${shops.byCountry.AU || 0}`,
  )
  lines.push(
    `shops website kept ${shops.websiteKept} blanked ${shops.websiteBlanked} placeId ${shops.placeIdPresent} missing ${shops.placeIdMissing}`,
  )
  lines.push(`guides by locale ${LOCALES.map((locale) => `${locale} ${report.counts.guides.byLocale[locale]}`).join(' ')}`)
  lines.push(`towns by locale ${LOCALES.map((locale) => `${locale} ${report.counts.towns.byLocale[locale]}`).join(' ')}`)
  lines.push(`skipped rows ${report.skipped.length}`)
  return lines.join('\n')
}

function ready(type: 'countries' | 'towns' | 'shops' | 'guides', report: ImportReport) {
  if (type === 'countries') return Object.values(report.counts.countries.byCode).reduce((sum, value) => sum + value, 0)
  if (type === 'towns') return Object.values(report.counts.towns.byCountry).reduce((sum, value) => sum + value, 0)
  if (type === 'shops') return Object.values(report.counts.shops.byCountry).reduce((sum, value) => sum + value, 0)
  return LOCALES.reduce((sum, locale) => Math.max(sum, report.counts.guides.byLocale[locale]), 0)
}

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts: Record<string, number> = {}
  for (const item of items) {
    const name = key(item)
    counts[name] = (counts[name] || 0) + 1
  }
  return counts
}

function countLocaleText(values: LocaleText[]) {
  const counts = emptyLocales()
  for (const value of values) {
    for (const locale of LOCALES) {
      if (value[locale]) counts[locale] += 1
    }
  }
  return counts
}

function countShopLocales(shops: ParsedShop[]) {
  const counts = emptyLocales()
  for (const shop of shops) {
    for (const locale of LOCALES) {
      if (shop.name[locale] || shop.address[locale] || shop.hours[locale]) counts[locale] += 1
    }
  }
  return counts
}

function countGuideLocales(guides: ParsedGuide[]) {
  const counts = emptyLocales()
  for (const guide of guides) {
    for (const locale of LOCALES) {
      if (guide.locales[locale]) counts[locale] += 1
    }
  }
  return counts
}

function emptyLocales() {
  return { en: 0, ms: 0, zh: 0, 'zh-Hant': 0 }
}

export function emptyWrites(): WriteCounts {
  return { created: 0, updated: 0, unchanged: 0, skipped: 0 }
}
