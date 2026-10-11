import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getShopPage(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const shops = await payload.find({
    collection: 'shops',
    depth: 1,
    limit: 2,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  // Shop slugs are unique per town, not globally. A single slug match is required.
  if (shops.docs.length !== 1) return null
  const shop = shops.docs[0]

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { shop: { equals: shop.id } },
  })

  return {
    ...shop,
    inventory: products.docs[0]?.inventory ?? null,
  }
}
