import Link from 'next/link'
import React from 'react'

type Props = {
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
  align?: 'start' | 'center'
  primaryArrow?: boolean
}

export function SchemeButtons({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  align = 'start',
  primaryArrow = false,
}: Props) {
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
        const className = button.variant === 'secondary' ? 'gnm-btn gnm-btn-secondary' : 'gnm-btn'
        return (
          <Link key={button.href + button.label} href={button.href} className={className}>
            {button.label}
            {button.variant === 'primary' && primaryArrow ? (
              <span className="material-symbols-rounded" aria-hidden="true">
                arrow_forward
              </span>
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
