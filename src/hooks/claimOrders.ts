import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Payload } from 'payload'

import { PAY_LATER_STATUS } from '@/lib/claims'
import { detachShopFromUser } from '@/lib/retailerInvite'
import { orderCustomerId, orderShopId } from '@/lib/claimCheckout'

type ClaimOrder = {
  id: number
  customer?: unknown
  paymentStatus?: string | null
  shop?: unknown
  status?: string | null
  stockHeld?: boolean | null
}

async function restoreClaim(payload: Payload, order: ClaimOrder) {
  const shopId = orderShopId(order.shop)
  if (shopId !== null) {
    const products = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { shop: { equals: shopId } },
    })
    const product = products.docs[0]
    if (product) {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { inventory: 1 },
        draft: false,
        overrideAccess: true,
      })
    }
    await payload.update({
      collection: 'shops',
      id: shopId,
      data: { claimStatus: 'unclaimed' },
      overrideAccess: true,
    })
    const customerId = orderCustomerId(order.customer)
    if (customerId !== null) {
      await detachShopFromUser({ payload, userId: customerId, shopId })
    }
  }
}

export const prepareClaimOrder: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (!data || operation === 'create') return data
  const previous = originalDoc as ClaimOrder | undefined
  const paymentChanged = data.paymentStatus !== previous?.paymentStatus
  const statusChanged = data.status !== previous?.status

  if (paymentChanged && data.paymentStatus === 'cancelled') data.status = 'cancelled'
  if (paymentChanged && data.paymentStatus === 'paid') data.status = 'completed'
  if (statusChanged && data.status === 'cancelled') data.paymentStatus = 'cancelled'
  if (
    statusChanged &&
    data.status === 'completed' &&
    previous?.paymentStatus === PAY_LATER_STATUS
  ) {
    data.paymentStatus = 'paid'
  }
  if (data.paymentStatus === 'cancelled' || data.status === 'cancelled') {
    data.stockHeld = false
  }
  return data
}

export const syncClaimOrder: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== 'update') return doc
  if (req.context.skipClaimSync) return doc
  const order = doc as ClaimOrder
  const previous = previousDoc as ClaimOrder | undefined
  const cancelled = order.paymentStatus === 'cancelled' || order.status === 'cancelled'
  const wasHeld = Boolean(previous?.stockHeld)
  if (cancelled && wasHeld) {
    await restoreClaim(req.payload, order)
  }
  return doc
}
