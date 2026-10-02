import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@relume_io/relume-ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@/payload-types'

import { Eyebrow, Icon, Section, isDarkScheme, normalizeScheme } from './Section'
import { SchemeButtons } from './SchemeButtons'

type LayoutBlock = NonNullable<Page['layout']>[number]

const columnClass: Record<string, string> = {
  '2': 'lg:grid-cols-2',
  '3': 'lg:grid-cols-3',
  '4': 'lg:grid-cols-4',
}

function mediaUrl(image: { url?: string | null; alt?: string | null } | number | null | undefined) {
  if (!image || typeof image === 'number') return null
  return image.url ? { url: image.url, alt: image.alt || '' } : null
}

function Intro({
  eyebrow,
  heading,
  body,
  as = 'h2',
  align = 'start',
}: {
  eyebrow?: string | null
  heading?: string | null
  body?: string | null
  as?: 'h1' | 'h2'
  align?: 'start' | 'center'
}) {
  const Heading = as
  return (
    <div className={`gnm-intro ${align === 'center' ? 'gnm-intro-center' : ''}`}>
      <div className="gnm-intro-title">
        <Eyebrow>{eyebrow}</Eyebrow>
        {heading ? (
          <Heading className={as === 'h1' ? 'gnm-h1' : 'gnm-h2'}>{heading}</Heading>
        ) : null}
      </div>
      {body ? <p className="gnm-body">{body}</p> : null}
    </div>
  )
}

