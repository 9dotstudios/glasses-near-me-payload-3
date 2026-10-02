import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/components/RenderBlocks'
import { getPageBySlug } from '@/lib/pages'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    slug?: string[]
  }>
  searchParams: Promise<{
    q?: string | string[]
  }>
}

function pathFromSlug(slug?: string[]) {
  if (!slug?.length) return 'home'
  return slug.join('/')
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(pathFromSlug(slug))
  if (!page) {
    return {
      title: 'Glasses Near Me',
      description: 'Find independent optical shops near you.',
    }
  }

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || undefined,
  }
}

export default async function Page({ params, searchParams }: Args) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const path = pathFromSlug(slug)
  const page = await getPageBySlug(path)

  if (!page) {
    if (!slug?.length) return <MissingHome />
    notFound()
  }

  const q = Array.isArray(query.q) ? query.q[0] : query.q

  return (
    <>
      {q ? (
        <p className="bg-[#EAF9F4] px-[5%] py-4 text-sm text-[#080706]">
          Directory search for “{q}” is not part of this marketing theme. Browse the country hubs
          instead.
        </p>
      ) : null}
      <RenderBlocks blocks={page.layout} />
    </>
  )
}

function MissingHome() {
  return (
    <section className="bg-[#080706] px-[5%] py-24 text-white">
      <div className="container max-w-3xl">
        <p className="mb-3 text-sm font-medium text-[#10B981]">Glasses Near Me</p>
        <h1 className="text-7xl md:text-10xl">Find a good optician, not just a nearby one.</h1>
        <p className="mt-6 text-white/70">
          The homepage is the Pages document with slug <code>home</code>. Open the admin, create
          that page, add Hero, Feature grid, Process, FAQ and CTA blocks, then reload /.
        </p>
        <Link
          href="/admin"
          className="mt-8 inline-flex bg-white px-6 py-3 font-medium text-[#080706]"
        >
          Open admin
        </Link>
      </div>
    </section>
  )
}
