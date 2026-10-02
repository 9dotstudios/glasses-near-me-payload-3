import React from 'react'

export type Scheme = 'scheme-1' | 'scheme-2' | 'scheme-3' | 'scheme-4' | 'scheme-5'

const schemeClass: Record<Scheme, string> = {
  'scheme-1': 'gnm-scheme gnm-scheme-1',
  'scheme-2': 'gnm-scheme gnm-scheme-2',
  'scheme-3': 'gnm-scheme gnm-scheme-3',
  'scheme-4': 'gnm-scheme gnm-scheme-4',
  'scheme-5': 'gnm-scheme gnm-scheme-5',
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
  density?: 'large' | 'medium'
}

export function Section({ scheme, children, className = '', id, density = 'large' }: SectionProps) {
  const key = normalizeScheme(scheme)
  const pad = density === 'medium' ? 'gnm-section-medium' : 'gnm-section-large'
  return (
    <section id={id} className={`gnm-section ${pad} ${schemeClass[key]} ${className}`}>
      <div className="gnm-container">{children}</div>
    </section>
  )
}

export function Eyebrow({ children }: { children?: string | null }) {
  if (!children) return null
  return <p className="gnm-tagline">{children}</p>
}

export function Icon({ name }: { name?: string | null }) {
  if (!name) return null
  return (
    <span className="gnm-icon" aria-hidden>
      <span className="material-symbols-rounded">{name}</span>
    </span>
  )
}
