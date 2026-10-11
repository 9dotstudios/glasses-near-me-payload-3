import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { beforeAll, describe, expect, it } from 'vitest'

import { PAY_LATER_STATUS } from '@/lib/claims'
import { placePayLaterOrder } from '@/lib/claimCheckout'
import { createUnclaimedShop } from '@/seed/directoryShop'

let payload: Payload

describe('pay later claim', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  }, 120000)

  it('claims a shop, invites a retailer, and restores stock when cancelled', async () => {
    const suffix = `${Date.now()}`
    const shop = await createUnclaimedShop(payload, {
      name: `Claim Test ${suffix}`,
      slug: `claim-test-${suffix}`,
    })
    expect(shop.hasWebsite).toBe(false)
    await payload.create({
      collection: 'products',
      data: {
        _status: 'published',
        inventory: 1,
        priceInUSD: 100,
        priceInUSDEnabled: true,
        shop: shop.id,
        title: `Claim ${shop.name}`,
      },
      draft: false,
      overrideAccess: true,
    })

    const email = `buyer-${suffix}@glassesnearme.test`
    const result = await placePayLaterOrder({
      payload,
      slug: shop.slug,
      name: 'Amina Buyer',
      email,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const claimed = await payload.findByID({
      collection: 'shops',
      id: shop.id,
      overrideAccess: true,
    })
    expect(claimed.claimStatus).toBe('claimed')

    const product = await payload.find({
      collection: 'products',
      overrideAccess: true,
      where: { shop: { equals: shop.id } },
    })
    expect(product.docs[0]?.inventory).toBe(0)

    const order = await payload.findByID({
      collection: 'orders',
      id: result.orderId,
      overrideAccess: true,
    })
    expect(order.paymentStatus).toBe(PAY_LATER_STATUS)
    expect(order.stockHeld).toBe(true)
    expect(result.inviteUrl).toContain('/admin/reset/')

    const users = await payload.find({
      collection: 'users',
      overrideAccess: true,
      where: { email: { equals: email } },
    })
    expect(users.docs[0]?.role).toBe('retailer')

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentStatus: 'cancelled' },
      overrideAccess: true,
    })

    const restoredShop = await payload.findByID({
      collection: 'shops',
      id: shop.id,
      overrideAccess: true,
    })
    expect(restoredShop.claimStatus).toBe('unclaimed')
    const restoredProduct = await payload.findByID({
      collection: 'products',
      id: product.docs[0].id,
      draft: false,
      overrideAccess: true,
    })
    expect(restoredProduct.inventory).toBe(1)

    const detached = await payload.findByID({
      collection: 'users',
      id: users.docs[0].id,
      overrideAccess: true,
    })
    const shopIds = (detached.shops ?? []).map((entry) =>
      typeof entry === 'object' && entry ? entry.id : entry,
    )
    expect(shopIds).not.toContain(shop.id)
  }, 120000)
})
