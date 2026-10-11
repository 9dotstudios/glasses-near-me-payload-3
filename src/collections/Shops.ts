import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { shopFieldUpdate, shopsReadAccess, shopsUpdateAccess, adminAccess } from '@/access/roles'
import {
  normalizeOptionalText,
  normalizeSlug,
  relationId,
  validateSlug,
  validateWebsite,
} from '@/lib/directory'

/**
 * Directory collection from main. Field names and claimStatus
 * (unclaimed | pending | claimed) stay as defined there.
 * Retailers may update hours, photos, website, and phone on their own shops.
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

function fieldUpdate(name: string) {
  return { update: shopFieldUpdate(name) }
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
    description: 'Optical shops. Retailers only see shops linked to their user.',
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: adminAccess,
    delete: adminAccess,
    read: shopsReadAccess,
    update: shopsUpdateAccess,
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
      access: fieldUpdate('name'),
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      validate: validateSlug,
      access: fieldUpdate('slug'),
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
      access: fieldUpdate('country'),
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
      access: fieldUpdate('town'),
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
      access: fieldUpdate('address'),
    },
    {
      name: 'phone',
      type: 'text',
      access: fieldUpdate('phone'),
    },
    {
      name: 'hours',
      type: 'textarea',
      localized: true,
      access: fieldUpdate('hours'),
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      access: fieldUpdate('photos'),
    },
    {
      name: 'lat',
      type: 'number',
      min: -90,
      max: 90,
      access: fieldUpdate('lat'),
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
      access: fieldUpdate('lng'),
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
      access: fieldUpdate('placeId'),
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
      access: fieldUpdate('website'),
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
      access: fieldUpdate('claimStatus'),
      options: [
        { label: 'Unclaimed', value: 'unclaimed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Claimed', value: 'claimed' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Pay later checkout sets this to claimed. Cancelling that order sets it back to unclaimed.',
      },
    },
    {
      name: 'hasWebsite',
      type: 'checkbox',
      virtual: true,
      access: fieldUpdate('hasWebsite'),
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Derived from website. Not stored. Claim is hidden when this is true.',
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
