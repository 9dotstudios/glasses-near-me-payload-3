import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <section className="bg-white px-[5%] py-24 text-[#080706]">
      <div className="container max-w-3xl">
        <p className="mb-3 text-sm font-medium text-[#0D9769]">Glasses Near Me</p>
        <h1 className="text-7xl md:text-10xl">That page is not in the directory.</h1>
        <p className="mt-6 text-black/70">
          Marketing pages are created in Payload. If this URL should exist, add a Pages document
          whose slug matches the path.
        </p>
        <Link href="/" className="mt-8 inline-flex bg-[#1C1917] px-6 py-3 font-medium text-white">
          Back home
        </Link>
      </div>
    </section>
  )
}
