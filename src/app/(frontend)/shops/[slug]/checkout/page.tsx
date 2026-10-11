import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { payLaterCheckout } from './actions'
import { townLabel } from '@/components/ShopListing'
import { stripeConfigured } from '@/payments/stripe'
import { getShopPage } from '@/lib/shops'
import { claimListingClosed, claimOfferAllowed } from '@/lib/claims'
import { withTrailingSlash } from '@/lib/routes'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}

export const metadata: Metadata = {
  title: 'Claim checkout',
}

export default async function CheckoutPage({ params, searchParams }: Args) {
  const { slug } = await params
  const query = await searchParams
  const shop = await getShopPage(slug)
  if (!shop) notFound()

  const open =
    claimOfferAllowed(shop) && shop.claimStatus === 'unclaimed' && !claimListingClosed(shop)
  const town = townLabel(shop.town)

  return (
    <section className="gnm-scheme-1 px-[5%] py-16">
      <div className="container max-w-xl">
        <p className="mb-3 text-sm font-medium text-[#0D9769]">Claim</p>
        <h1 className="font-[family-name:var(--font-fraunces)] text-5xl text-[#080706]">
          Checkout
        </h1>
        <p className="mt-4 text-[#080706]/70">
          {shop.name}
          {town ? ` · ${town}` : ''}
        </p>
        {query.error ? <p className="mt-6 text-[#9B1C1C]">{query.error}</p> : null}
        {claimListingClosed(shop) ? (
          <p className="mt-8 text-lg font-medium">Claimed. Sold out.</p>
        ) : null}
        {open ? (
          <form action={payLaterCheckout} className="mt-8 grid gap-4">
            <input name="slug" type="hidden" value={shop.slug} />
            <label className="grid gap-2 text-sm font-medium">
              Name
              <input
                className="rounded-2xl border border-black/20 px-4 py-3 text-base"
                name="name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                className="rounded-2xl border border-black/20 px-4 py-3 text-base"
                name="email"
                required
                type="email"
              />
            </label>
            <button className="gnm-btn" type="submit">
              Checkout (pay later)
            </button>
            {stripeConfigured() ? (
              <p className="text-sm text-[#080706]/60">
                Stripe test mode is configured. Pay later stays the default checkout on this page.
              </p>
            ) : null}
          </form>
        ) : (
          <p className="mt-8">
            <Link className="gnm-btn gnm-btn-secondary" href={withTrailingSlash(`/shops/${shop.slug}`)}>
              Back to the shop
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
