import type { CollectionConfig } from 'payload'

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
  },
  access: {
    read: () => true,
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
