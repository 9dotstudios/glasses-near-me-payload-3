import type { CollectionConfig, Field } from 'payload'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { adminAccess, hideFromRetailers, isAdminUser, isRetailer } from '@/access/roles'
import { prepareClaimOrder, syncClaimOrder } from '@/hooks/claimOrders'
import { PAY_LATER_STATUS } from '@/lib/claims'
import { payLaterAdapter } from '@/payments/payLater'
import { stripePaymentMethod } from '@/payments/stripe'

const adminOnlyField = ({ req }: { req: { user?: { role?: string | null } | null } }) =>
  isAdminUser(req.user)

function lockCollection(
  collection: CollectionConfig,
  publicRead: 'published' | 'none',
): CollectionConfig {
  return {
    ...collection,
    access: {
      ...collection.access,
      admin: adminAccess,
      create: adminAccess,
      delete: adminAccess,
      read: ({ req: { user } }) => {
        if (isAdminUser(user)) return true
        if (isRetailer(user) || publicRead === 'none') return false
        return { _status: { equals: 'published' } }
      },
      update: adminAccess,
    },
    admin: {
      ...collection.admin,
      hidden: hideFromRetailers,
    },
  }
}

const claimOrderFields: Field[] = [
  {
    name: 'shop',
    type: 'relationship',
    relationTo: 'shops',
    index: true,
    admin: { position: 'sidebar' },
  },
  {
    name: 'buyerName',
    type: 'text',
    admin: { position: 'sidebar' },
  },
  {
    name: 'paymentStatus',
    type: 'select',
    required: true,
    defaultValue: PAY_LATER_STATUS,
    options: [
      { label: 'Pending / pay later', value: PAY_LATER_STATUS },
      { label: 'Paid', value: 'paid' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
    admin: {
      position: 'sidebar',
      description:
        'Mark Paid when payment arrives. Mark Cancelled to restore stock to 1 and unclaim the shop.',
    },
  },
  {
    name: 'stockHeld',
    type: 'checkbox',
    defaultValue: false,
    admin: { position: 'sidebar', readOnly: true },
  },
  {
    name: 'retailerInviteUrl',
    type: 'text',
    admin: { position: 'sidebar', readOnly: true },
  },
  {
    name: 'checkoutSecret',
    type: 'text',
    access: {
      create: adminOnlyField,
      read: adminOnlyField,
      update: () => false,
    },
    admin: { hidden: true },
  },
]

export function ecommerce() {
  const stripe = stripePaymentMethod()
  return ecommercePlugin({
    access: {
      adminOnlyFieldAccess: ({ req: { user } }) => isAdminUser(user),
      adminOrPublishedStatus: ({ req: { user } }) => {
        if (isAdminUser(user)) return true
        if (isRetailer(user)) return false
        return { _status: { equals: 'published' } }
      },
      isAdmin: ({ req: { user } }) => isAdminUser(user),
      isAuthenticated: ({ req: { user } }) => Boolean(user),
      isCustomer: ({ req: { user } }) => isRetailer(user),
      isDocumentOwner: ({ req: { user } }) => {
        if (isAdminUser(user)) return true
        if (user?.id) return { customer: { equals: user.id } }
        return false
      },
      publicAccess: () => true,
    },
    customers: { slug: 'users' },
    payments: {
      paymentMethods: stripe ? [payLaterAdapter(), stripe] : [payLaterAdapter()],
    },
    products: {
      variants: false,
      productsCollectionOverride: ({ defaultCollection }) =>
        lockCollection(
          {
            ...defaultCollection,
            admin: {
              ...defaultCollection.admin,
              useAsTitle: 'title',
            },
            fields: [
              {
                name: 'title',
                type: 'text',
                required: true,
              },
              {
                name: 'shop',
                type: 'relationship',
                relationTo: 'shops',
                required: true,
                unique: true,
                index: true,
              },
              ...defaultCollection.fields,
            ],
          },
          'published',
        ),
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) =>
        lockCollection(
          {
            ...defaultCollection,
            fields: [...defaultCollection.fields, ...claimOrderFields],
            hooks: {
              ...defaultCollection.hooks,
              beforeChange: [...(defaultCollection.hooks?.beforeChange ?? []), prepareClaimOrder],
              afterChange: [...(defaultCollection.hooks?.afterChange ?? []), syncClaimOrder],
            },
          },
          'none',
        ),
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => lockCollection(defaultCollection, 'none'),
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) =>
        lockCollection(defaultCollection, 'none'),
    },
    addresses: {
      addressesCollectionOverride: ({ defaultCollection }) =>
        lockCollection(defaultCollection, 'none'),
    },
  })
}
