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
    <header className="gnm-nav relative">
      <div className="flex w-full items-center justify-between gap-6">
        <Link href="/" aria-label="Home" className="relative z-[2] shrink-0">
          <Image
            src="/brand/logo-light.png"
            alt="Glasses Near Me"
            width={600}
            height={120}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-4 lg:flex" aria-label="Primary">
          <DropdownMenu>
            <DropdownMenuTrigger className="gnm-nav-link">
              Find a shop
              <span className="material-symbols-rounded text-xl">keyboard_arrow_down</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-72 rounded-2xl bg-white p-2 text-[#080706]">
              {countries.map((country) => (
                <DropdownMenuItem key={country.href} asChild>
                  <Link href={country.href} className="flex flex-col items-start gap-0.5 rounded-xl px-3 py-2">
                    <span className="font-medium">{country.title}</span>
                    <span className="text-sm text-black/60">{country.detail}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="gnm-nav-link">
              {link.label}
            </Link>
          ))}
          <Button
            asChild
            size="sm"
            className="gnm-nav-cta !border-transparent !bg-white !px-4 !py-2 !text-base !text-[#080706] hover:!bg-white/90"
          >
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
          <span className="material-symbols-rounded text-3xl">{open ? 'close' : 'menu'}</span>
          <span className="sr-only">Menu</span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-white/15 bg-[#074F37] px-[var(--page-padding)] py-4 lg:hidden"
          aria-label="Mobile"
        >
          <p className="mb-2 text-sm text-white/70">Find a shop</p>
          <div className="mb-4 flex flex-col gap-2">
            {countries.map((country) => (
              <Link key={country.href} href={country.href} onClick={() => setOpen(false)} className="font-medium">
                {country.title}
                <span className="mt-0.5 block text-sm font-normal text-white/70">{country.detail}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="gnm-nav-link px-0">
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="gnm-nav-cta !mt-3 !border-transparent !bg-white !text-[#080706]">
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
