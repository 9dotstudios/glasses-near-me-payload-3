import { Button } from '@relume_io/relume-ui'
import Link from 'next/link'
import React from 'react'

import { isDarkScheme } from './Section'

type Props = {
  scheme?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
}

const primaryDark = '!border-transparent !bg-white !text-[#080706] hover:!bg-white/90'
const secondaryDark = '!border-white/30 !bg-transparent !text-white hover:!bg-white/10'

export function SchemeButtons({
  scheme,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: Props) {
  const dark = isDarkScheme(scheme)
  const buttons = [
    primaryLabel && primaryHref
      ? { label: primaryLabel, href: primaryHref, variant: 'primary' as const }
      : null,
    secondaryLabel && secondaryHref
      ? { label: secondaryLabel, href: secondaryHref, variant: 'secondary' as const }
      : null,
  ].filter(Boolean)

  if (!buttons.length) return null

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      {buttons.map((button) => {
        if (!button) return null
        const className =
          button.variant === 'primary' ? (dark ? primaryDark : '') : dark ? secondaryDark : ''
        return (
          <Button key={button.href + button.label} asChild variant={button.variant} className={className}>
            <Link href={button.href}>{button.label}</Link>
          </Button>
        )
      })}
    </div>
  )
}
