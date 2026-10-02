import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const columns = [
  {
    title: 'Directory',
    links: [
      { href: '/find-a-shop', label: 'Find a shop' },
      { href: '/find-a-shop/malaysia', label: 'Malaysia' },
      { href: '/find-a-shop/singapore', label: 'Singapore' },
      { href: '/find-a-shop/australia', label: 'Australia' },
    ],
  },
  {
    title: 'Guides',
    links: [
      {
        href: '/guides/how-much-does-an-eye-test-cost-in-malaysia',
        label: 'How much does an eye test cost?',
      },
      { href: '/guides/myopia-control-in-children', label: 'Myopia control in children' },
      {
        href: '/guides/how-to-read-your-glasses-prescription',
        label: 'How to read your glasses prescription',
      },
      { href: '/guides/are-blue-light-glasses-worth-it', label: 'Are blue light glasses worth it?' },
    ],
  },
  {
    title: 'For opticians',
    links: [
      { href: '/add', label: 'Add your shop' },
      { href: '/for-opticians/claim-or-correct-a-listing', label: 'Claim or correct a listing' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="gnm-scheme gnm-scheme-2 bg-[#080706] px-[5%] py-16 text-white md:py-20">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
          <Link href="/" aria-label="Glasses Near Me home">
            <Image
              src="/brand/logo-light.png"
              alt="Glasses Near Me"
              width={600}
              height={120}
              className="h-10 w-auto"
            />
          </Link>
          <div className="grid gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="mb-4 font-semibold">{column.title}</p>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-white/80 hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/15 pt-6">
          <div className="flex flex-col gap-4 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
            <p>Glasses Near Me. All rights reserved.</p>
            <div className="flex flex-wrap gap-5">
              <Link href="/about" className="underline">
                About
              </Link>
              <Link href="/privacy-policy" className="underline">
                Privacy policy
              </Link>
              <Link href="/terms-of-use" className="underline">
                Terms of use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
