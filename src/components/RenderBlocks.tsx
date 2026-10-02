import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Input } from '@relume_io/relume-ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@/payload-types'

import { Eyebrow, Icon, Section, isDarkScheme } from './Section'
import { SchemeButtons } from './SchemeButtons'

type LayoutBlock = NonNullable<Page['layout']>[number]

const columnClass: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

function mediaUrl(image: { url?: string | null; alt?: string | null } | number | null | undefined) {
  if (!image || typeof image === 'number') return null
  return image.url ? { url: image.url, alt: image.alt || '' } : null
}

function Hero({ block }: { block: Extract<LayoutBlock, { blockType: 'hero' }> }) {
  return (
    <Section
      scheme={block.scheme}
      className={block.fullHeight ? 'flex min-h-[70vh] items-center lg:min-h-[78vh]' : ''}
    >
      <div className="max-w-3xl">
        <Eyebrow>{block.eyebrow}</Eyebrow>
        <h1 className="text-7xl text-[var(--gnm-heading)] md:text-10xl">{block.heading}</h1>
        {block.body ? (
          <p className="mt-6 max-w-2xl text-md text-[var(--gnm-muted)]">{block.body}</p>
        ) : null}
        <SchemeButtons
          scheme={block.scheme}
          primaryLabel={block.primaryLabel}
          primaryHref={block.primaryHref}
          secondaryLabel={block.secondaryLabel}
          secondaryHref={block.secondaryHref}
        />
      </div>
    </Section>
  )
}

