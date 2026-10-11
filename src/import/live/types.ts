export const LOCALES = ['en', 'ms', 'zh', 'zh-Hant'] as const

export type LocaleCode = (typeof LOCALES)[number]

export type CountryCode = 'MY' | 'SG' | 'AU'

export type LocaleText = Partial<Record<LocaleCode, string>>

export type ParsedCountry = {
  code: CountryCode
  slug: string
  name: LocaleText
}

export type ParsedTown = {
  country: CountryCode
  slug: string
  name: LocaleText
}

export type ParsedShop = {
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
  website: string | null
  websiteBlanked: boolean
  /** Public path, such as find-a-shop/malaysia/miri/d-optics-miri */
  path: string
}

export type GuideLocale = {
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  seoTitle: string | null
  seoDescription: string | null
}

export type ParsedGuide = {
  /** Stable key, preferring the English Relume path. */
  key: string
  locales: Partial<Record<LocaleCode, GuideLocale>>
}

export type SkippedRow = {
  type: 'country' | 'town' | 'shop' | 'guide' | 'file'
  key: string
  reason: string
}

export type ParsedLive = {
  sitemapUrls: number
  countries: ParsedCountry[]
  towns: ParsedTown[]
  shops: ParsedShop[]
  guides: ParsedGuide[]
  skipped: SkippedRow[]
  htmlFiles: number
  dataFiles: number
}