function Hero({ block }: { block: Extract<LayoutBlock, { blockType: 'hero' }> }) {
  const framed = block.frame === 'card'
  const align = block.align === 'center' || framed ? 'center' : 'start'
  const photo = Boolean(block.imageUrl)
  const scheme = normalizeScheme(block.scheme)

  if (framed) {
    return (
      <Section scheme={block.scheme} density="medium">
        <div
          className={`gnm-card gnm-card-pad ${scheme === 'scheme-5' ? 'gnm-card-mint' : 'gnm-card-paper'}`}
        >
          <div className="gnm-center flex flex-col items-center gap-9">
            <Intro
              eyebrow={block.eyebrow}
              heading={block.heading}
              body={block.body}
              as="h1"
              align="center"
            />
            <SchemeButtons
              align="center"
              primaryLabel={block.primaryLabel}
              primaryHref={block.primaryHref}
              secondaryLabel={block.secondaryLabel}
              secondaryHref={block.secondaryHref}
            />
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      scheme={block.scheme}
      className={`${block.fullHeight ? 'gnm-section-hero' : ''} ${photo ? 'gnm-on-photo' : ''}`}
    >
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.imageUrl || ''} alt="" className="gnm-hero-media" />
          <div className="gnm-hero-shade" />
        </>
      ) : null}
      <div className={`relative z-[1] ${align === 'center' ? 'gnm-center' : ''}`}>
        <Intro
          eyebrow={block.eyebrow}
          heading={block.heading}
          body={block.body}
          as="h1"
          align={align}
        />
        {block.primaryLabel || block.secondaryLabel ? (
          <div className="mt-9">
            <SchemeButtons
              align={align}
              primaryArrow={photo}
              primaryLabel={block.primaryLabel}
              primaryHref={block.primaryHref}
              secondaryLabel={block.secondaryLabel}
              secondaryHref={block.secondaryHref}
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}

function SearchPrompt({ block }: { block: Extract<LayoutBlock, { blockType: 'searchPrompt' }> }) {
  const dark = isDarkScheme(block.scheme)
  return (
    <Section scheme={block.scheme}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Intro heading={block.heading} body={block.body} />
        <form
          action={block.href || '/find-a-shop'}
          method="get"
          className="gnm-search"
          role="search"
        >
          <label className="sr-only" htmlFor="gnm-search">
            Search towns and shops
          </label>
          <input
            id="gnm-search"
            name="q"
            type="text"
            placeholder={block.placeholder || 'Town or shop name'}
            className={
              dark
                ? 'gnm-field !border-white/20 !bg-white/10 !text-white placeholder:!text-white/60'
                : 'gnm-field'
            }
          />
          <button type="submit" className="gnm-btn">
            <span className="material-symbols-rounded" aria-hidden="true">
              search
            </span>
            {block.buttonLabel || 'Search'}
          </button>
        </form>
      </div>
    </Section>
  )
}

function FeatureGrid({ block }: { block: Extract<LayoutBlock, { blockType: 'featureGrid' }> }) {
  const columns = columnClass[block.columns || '4'] || columnClass['4']
  const media = block.variant === 'media'
  return (
    <Section scheme={block.scheme}>
      <div className="gnm-block">
        <Intro eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
        <div
          className={`grid grid-cols-1 gap-y-16 ${media ? 'gap-x-12' : 'gap-x-8'} max-lg:gap-y-12 ${block.columns === '4' ? 'sm:grid-cols-2' : ''} ${columns}`}
        >
          {block.items?.map((item) => (
            <article key={item.id || item.title} className="flex flex-col gap-6">
              {media && item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="gnm-media gnm-media-land" />
              ) : (
                <Icon name={item.icon} />
              )}
              <div className="flex flex-col gap-6">
                <h3 className="gnm-h4">{item.title}</h3>
                {item.description ? (
                  <p className="gnm-body max-w-none">{item.description}</p>
                ) : null}
              </div>
              {item.linkLabel && item.linkHref ? (
                media ? (
                  <Link href={item.linkHref} className="gnm-btn gnm-btn-secondary mt-auto">
                    {item.linkLabel}
                  </Link>
                ) : (
                  <Link
                    href={item.linkHref}
                    className="mt-auto inline-flex items-center gap-2 font-medium"
                  >
                    {item.linkLabel}
                    <span className="material-symbols-rounded text-xl">arrow_forward</span>
                  </Link>
                )
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

function Process({ block }: { block: Extract<LayoutBlock, { blockType: 'process' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="gnm-block">
        <Intro eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
        <ol className="grid gap-12 lg:grid-cols-3 lg:gap-x-12">
          {block.steps?.map((step) => (
            <li key={step.id || step.label} className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="gnm-step-num">{step.label}</span>
                <span className="gnm-step-line" />
              </div>
              <div className="flex flex-col gap-6">
                <h3 className="gnm-h5">{step.title}</h3>
                {step.description ? (
                  <p className="gnm-body max-w-none">{step.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

function Stats({ block }: { block: Extract<LayoutBlock, { blockType: 'stats' }> }) {
  const centered = Boolean(block.centered)
  const count = block.items?.length || 0
  const cols = count >= 4 ? 'lg:grid-cols-4' : count === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
  return (
    <Section scheme={block.scheme}>
      <div className="gnm-block">
        <Intro
          eyebrow={block.eyebrow}
          heading={block.heading}
          body={block.body}
          align={centered ? 'center' : 'start'}
        />
        <div className={`grid gap-10 ${cols} ${centered ? 'text-center' : ''}`}>
          {block.items?.map((item) => (
            <article key={item.id || item.title} className={centered ? 'gnm-stat' : ''}>
              <p className="gnm-h2 max-w-none">{item.value}</p>
              <h3 className="gnm-h6 mt-6">{item.title}</h3>
              {item.description ? (
                <p className="gnm-body mx-auto mt-3 max-w-none text-base">{item.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

function ContentFeed({ block }: { block: Extract<LayoutBlock, { blockType: 'contentFeed' }> }) {
  const textCards = block.variant === 'text'
  return (
    <Section scheme={block.scheme}>
      <div className="gnm-block">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-20">
          <Intro eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
          {block.linkLabel && block.linkHref ? (
            <Link href={block.linkHref} className="gnm-btn gnm-btn-secondary">
              {block.linkLabel}
            </Link>
          ) : null}
        </div>
        <div
          className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 ${textCards ? 'gap-4' : 'lg:gap-12'}`}
        >
          {block.items?.map((item) =>
            textCards ? (
              <Link
                key={item.id || item.title}
                href={item.href || '/guides'}
                className="gnm-library-card"
              >
                <h3>{item.title}</h3>
                {item.excerpt ? (
                  <p className="mt-1 text-sm text-stone-500">{item.excerpt}</p>
                ) : null}
              </Link>
            ) : (
              <article key={item.id || item.title} className="flex flex-col gap-6">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="gnm-media gnm-media-wide" />
                ) : null}
                <div className="flex flex-1 flex-col gap-6">
                  {item.tag ? <p className="gnm-tag">{item.tag}</p> : null}
                  <h3 className="gnm-h5">{item.title}</h3>
                  {item.excerpt ? <p className="gnm-body max-w-none">{item.excerpt}</p> : null}
                </div>
                {item.href ? (
                  <Link href={item.href} className="inline-flex items-center gap-2 font-medium">
                    Read the guide
                    <span className="material-symbols-rounded text-xl">arrow_forward</span>
                  </Link>
                ) : null}
              </article>
            ),
          )}
        </div>
      </div>
    </Section>
  )
}

function Faq({ block }: { block: Extract<LayoutBlock, { blockType: 'faq' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className="gnm-block">
        <Intro eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
        <Accordion type="single" collapsible className="border-t border-[var(--gnm-line)]">
          {block.items?.map((item, index) => (
            <AccordionItem
              key={item.id || item.question}
              value={item.id || String(index)}
              className="border-b border-[var(--gnm-line)]"
            >
              <AccordionTrigger className="py-5 text-left text-lg font-medium text-[var(--gnm-heading)]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-[var(--gnm-text)]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}

function Cta({ block }: { block: Extract<LayoutBlock, { blockType: 'cta' }> }) {
  const content = (
    <>
      <Intro
        eyebrow={block.eyebrow}
        heading={block.heading}
        body={block.body}
        align={block.card ? 'center' : 'start'}
      />
      <div className={block.body || block.eyebrow ? 'mt-9' : ''}>
        <SchemeButtons
          align={block.card ? 'center' : 'start'}
          primaryLabel={block.primaryLabel}
          primaryHref={block.primaryHref}
          secondaryLabel={block.secondaryLabel}
          secondaryHref={block.secondaryHref}
        />
      </div>
    </>
  )

  if (block.card) {
    return (
      <Section scheme={block.scheme} density="medium" className="gnm-section-card">
        <div
          className={`gnm-card gnm-card-pad ${block.scheme === 'scheme-5' ? 'gnm-card-mint' : 'gnm-card-paper'}`}
        >
          {content}
        </div>
      </Section>
    )
  }

  return <Section scheme={block.scheme}>{content}</Section>
}

function RichContent({ block }: { block: Extract<LayoutBlock, { blockType: 'richContent' }> }) {
  return (
    <Section scheme={block.scheme}>
      <div className={block.narrow ? 'gnm-prose-narrow' : 'mx-auto max-w-3xl'}>
        <Eyebrow>{block.eyebrow}</Eyebrow>
        {block.heading ? <h1 className="gnm-h1 mb-8">{block.heading}</h1> : null}
        {block.content ? <RichText data={block.content} className="gnm-prose max-w-none" /> : null}
      </div>
    </Section>
  )
}

function LogoStrip({ block }: { block: Extract<LayoutBlock, { blockType: 'logoStrip' }> }) {
  return (
    <Section scheme={block.scheme} density="medium">
      <Eyebrow>{block.eyebrow}</Eyebrow>
      {block.heading ? <h2 className="gnm-h4 mt-3">{block.heading}</h2> : null}
      <ul className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
        {block.logos?.map((logo) => {
          const image = mediaUrl(logo.logo)
          return (
            <li key={logo.id || logo.name} className="gnm-h5">
              {image ? (
                <Image
                  src={image.url}
                  alt={logo.name || image.alt}
                  width={240}
                  height={80}
                  className="h-10 w-auto"
                />
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
      <div
        className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${reversed ? 'lg:[&>*:first-child]:order-2' : ''}`}
      >
        <div>
          <Intro eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
          <div className="mt-9">
            <SchemeButtons
              primaryLabel={block.primaryLabel}
              primaryHref={block.primaryHref}
              secondaryLabel={block.secondaryLabel}
              secondaryHref={block.secondaryHref}
            />
          </div>
        </div>
        <div className="min-h-64 overflow-hidden rounded-[20px] bg-[var(--gnm-accent-subtle)]">
          {image ? (
            <Image
              src={image.url}
              alt={block.imageAlt || image.alt}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center p-8 text-sm">
              Add an image in the admin to fill this column.
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

const renderers: {
  [K in LayoutBlock['blockType']]: (
    block: Extract<LayoutBlock, { blockType: K }>,
  ) => React.ReactNode
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
