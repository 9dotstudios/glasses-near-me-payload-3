import type { CollectionConfig, Validate } from 'payload'

/**
 * Live Relume paths, without a leading or trailing slash.
 * English guides use `guides/...`. Malay and Chinese stay on the blog paths
 * (`ms/blog/...`, `zh/blog/...`, `zh-Hant/blog/...`) because those locales
 * were never moved under `/guides/`.
 */
const GUIDE_SLUG =
  /^(?:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)(?:\/(?:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*))+$/

function normalizeGuideSlug(value: unknown): unknown {
  if (typeof value !== 'string') return value
  return value.trim().replace(/^\/+|\/+$/g, '')
}

const validateGuideSlug: Validate = (value, { required }) => {
  if (value == null || value === '') {
    return required ? 'This field is required.' : true
  }
  if (typeof value !== 'string' || !GUIDE_SLUG.test(value)) {
    return 'Use the live path without a leading or trailing slash, such as guides/eye-test-cost-miri or zh-Hant/blog/example.'
  }
  return true
}

export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: {
    singular: 'Guide',
    plural: 'Guides',
  },
  admin: {
    group: 'Guides',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description:
      'Eye-care guides in en, ms, zh, and zh-Hant. Each locale slug is the live glassesnearme.org path.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      unique: true,
      index: true,
      validate: validateGuideSlug,
      hooks: {
        beforeValidate: [({ value }) => normalizeGuideSlug(value)],
      },
      admin: {
        description:
          'Live path for this locale. English example: guides/eye-test-cost-miri. Malay: ms/blog/.... Chinese: zh/blog/... or zh-Hant/blog/....',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
