import { randomBytes } from 'node:crypto'

import type { Payload } from 'payload'

import { claimListingClosed, claimOfferAllowed, CLAIM_PRICE_CENTS, PAY_LATER_STATUS } from '@/lib/claims'
import { inviteRetailer } from '@/lib/retailerInvite'

export type PayLaterResult =
  | {
      ok: true
      orderId: number
      secret: string
      inviteUrl: string | null
    }
  | { ok: false; error: string }

function relationId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number') return id
  }
  return null
}

export async function placePayLaterOrder(args: {
  payload: Payload
  slug: string
  name: string
  email: string
}): Promise<PayLaterResult> {
  const name = args.name.trim()
  const email = args.email.trim().toLowerCase()
  if (!name) return { ok: false, error: 'Enter your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid email.' }

  const shops = await args.payload.find({
    collection: 'shops',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    where: { slug: { equals: args.slug } },
  })
  if (shops.docs.length !== 1) return { ok: false, error: 'Shop not found.' }
  const shop = shops.docs[0]
  if (!claimOfferAllowed(shop)) {
    return { ok: false, error: 'This shop is not open for a claim.' }
  }
  if (claimListingClosed(shop) || shop.claimStatus !== 'unclaimed') {
    return { ok: false, error: 'This shop is already claimed.' }
  }

  const products = await args.payload.find({
    collection: 'products',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { shop: { equals: shop.id } },
  })
  const product = products.docs[0]
  if (!product) return { ok: false, error: 'This shop has no claim product yet.' }
  if ((product.inventory ?? 0) < 1) {
    return { ok: false, error: 'Sold out.' }
  }

  const held = await args.payload.update({
    collection: 'products',
    data: { inventory: 0 },
    depth: 0,
    draft: false,
    overrideAccess: true,
    where: {
      and: [{ id: { equals: product.id } }, { inventory: { greater_than_equal: 1 } }],
    },
  })
  if (!held.docs?.length) return { ok: false, error: 'Sold out.' }

  const secret = randomBytes(16).toString('hex')
  try {
    await args.payload.update({
      collection: 'shops',
      id: shop.id,
      data: { claimStatus: 'claimed' },
      overrideAccess: true,
    })

    const invite = await inviteRetailer({
      payload: args.payload,
      email,
      name,
      shopId: shop.id,
    })

    const amount = typeof product.priceInUSD === 'number' ? product.priceInUSD : CLAIM_PRICE_CENTS
    const order = await args.payload.create({
      collection: 'orders',
      data: {
        amount,
        buyerName: name,
        checkoutSecret: secret,
        currency: 'USD',
        customer: invite.userId,
        customerEmail: email,
        items: [{ product: product.id, quantity: 1 }],
        paymentStatus: PAY_LATER_STATUS,
        retailerInviteUrl: invite.inviteUrl,
        shop: shop.id,
        status: 'processing',
        stockHeld: true,
      },
      overrideAccess: true,
    })

    return { ok: true, orderId: order.id, secret, inviteUrl: invite.inviteUrl ?? null }
  } catch (error) {
    await args.payload.update({
      collection: 'products',
      id: product.id,
      data: { inventory: 1 },
      draft: false,
      overrideAccess: true,
    })
    await args.payload.update({
      collection: 'shops',
      id: shop.id,
      data: { claimStatus: 'unclaimed' },
      overrideAccess: true,
    })
    args.payload.logger.error({ err: error, msg: 'Pay later claim failed' })
    return { ok: false, error: 'Could not place the claim order.' }
  }
}

export function orderShopId(shop: unknown): number | null {
  return relationId(shop)
}

export function orderCustomerId(customer: unknown): number | null {
  return relationId(customer)
}
