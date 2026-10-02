import React from 'react'

export type Scheme = 'scheme-1' | 'scheme-2' | 'scheme-3' | 'scheme-4' | 'scheme-5'

const schemeClass: Record<Scheme, string> = {
  'scheme-1': 'gnm-scheme gnm-scheme-1 bg-white text-[#080706]',
  'scheme-2': 'gnm-scheme gnm-scheme-2 bg-[#080706] text-white',
  'scheme-3': 'gnm-scheme gnm-scheme-3 bg-[#074F37] text-white',
  'scheme-4': 'gnm-scheme gnm-scheme-4 bg-white text-[#080706]',
  'scheme-5': 'gnm-scheme gnm-scheme-5 bg-[#EAF9F4] text-[#080706]',
}

export function normalizeScheme(value?: string | null): Scheme {
  if (value && value in schemeClass) return value as Scheme
  return 'scheme-1'
}

export function isDarkScheme(scheme?: string | null) {
  const key = normalizeScheme(scheme)
  return key === 'scheme-2' || key === 'scheme-3'
}

type SectionProps = {
  scheme?: string | null
  children: React.ReactNode
  className?: string
  id?: string
}

export function Section({ scheme, children, className = '', id }: SectionProps) {
  const key = normalizeScheme(scheme)
  return (
    <section id={id} className={`px-[5%] py-16 md:py-24 lg:py-28 ${schemeClass[key]} ${className}`}>
      <div className="container">{children}</div>
    </section>
  )
}

export function Eyebrow({ children }: { children?: string | null }) {
  if (!children) return null
  return <p className="mb-3 text-sm font-medium text-[var(--gnm-accent)]">{children}</p>
}

export function Icon({ name }: { name?: string | null }) {
  if (!name) return null
  return (
    <span
      className="inline-flex size-12 items-center justify-center rounded-sm bg-[var(--gnm-accent)]/10 text-[var(--gnm-accent)]"
      aria-hidden
    >
      <span className="material-symbols-outlined text-[1.6rem]">{name}</span>
    </span>
  )
}
