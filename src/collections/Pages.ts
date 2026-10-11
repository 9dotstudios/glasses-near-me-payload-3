import type { CollectionConfig } from 'payload'

import { adminAccess, hideFromRetailers } from '@/access/roles'
import { pageBlocks } from '../blocks/fields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description:
      'Marketing pages. The page with slug "home" is served at /. Other slugs can include slashes, such as find-a-shop/malaysia.',
    hidden: hideFromRetailers,
  },
  access: {
    admin: adminAccess,
    create: adminAccess,
    delete: adminAccess,
    read: () => true,
    update: adminAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Use "home" for the homepage. Do not include a leading slash.',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
    },
  ],
}
