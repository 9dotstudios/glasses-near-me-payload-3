import type { CollectionConfig } from 'payload'

import { adminAccess, hideFromRetailers, isAdminUser, isRetailer } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    hidden: hideFromRetailers,
  },
  access: {
    admin: adminAccess,
    create: ({ req: { user } }) => isAdminUser(user) || isRetailer(user),
    delete: adminAccess,
    read: () => true,
    update: adminAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
}
