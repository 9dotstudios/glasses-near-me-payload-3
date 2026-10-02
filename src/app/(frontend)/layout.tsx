import { Fraunces, Inter } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

import './styles.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata = {
  description:
    'Search independent optical shops and optometrists across Malaysia, Singapore and Australia. Real ratings, review counts and phone numbers. No pay-to-rank.',
  title: {
    default: 'Glasses Near Me',
    template: '%s',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="gnm-site">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
