import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
      overrideAccess: true,
    })
    expect(users).toBeDefined()
  })

  it('seeds the home page', async () => {
    const pages = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
    })
    expect(pages.docs[0]?.title).toBe('Home')
    expect(pages.docs[0]?.layout?.length).toBeGreaterThan(0)
  })

  it('seeds Malaysia, Singapore, and Australia', async () => {
    const countries = await payload.find({
      collection: 'countries',
      limit: 10,
      sort: 'code',
    })
    expect(countries.docs.map((country) => country.code)).toEqual(['AU', 'MY', 'SG'])

    const malaysia = countries.docs.find((country) => country.code === 'MY')
    expect(malaysia?.slug).toBe('malaysia')
    const zh = await payload.findByID({
      collection: 'countries',
      id: malaysia!.id,
      locale: 'zh',
    })
    expect(zh.name).toBe('马来西亚')
    const hant = await payload.findByID({
      collection: 'countries',
      id: malaysia!.id,
      locale: 'zh-Hant',
    })
    expect(hant.name).toBe('馬來西亞')
  })

  it('stores a shop under a town and derives hasWebsite', async () => {
    const malaysia = await payload.find({
      collection: 'countries',
      limit: 1,
      where: { code: { equals: 'MY' } },
    })
    const country = malaysia.docs[0]
    expect(country).toBeDefined()

    const stamp = Date.now()
    const town = await payload.create({
      collection: 'towns',
      data: {
        name: `Test Town ${stamp}`,
        slug: `test-town-${stamp}`,
        country: country!.id,
      },
      overrideAccess: true,
    })

    const malay = await payload.update({
      collection: 'towns',
      id: town.id,
      locale: 'ms',
      data: { name: `Bandar Ujian ${stamp}` },
      overrideAccess: true,
    })
    expect(malay.name).toBe(`Bandar Ujian ${stamp}`)

    const fallback = await payload.findByID({
      collection: 'towns',
      id: town.id,
      locale: 'zh-Hant',
    })
    expect(fallback.name).toBe(`Test Town ${stamp}`)

    await expect(
      payload.create({
        collection: 'shops',
        data: {
          name: 'Bad website',
          slug: `bad-website-${stamp}`,
          country: country!.id,
          town: town.id,
          claimStatus: 'unclaimed',
          website: 'ftp://optician.example',
        },
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({
      data: {
        errors: [
          expect.objectContaining({
            path: 'website',
            message: expect.stringMatching(/http/),
          }),
        ],
      },
    })

    const shop = await payload.create({
      collection: 'shops',
      data: {
        name: `Test Optician ${stamp}`,
        slug: `test-optician-${stamp}`,
        country: country!.id,
        town: town.id,
        claimStatus: 'unclaimed',
        address: '1 Jalan Test',
        phone: '+60300000000',
        hours: 'Mon–Fri 10:00–19:00',
        lat: 3.139,
        lng: 101.687,
        placeId: `test-place-${stamp}`,
        website: 'https://optician.example/book',
      },
      overrideAccess: true,
    })

    expect(shop.hasWebsite).toBe(true)
    expect(shop.claimStatus).toBe('unclaimed')
    expect(shop.website).toBe('https://optician.example/book')
    const countryId = typeof shop.country === 'object' ? shop.country?.id : shop.country
    expect(countryId).toBe(country!.id)

    const withoutSite = await payload.create({
      collection: 'shops',
      data: {
        name: `No site ${stamp}`,
        slug: `no-site-${stamp}`,
        country: country!.id,
        town: town.id,
        claimStatus: 'unclaimed',
      },
      overrideAccess: true,
    })
    expect(withoutSite.hasWebsite).toBe(false)
    expect(withoutSite.website ?? null).toBeNull()
  })
})
