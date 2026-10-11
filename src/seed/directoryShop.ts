import type { Payload } from 'payload'

/** A shop with no website, under Malaysia / Test Town, for claim seeds and tests. */
export async function createUnclaimedShop(
  payload: Payload,
  input: { name: string; slug: string },
) {
  const countries = await payload.find({
    collection: 'countries',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { code: { equals: 'MY' } },
  })
  const country =
    countries.docs[0] ??
    (await payload.create({
      collection: 'countries',
      data: { code: 'MY', name: 'Malaysia', slug: 'malaysia' },
      overrideAccess: true,
    }))

  const towns = await payload.find({
    collection: 'towns',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'test-town' } },
  })
  const town =
    towns.docs[0] ??
    (await payload.create({
      collection: 'towns',
      data: { country: country.id, name: 'Test Town', slug: 'test-town' },
      overrideAccess: true,
    }))

  return payload.create({
    collection: 'shops',
    data: {
      claimStatus: 'unclaimed',
      country: country.id,
      name: input.name,
      slug: input.slug,
      town: town.id,
    },
    overrideAccess: true,
  })
}
