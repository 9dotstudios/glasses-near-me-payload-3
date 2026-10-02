import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { ADD_SHOP_PATH } from '@/lib/routes'

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
      {
        href: '/guides/are-blue-light-glasses-worth-it',
        label: 'Are blue light glasses worth it?',
      },
    ],
  },
  {
    title: 'For opticians',
    links: [
      { href: ADD_SHOP_PATH, label: 'Add your shop' },
      { href: '/for-opticians/claim-or-correct-a-listing', label: 'Claim or correct a listing' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="gnm-footer gnm-scheme-2">
      <div className="gnm-container flex flex-col gap-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr_1fr] lg:gap-12">
          <Link href="/" aria-label="Home">
            <Image
              src="/brand/logo-light.png"
              alt="Glasses Near Me"
              width={600}
              height={120}
              className="h-10 w-auto"
            />
          </Link>
          <div className="grid gap-10 sm:grid-cols-3 lg:max-w-[40rem] lg:justify-self-end">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-6">
                <p className="font-medium text-white">{column.title}</p>
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
        <div className="flex flex-col gap-6 border-t border-white/20 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white">Glasses Near Me. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/about" className="text-white/80 hover:text-white">
              About
            </Link>
            <Link href="/privacy-policy" className="text-white/80 hover:text-white">
              Privacy policy
            </Link>
            <Link href="/terms-of-use" className="text-white/80 hover:text-white">
              Terms of use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
