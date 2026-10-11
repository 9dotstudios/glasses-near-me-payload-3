import type { CollectionConfig } from 'payload'

import { adminAccess, hideFromRetailers } from '@/access/roles'
import { normalizeSlug, validateSlug } from '@/lib/directory'

export const Countries: CollectionConfig = {
  slug: 'countries',
  labels: {
    singular: 'Country',
    plural: 'Countries',
  },
  admin: {
    group: 'Directory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'slug'],
    listSearchableFields: ['name', 'code', 'slug'],
    description: 'Malaysia, Singapore, and Australia. Filter towns and shops from these records.',
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'code',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: [
        { label: 'Malaysia', value: 'MY' },
        { label: 'Singapore', value: 'SG' },
        { label: 'Australia', value: 'AU' },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
      hooks: {
        beforeValidate: [({ value }) => normalizeSlug(value)],
      },
      admin: {
        description: 'Public path segment, such as malaysia. Lowercase, no slashes.',
      },
    },
  ],
}
