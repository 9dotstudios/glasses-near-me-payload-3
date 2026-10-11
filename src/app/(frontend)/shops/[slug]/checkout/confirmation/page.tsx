import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { PAY_LATER_STATUS } from '@/lib/claims'
import { withTrailingSlash } from '@/lib/routes'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ order?: string; secret?: string }>
}

export const metadata: Metadata = {
  title: 'Claim received',
}

export default async function ConfirmationPage({ params, searchParams }: Args) {
  const { slug } = await params
  const query = await searchParams
  if (!query.order || !query.secret) notFound()

  const payload = await getPayload({ config: configPromise })
  let order: {
    checkoutSecret?: string | null
    paymentStatus?: string | null
    retailerInviteUrl?: string | null
    shop?: { slug?: string | null } | number | string | null
  }
  try {
    order = await payload.findByID({
      collection: 'orders',
      id: query.order,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!order || order.checkoutSecret !== query.secret) notFound()
  const shopSlug = order.shop && typeof order.shop === 'object' ? order.shop.slug : slug

  return (
    <section className="gnm-scheme-1 px-[5%] py-16">
      <div className="container max-w-xl">
        <p className="mb-3 text-sm font-medium text-[#0D9769]">Claim</p>
        <h1 className="font-[family-name:var(--font-fraunces)] text-5xl text-[#080706]">Claimed</h1>
        <p className="mt-6 text-lg">Sold out. This listing is now claimed.</p>
        <p className="mt-4">
          Payment status: <strong>{order.paymentStatus || PAY_LATER_STATUS}</strong>
        </p>
        {order.retailerInviteUrl ? (
          <div className="mt-8 rounded-2xl bg-[#EAF9F4] p-6">
            <p className="font-medium">Set your retailer password</p>
            <p className="mt-2 text-sm text-[#080706]/70">
              Set a password with this invite link. When no email adapter is configured, the same
              link is written to the server log.
            </p>
            <a
              className="mt-4 inline-block break-all text-[#0D9769]"
              href={order.retailerInviteUrl}
            >
              {order.retailerInviteUrl}
            </a>
          </div>
        ) : null}
        <p className="mt-8">
          <Link className="gnm-btn" href={withTrailingSlash(`/shops/${shopSlug || slug}`)}>
            Back to the shop
          </Link>
        </p>
      </div>
    </section>
  )
}
