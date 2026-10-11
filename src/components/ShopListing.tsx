import Link from 'next/link'
import React from 'react'

import { shopPageActions, type ShopPageActions } from '@/lib/claims'
import { withTrailingSlash } from '@/lib/routes'

type Photo = { url?: string | null; alt?: string | null }

type Shop = {
  name: string
  slug: string
  town?: unknown
  address?: string | null
  phone?: string | null
  hours?: string | null
  photos?: Array<Photo | number | string> | null
}

export function townLabel(town: unknown): string | null {
  if (typeof town === 'string') return town
  if (town && typeof town === 'object' && 'name' in town) {
    const name = (town as { name?: unknown }).name
    if (typeof name === 'string' && name.length > 0) return name
  }
  return null
}

export function ShopListing({ shop, actions }: { shop: Shop; actions: ShopPageActions }) {
  const photos = (shop.photos ?? []).flatMap((photo) => {
    if (!photo || typeof photo !== 'object' || !photo.url) return []
    return [{ url: photo.url, alt: photo.alt || shop.name }]
  })
  const town = townLabel(shop.town)

  return (
    <article className="gnm-scheme-1 px-[5%] py-16">
      <div className="container max-w-3xl">
        <p className="mb-3 text-sm font-medium text-[#0D9769]">Shop</p>
        <h1 className="font-[family-name:var(--font-fraunces)] text-5xl text-[#080706] md:text-7xl">
          {shop.name}
        </h1>
        {town ? <p className="mt-4 text-lg text-[#080706]/70">{town}</p> : null}
        {shop.address ? <p className="mt-6 max-w-2xl text-[#080706]/80">{shop.address}</p> : null}
        {shop.hours ? (
          <p className="mt-4 whitespace-pre-line text-sm text-[#080706]/70">{shop.hours}</p>
        ) : null}
        {shop.phone ? <p className="mt-4 text-[#080706]">Phone {shop.phone}</p> : null}

        {photos.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {photos.map((photo) => (
              <li key={photo.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.alt} className="w-full rounded-2xl object-cover" />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {actions.showClaimed ? <p className="text-lg font-medium">Claimed</p> : null}
          {actions.showSoldOut ? <p className="text-lg font-medium">Sold out</p> : null}
          {actions.viewWebsiteHref ? (
            <a
              className="gnm-btn gnm-btn-secondary"
              href={actions.viewWebsiteHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              View Website
            </a>
          ) : null}
          {actions.showClaim ? (
            <Link
              className="gnm-btn"
              data-cta="claim"
              href={withTrailingSlash(`/shops/${shop.slug}/checkout`)}
            >
              Claim
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function shopActionsFor(shop: {
  hasWebsite?: boolean | null
  website?: string | null
  claimStatus?: string | null
  inventory?: number | null
}) {
  return shopPageActions(shop)
}
