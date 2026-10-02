import type { Block, Field } from 'payload'

export const schemeField: Field = {
  name: 'scheme',
  type: 'select',
  defaultValue: 'scheme-1',
  options: [
    { label: 'White', value: 'scheme-1' },
    { label: 'Near-black', value: 'scheme-2' },
    { label: 'Forest', value: 'scheme-3' },
    { label: 'White, green accent', value: 'scheme-4' },
    { label: 'Mint', value: 'scheme-5' },
  ],
}

const eyebrow: Field = { name: 'eyebrow', type: 'text' }
const heading: Field = { name: 'heading', type: 'text', required: true }
const body: Field = { name: 'body', type: 'textarea' }

const linkFields = (prefix: 'primary' | 'secondary'): Field[] => [
  { name: `${prefix}Label`, type: 'text' },
  { name: `${prefix}Href`, type: 'text' },
]

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    { name: 'fullHeight', type: 'checkbox', defaultValue: false },
    ...linkFields('primary'),
    ...linkFields('secondary'),
  ],
}

export const SearchPrompt: Block = {
  slug: 'searchPrompt',
  interfaceName: 'SearchPromptBlock',
  labels: { singular: 'Search prompt', plural: 'Search prompts' },
  fields: [
    schemeField,
    heading,
    body,
    { name: 'placeholder', type: 'text', defaultValue: 'Search towns and shops' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Search' },
    {
      name: 'href',
      type: 'text',
      defaultValue: '/find-a-shop',
      admin: {
        description: 'Where the field submits. This is layout chrome, not the directory search engine.',
      },
    },
  ],
}

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature grid', plural: 'Feature grids' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: { description: 'Material Symbols name, for example star or call.' },
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text' },
      ],
    },
  ],
}

export const Process: Block = {
  slug: 'process',
  interfaceName: 'ProcessBlock',
  labels: { singular: 'Process', plural: 'Processes' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stats', plural: 'Stats' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}

export const ContentFeed: Block = {
  slug: 'contentFeed',
  interfaceName: 'ContentFeedBlock',
  labels: { singular: 'Content feed', plural: 'Content feeds' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    { name: 'linkLabel', type: 'text' },
    { name: 'linkHref', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'excerpt', type: 'textarea' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const CTA: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'CTA', plural: 'CTAs' },
  fields: [schemeField, eyebrow, heading, body, ...linkFields('primary'), ...linkFields('secondary')],
}

export const RichContent: Block = {
  slug: 'richContent',
  interfaceName: 'RichContentBlock',
  labels: { singular: 'Rich content', plural: 'Rich content' },
  fields: [
    schemeField,
    eyebrow,
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
  ],
}

export const LogoStrip: Block = {
  slug: 'logoStrip',
  interfaceName: 'LogoStripBlock',
  labels: { singular: 'Logo strip', plural: 'Logo strips' },
  fields: [
    schemeField,
    eyebrow,
    { name: 'heading', type: 'text' },
    {
      name: 'logos',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

export const TwoColumn: Block = {
  slug: 'twoColumn',
  interfaceName: 'TwoColumnBlock',
  labels: { singular: 'Two column', plural: 'Two columns' },
  fields: [
    schemeField,
    eyebrow,
    heading,
    body,
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'imageAlt', type: 'text' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Right', value: 'right' },
        { label: 'Left', value: 'left' },
      ],
    },
    ...linkFields('primary'),
    ...linkFields('secondary'),
  ],
}

export const pageBlocks = [
  Hero,
  SearchPrompt,
  FeatureGrid,
  Process,
  Stats,
  ContentFeed,
  FAQ,
  CTA,
  RichContent,
  LogoStrip,
  TwoColumn,
]
