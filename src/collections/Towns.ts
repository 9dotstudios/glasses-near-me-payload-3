import type { CollectionConfig } from 'payload'

import { adminAccess, hideFromRetailers } from '@/access/roles'
import { normalizeSlug, validateSlug } from '@/lib/directory'

export const Towns: CollectionConfig = {
  slug: 'towns',
  labels: {
    singular: 'Town',
    plural: 'Towns',
  },
  admin: {
    group: 'Directory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'country'],
    listSearchableFields: ['name', 'slug'],
    description: 'Towns and areas. Filter the list by country.',
    hidden: hideFromRetailers,
  },
  access: {
    admin: adminAccess,
    create: adminAccess,
    delete: adminAccess,
    read: () => true,
    update: adminAccess,
  },
  indexes: [
    {
      fields: ['slug', 'country'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      validate: validateSlug,
      hooks: {
        beforeValidate: [({ value }) => normalizeSlug(value)],
      },
      admin: {
        description: 'Unique within the country. Lowercase, no slashes.',
      },
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      required: true,
      index: true,
      admin: {
        description: 'Filter the town list by this country.',
      },
    },
  ],
}
