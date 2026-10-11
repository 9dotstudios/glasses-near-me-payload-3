import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import {
  normalizeOptionalText,
  normalizeSlug,
  relationId,
  validateSlug,
  validateWebsite,
} from '@/lib/directory'

/**
 * Collection slug `shops` and these field names are the contract for the
 * claims / retailer work: name, slug, town, address, phone, hours, photos,
 * lat, lng, placeId (Google place_id), website, claimStatus, hasWebsite.
 * `country` is copied from the town so the admin list can filter by country.
 */
const syncCountryFromTown: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data) return data

  const townValue = 'town' in data ? data.town : originalDoc?.town
  const townId = relationId(townValue)
  if (townId == null) return data

  const town = await req.payload.findByID({
    collection: 'towns',
    id: townId,
    depth: 0,
    req,
  })
  data.country = relationId(town.country) ?? town.country
  return data
}

export const Shops: CollectionConfig = {
  slug: 'shops',
  labels: {
    singular: 'Shop',
    plural: 'Shops',
  },
  admin: {
    group: 'Directory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'country', 'town', 'claimStatus'],
    listSearchableFields: ['name', 'slug', 'phone', 'placeId'],
    description: 'Optical shops. Filter the list by country or town.',
  },
  access: {
    read: () => true,
  },
  indexes: [
    {
      fields: ['slug', 'town'],
      unique: true,
    },
  ],
  forceSelect: {
    website: true,
  },
  hooks: {
    beforeValidate: [syncCountryFromTown],
  },
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
        description: 'Unique within the town. Lowercase, no slashes.',
      },
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      required: true,
      index: true,
      admin: {
        description:
          'Sets which towns you can pick. Saved from the town so this list can filter by country.',
      },
    },
    {
      name: 'town',
      type: 'relationship',
      relationTo: 'towns',
      required: true,
      index: true,
      admin: {
        description: 'Filter the shop list by this town.',
      },
      filterOptions: ({ data }) => {
        const countryId = relationId(data?.country)
        if (countryId == null) return true
        return { country: { equals: countryId } }
      },
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'hours',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'lat',
      type: 'number',
      min: -90,
      max: 90,
      admin: {
        step: 0.000001,
        width: '50%',
        description: 'Latitude.',
      },
    },
    {
      name: 'lng',
      type: 'number',
      min: -180,
      max: 180,
      admin: {
        step: 0.000001,
        width: '50%',
        description: 'Longitude.',
      },
    },
    {
      name: 'placeId',
      type: 'text',
      unique: true,
      index: true,
      label: 'Google place ID',
      hooks: {
        beforeValidate: [({ value }) => normalizeOptionalText(value)],
      },
      admin: {
        description: 'Google place_id for this shop.',
      },
    },
    {
      name: 'website',
      type: 'text',
      validate: validateWebsite,
      hooks: {
        beforeValidate: [({ value }) => normalizeOptionalText(value)],
      },
      admin: {
        description: 'Absolute http or https URL. Other schemes are rejected.',
      },
    },
    {
      name: 'claimStatus',
      type: 'select',
      required: true,
      defaultValue: 'unclaimed',
      index: true,
      options: [
        { label: 'Unclaimed', value: 'unclaimed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Claimed', value: 'claimed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'hasWebsite',
      type: 'checkbox',
      virtual: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Derived from website. Not stored.',
      },
      hooks: {
        afterRead: [
          ({ siblingData }) =>
            typeof siblingData?.website === 'string' && siblingData.website.length > 0,
        ],
      },
    },
  ],
}
