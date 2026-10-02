'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@relume_io/relume-ui'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

const countries = [
  {
    href: '/find-a-shop/malaysia',
    title: 'Malaysia',
    detail: '1,079 shops across 42 towns',
  },
  {
    href: '/find-a-shop/singapore',
    title: 'Singapore',
    detail: '280 shops across 108 areas',
  },
  {
    href: '/find-a-shop',
    title: 'All countries',
    detail: 'See every country we cover',
  },
]

const links = [
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About' },
  { href: '/for-opticians', label: 'For opticians' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#074F37] text-white">
      <div className="container flex items-center justify-between gap-6 px-[5%] py-4 lg:px-0">
        <Link href="/" aria-label="Glasses Near Me home" className="shrink-0">
          <Image
            src="/brand/logo-light.png"
            alt="Glasses Near Me"
            width={600}
            height={120}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 text-base font-medium text-white">
              Find a shop
              <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-72 bg-white p-2 text-[#080706]">
              {countries.map((country) => (
                <DropdownMenuItem key={country.href} asChild>
                  <Link href={country.href} className="flex flex-col items-start gap-0.5 px-3 py-2">
                    <span className="font-semibold">{country.title}</span>
                    <span className="text-sm text-black/60">{country.detail}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-base font-medium">
              {link.label}
            </Link>
          ))}
          <Button asChild className="!border-transparent !bg-white !text-[#080706] hover:!bg-white/90">
            <Link href="/add">Add your shop</Link>
          </Button>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="material-symbols-outlined text-3xl">{open ? 'close' : 'menu'}</span>
          <span className="sr-only">Menu</span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className="border-t border-white/15 px-[5%] py-4 lg:hidden" aria-label="Mobile">
          <p className="mb-2 text-sm text-white/70">Find a shop</p>
          <div className="mb-4 flex flex-col gap-2">
            {countries.map((country) => (
              <Link key={country.href} href={country.href} onClick={() => setOpen(false)} className="font-medium">
                {country.title}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="font-medium">
                {link.label}
              </Link>
            ))}
            <Button asChild className="!mt-2 !border-transparent !bg-white !text-[#080706]">
              <Link href="/add" onClick={() => setOpen(false)}>
                Add your shop
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
