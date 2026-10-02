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
  align?: 'start' | 'center'
  primaryArrow?: boolean
}

const primaryLight = '!border-[#1c1917] !bg-[#1c1917] !text-white hover:!bg-[#1c1917]/90'
const primaryDark = '!border-transparent !bg-white !text-[#080706] hover:!bg-white/90'
const secondaryLight = '!border-[rgba(28,25,23,0.2)] !bg-transparent !text-[#1c1917] hover:!bg-black/5'
const secondaryDark = '!border-white/20 !bg-transparent !text-white hover:!bg-white/10'

export function SchemeButtons({
  scheme,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  align = 'start',
  primaryArrow = false,
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
    <div className={`gnm-actions ${align === 'center' ? 'gnm-actions-center' : ''}`}>
      {buttons.map((button) => {
        if (!button) return null
        const className =
          button.variant === 'primary'
            ? `${dark ? primaryDark : primaryLight} !px-5 !py-3 !text-base`
            : `${dark ? secondaryDark : secondaryLight} !px-5 !py-3 !text-base`
        return (
          <Button key={button.href + button.label} asChild variant={button.variant} className={className}>
            <Link href={button.href}>
              {button.label}
              {button.variant === 'primary' && primaryArrow ? (
                <span className="material-symbols-rounded text-xl">arrow_forward</span>
              ) : null}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
