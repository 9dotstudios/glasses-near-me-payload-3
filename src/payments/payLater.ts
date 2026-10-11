import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { PAY_LATER_STATUS } from '@/lib/claims'

/**
 * Default payment method. No provider call. Confirming records a pending order;
 * the storefront uses `placePayLaterOrder` so the retailer invite can be returned
 * on the confirmation page. This adapter keeps the same payment method available
 * on `/api/payments/pay-later/*`.
 */
export function payLaterAdapter(): PaymentAdapter {
  return {
    name: 'pay-later',
    label: 'Pay later',
    group: {
      name: 'payLater',
      type: 'group',
      label: 'Pay later',
      admin: {
        condition: (data) => data?.paymentMethod === 'pay-later',
      },
      fields: [
        {
          name: 'note',
          type: 'text',
          defaultValue: PAY_LATER_STATUS,
          label: 'Note',
        },
      ],
    },
    initiatePayment: async ({ data, req, transactionsSlug }) => {
      const transaction = await req.payload.create({
        collection: transactionsSlug as 'transactions',
        data: {
          amount: typeof data.cart.subtotal === 'number' ? data.cart.subtotal : 0,
          cart: typeof data.cart.id === 'number' ? data.cart.id : undefined,
          currency: 'USD',
          customerEmail: data.customerEmail,
          items: data.cart.items?.map((item) => ({
            product: typeof item.product === 'number' ? item.product : item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod: 'pay-later',
          payLater: { note: PAY_LATER_STATUS },
          status: 'pending',
        },
        overrideAccess: true,
        req,
      })

      return {
        message: 'Pay later payment recorded as pending.',
        transactionID: transaction.id,
      }
    },
    confirmOrder: async ({ data, finalizeOrder, req }) => {
      const transactionID = Number(data.transactionID)
      if (!Number.isFinite(transactionID)) {
        throw new Error('Pay later confirmation needs a transaction.')
      }
      const order = await finalizeOrder({
        orderData: {
          customerEmail: data.customerEmail,
          paymentStatus: PAY_LATER_STATUS,
          status: 'processing',
          stockHeld: true,
        },
        transactionID,
      })
      const orderID = Number(order.id)
      req.payload.logger.info({
        msg: `Pay later order ${orderID} recorded with status ${PAY_LATER_STATUS}.`,
      })
      return {
        message: `Order recorded as ${PAY_LATER_STATUS}.`,
        orderID,
        transactionID,
      }
    },
  }
}
