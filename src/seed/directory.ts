import type { Payload } from 'payload'

const COUNTRIES = [
  {
    code: 'MY',
    slug: 'malaysia',
    name: {
      en: 'Malaysia',
      ms: 'Malaysia',
      zh: '马来西亚',
      'zh-Hant': '馬來西亞',
    },
  },
  {
    code: 'SG',
    slug: 'singapore',
    name: {
      en: 'Singapore',
      ms: 'Singapura',
      zh: '新加坡',
      'zh-Hant': '新加坡',
    },
  },
  {
    code: 'AU',
    slug: 'australia',
    name: {
      en: 'Australia',
      ms: 'Australia',
      zh: '澳大利亚',
      'zh-Hant': '澳大利亞',
    },
  },
] as const

const LOCALES = ['ms', 'zh', 'zh-Hant'] as const

export async function seedDirectory(payload: Payload) {
  for (const country of COUNTRIES) {
    const existing = await payload.find({
      collection: 'countries',
      depth: 0,
      limit: 1,
      where: { code: { equals: country.code } },
    })
    if (existing.docs[0]) continue

    const created = await payload.create({
      collection: 'countries',
      locale: 'en',
      data: {
        code: country.code,
        slug: country.slug,
        name: country.name.en,
      },
    })

    for (const locale of LOCALES) {
      await payload.update({
        collection: 'countries',
        id: created.id,
        locale,
        data: { name: country.name[locale] },
      })
    }
  }
}
