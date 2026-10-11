import type { Payload } from 'payload'

import { createUnclaimedShop } from '@/seed/directoryShop'

export const TEST_RETAILER_EMAIL = 'retailer@glassesnearme.test'
export const TEST_RETAILER_PASSWORD = 'test-retailer-password'
export const TEST_SHOP_SLUG = 'test-optician'

export async function seedTestRetailer(payload: Payload) {
  const existingShop = await payload.find({
    collection: 'shops',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: TEST_SHOP_SLUG } },
  })

  const shop =
    existingShop.docs[0] ??
    (await createUnclaimedShop(payload, { name: 'Test Optician', slug: TEST_SHOP_SLUG }))

  const existingUser = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: TEST_RETAILER_EMAIL } },
  })

  const user = existingUser.docs[0]
    ? await payload.update({
        collection: 'users',
        id: existingUser.docs[0].id,
        data: {
          role: 'retailer',
          shops: [shop.id],
        },
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'users',
        data: {
          email: TEST_RETAILER_EMAIL,
          password: TEST_RETAILER_PASSWORD,
          role: 'retailer',
          shops: [shop.id],
        },
        overrideAccess: true,
      })

  return { shop, user }
}