function SearchPrompt({ block }: { block: Extract<LayoutBlock, { blockType: 'searchPrompt' }> }) {
  const dark = isDarkScheme(block.scheme)
  return (
    <Section scheme={block.scheme}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
          {block.body ? <p className="mt-5 max-w-xl text-[var(--gnm-muted)]">{block.body}</p> : null}
        </div>
        <form action={block.href || '/find-a-shop'} method="get" className="max-w-xl" role="search">
          <label className="sr-only" htmlFor="gnm-search">
            Search towns and shops
          </label>
          <Input
            id="gnm-search"
            name="q"
            placeholder={block.placeholder || 'Town or shop name'}
            className={
              dark
                ? 'h-12 w-full !border-white/20 !bg-white/10 !text-white placeholder:!text-white/60'
                : 'h-12 w-full'
            }
          />
          <Button
            type="submit"
            className={`mt-4 ${dark ? '!border-transparent !bg-white !text-[#080706]' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">search</span>
            {block.buttonLabel || 'Search'}
          </Button>
        </form>
      </div>
    </Section>
  )
}

function FeatureGrid({ block }: { block: Extract<LayoutBlock, { blockType: 'featureGrid' }> }) {
  const columns = columnClass[block.columns || '4'] || columnClass['4']
  return (
    <Section scheme={block.scheme}>
      <div className="max-w-3xl">
        <Eyebrow>{block.eyebrow}</Eyebrow>
        <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
        {block.body ? <p className="mt-5 max-w-2xl text-[var(--gnm-muted)]">{block.body}</p> : null}
      </div>
      <div className={`mt-12 grid gap-10 ${columns}`}>
        {block.items?.map((item) => (
          <article key={item.id || item.title} className="flex flex-col gap-4">
            <Icon name={item.icon} />
            <h3 className="text-4xl text-[var(--gnm-heading)]">{item.title}</h3>
            {item.description ? <p className="text-[var(--gnm-muted)]">{item.description}</p> : null}
            {item.linkLabel && item.linkHref ? (
              <Link href={item.linkHref} className="mt-auto inline-flex items-center gap-1 font-medium text-[var(--gnm-accent)]">
                {item.linkLabel}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  )
}

function Process({ block }: { block: Extract<LayoutBlock, { blockType: 'process' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="max-w-3xl">
        <Eyebrow>{block.eyebrow}</Eyebrow>
        <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
        {block.body ? <p className="mt-5 max-w-2xl text-[var(--gnm-muted)]">{block.body}</p> : null}
      </div>
      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {block.steps?.map((step) => (
          <li key={step.id || step.label}>
            <div className="mb-5 flex items-center gap-4">
              <span className="text-2xl font-semibold text-[var(--gnm-heading)]">{step.label}</span>
              <span className="h-px flex-1 bg-[var(--gnm-line)]" />
            </div>
            <h3 className="text-2xl text-[var(--gnm-heading)]">{step.title}</h3>
            {step.description ? <p className="mt-3 text-[var(--gnm-muted)]">{step.description}</p> : null}
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Stats({ block }: { block: Extract<LayoutBlock, { blockType: 'stats' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="max-w-3xl">
        <Eyebrow>{block.eyebrow}</Eyebrow>
        <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
        {block.body ? <p className="mt-5 max-w-2xl text-[var(--gnm-muted)]">{block.body}</p> : null}
      </div>
      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {block.items?.map((item) => (
          <article key={item.id || item.title}>
            <p className="text-8xl text-[var(--gnm-heading)] md:text-10xl">{item.value}</p>
            <h3 className="mt-3 text-xl text-[var(--gnm-heading)]">{item.title}</h3>
            {item.description ? <p className="mt-2 text-sm text-[var(--gnm-muted)]">{item.description}</p> : null}
          </article>
        ))}
      </div>
    </Section>
  )
}

function ContentFeed({ block }: { block: Extract<LayoutBlock, { blockType: 'contentFeed' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <Eyebrow>{block.eyebrow}</Eyebrow>
          <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
          {block.body ? <p className="mt-5 max-w-2xl text-[var(--gnm-muted)]">{block.body}</p> : null}
        </div>
        {block.linkLabel && block.linkHref ? (
          <Link href={block.linkHref} className="inline-flex items-center gap-1 font-medium text-[var(--gnm-accent)]">
            {block.linkLabel}
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        ) : null}
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {block.items?.map((item) => (
          <article key={item.id || item.title} className="flex flex-col border border-[var(--gnm-line)] p-6">
            {item.tag ? <p className="text-sm font-medium text-[var(--gnm-accent)]">{item.tag}</p> : null}
            <h3 className="mt-3 text-2xl text-[var(--gnm-heading)]">{item.title}</h3>
            {item.excerpt ? <p className="mt-3 flex-1 text-[var(--gnm-muted)]">{item.excerpt}</p> : null}
            {item.href ? (
              <Link href={item.href} className="mt-6 inline-flex items-center gap-1 font-medium">
                Read the guide
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  )
}

function Faq({ block }: { block: Extract<LayoutBlock, { blockType: 'faq' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>{block.eyebrow}</Eyebrow>
          <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
          {block.body ? <p className="mt-5 text-[var(--gnm-muted)]">{block.body}</p> : null}
        </div>
        <Accordion type="single" collapsible className="border-t border-[var(--gnm-line)]">
          {block.items?.map((item, index) => (
            <AccordionItem key={item.id || item.question} value={item.id || String(index)} className="border-b border-[var(--gnm-line)]">
              <AccordionTrigger className="py-5 text-left text-md font-semibold text-[var(--gnm-heading)]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[var(--gnm-muted)]">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}

function Cta({ block }: { block: Extract<LayoutBlock, { blockType: 'cta' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="max-w-3xl">
        <Eyebrow>{block.eyebrow}</Eyebrow>
        <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
        {block.body ? <p className="mt-5 max-w-2xl text-[var(--gnm-muted)]">{block.body}</p> : null}
        <SchemeButtons
          scheme={block.scheme}
          primaryLabel={block.primaryLabel}
          primaryHref={block.primaryHref}
          secondaryLabel={block.secondaryLabel}
          secondaryHref={block.secondaryHref}
        />
      </div>
    </Section>
  )
}

function RichContent({ block }: { block: Extract<LayoutBlock, { blockType: 'richContent' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="mx-auto max-w-3xl">
        <Eyebrow>{block.eyebrow}</Eyebrow>
        {block.heading ? (
          <h1 className="mb-8 text-7xl text-[var(--gnm-heading)] md:text-10xl">{block.heading}</h1>
        ) : null}
        {block.content ? (
          <RichText data={block.content} className="prose prose-lg max-w-none" />
        ) : null}
      </div>
    </Section>
  )
}

function LogoStrip({ block }: { block: Extract<LayoutBlock, { blockType: 'logoStrip' }> }) {
  return (
    <Section scheme={block.scheme} className="!py-12 md:!py-16">
      <Eyebrow>{block.eyebrow}</Eyebrow>
      {block.heading ? <h2 className="text-4xl text-[var(--gnm-heading)]">{block.heading}</h2> : null}
      <ul className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
        {block.logos?.map((logo) => {
          const image = mediaUrl(logo.logo)
          return (
            <li key={logo.id || logo.name} className="text-lg font-semibold tracking-[-0.03em] text-[var(--gnm-heading)]">
              {image ? (
                <Image src={image.url} alt={logo.name || image.alt} width={240} height={80} className="h-10 w-auto" />
              ) : (
                logo.name
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function TwoColumn({ block }: { block: Extract<LayoutBlock, { blockType: 'twoColumn' }> }) {
  const image = mediaUrl(block.image)
  const reversed = block.imagePosition === 'left'
  return (
    <Section scheme={block.scheme}>
      <div className={`grid items-center gap-12 lg:grid-cols-2 ${reversed ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <Eyebrow>{block.eyebrow}</Eyebrow>
          <h2 className="text-6xl text-[var(--gnm-heading)] md:text-8xl">{block.heading}</h2>
          {block.body ? <p className="mt-5 text-[var(--gnm-muted)]">{block.body}</p> : null}
          <SchemeButtons
            scheme={block.scheme}
            primaryLabel={block.primaryLabel}
            primaryHref={block.primaryHref}
            secondaryLabel={block.secondaryLabel}
            secondaryHref={block.secondaryHref}
          />
        </div>
        <div className="min-h-64 bg-[var(--gnm-accent)]/10">
          {image ? (
            <Image
              src={image.url}
              alt={block.imageAlt || image.alt}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center p-8 text-sm text-[var(--gnm-muted)]">
              Add an image in the admin to fill this column.
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

const renderers: {
  [K in LayoutBlock['blockType']]: (block: Extract<LayoutBlock, { blockType: K }>) => React.ReactNode
} = {
  hero: (block) => <Hero block={block} />,
  searchPrompt: (block) => <SearchPrompt block={block} />,
  featureGrid: (block) => <FeatureGrid block={block} />,
  process: (block) => <Process block={block} />,
  stats: (block) => <Stats block={block} />,
  contentFeed: (block) => <ContentFeed block={block} />,
  faq: (block) => <Faq block={block} />,
  cta: (block) => <Cta block={block} />,
  richContent: (block) => <RichContent block={block} />,
  logoStrip: (block) => <LogoStrip block={block} />,
  twoColumn: (block) => <TwoColumn block={block} />,
}

export function RenderBlocks({ blocks }: { blocks?: Page['layout'] }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, index) => {
        const render = renderers[block.blockType] as (value: LayoutBlock) => React.ReactNode
        return <React.Fragment key={block.id || index}>{render(block)}</React.Fragment>
      })}
    </>
  )
}
