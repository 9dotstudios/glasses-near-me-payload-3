import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { ShopListing, shopActionsFor } from '@/components/ShopListing'
import { getShopPage } from '@/lib/shops'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const shop = await getShopPage(slug)
  if (!shop) return { title: 'Shop' }
  const description = typeof shop.address === 'string' ? shop.address : undefined
  return { title: shop.name, description }
}

export default async function ShopPage({ params }: Args) {
  const { slug } = await params
  const shop = await getShopPage(slug)
  if (!shop) notFound()

  return <ShopListing shop={shop} actions={shopActionsFor(shop)} />
}
