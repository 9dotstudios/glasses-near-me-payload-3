import configPromise from '@payload-config'
import { getPayload } from 'payload'

const LOCALES = ['en', 'ms', 'zh', 'zh-Hant'] as const

export type PublicGuide = {
  title: string
  slug?: string | null
  excerpt?: string | null
  body?: string | null
  seo?: {
    title?: string | null
    description?: string | null
  } | null
}

export function isGuidePath(path: string) {
  if (path.startsWith('guides/') && path.length > 'guides/'.length) return true
  return /^(?:ms|zh|zh-Hant)\/blog\/[^/]+$/.test(path)
}

export async function getGuideBySlug(slug: string): Promise<PublicGuide | null> {
  const payload = await getPayload({ config: await configPromise })

  for (const locale of LOCALES) {
    const result = await payload.find({
      collection: 'guides',
      depth: 0,
      limit: 1,
      locale,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: slug } },
    })
    const doc = result.docs[0] as PublicGuide | undefined
    if (!doc?.slug || doc.slug !== slug) continue
    return doc
  }

  return null
}
