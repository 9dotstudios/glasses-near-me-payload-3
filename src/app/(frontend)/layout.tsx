import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

import './styles.css'

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
    <html lang="en">
      <body className="gnm-site font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
