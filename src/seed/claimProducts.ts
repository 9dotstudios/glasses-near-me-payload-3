import type { Payload } from 'payload'

import { CLAIM_PRICE_CENTS } from '@/lib/claims'

export async function seedClaimProducts(payload: Payload) {
  const shops = await payload.find({
    collection: 'shops',
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
  })

  let created = 0
  for (const shop of shops.docs) {
    const existing = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { shop: { equals: shop.id } },
    })
    if (existing.docs[0]) continue

    await payload.create({
      collection: 'products',
      data: {
        _status: 'published',
        inventory: 1,
        priceInUSD: CLAIM_PRICE_CENTS,
        priceInUSDEnabled: true,
        shop: shop.id,
        title: `Claim ${shop.name}`,
      },
      draft: false,
      overrideAccess: true,
    })
    created += 1
  }

  return { created, shops: shops.docs.length }
}
