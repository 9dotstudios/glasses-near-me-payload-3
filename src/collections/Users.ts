import type { CollectionConfig } from 'payload'

import { adminAccess, hideFromRetailers, isAdminUser, isRetailer } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: hideFromRetailers,
  },
  auth: true,
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: adminAccess,
    delete: adminAccess,
    read: ({ req: { user } }) => {
      if (isAdminUser(user)) return true
      if (isRetailer(user)) return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (isAdminUser(user)) return true
      if (isRetailer(user)) return { id: { equals: user.id } }
      return false
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Retailer', value: 'retailer' },
      ],
      required: true,
      access: {
        create: ({ req: { user } }) => !user || isAdminUser(user),
        update: ({ req: { user } }) => isAdminUser(user),
      },
      saveToJWT: true,
    },
    {
      name: 'shops',
      type: 'relationship',
      relationTo: 'shops',
      hasMany: true,
      access: {
        create: ({ req: { user } }) => isAdminUser(user),
        update: ({ req: { user } }) => isAdminUser(user),
      },
      admin: {
        description: 'Shops this retailer can read and update.',
      },
    },
  ],
  versions: false,
}
