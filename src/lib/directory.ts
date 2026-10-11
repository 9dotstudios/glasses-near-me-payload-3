import type { Validate } from 'payload'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeSlug(value: unknown): unknown {
  if (typeof value !== 'string') return value
  return value.trim().toLowerCase()
}

export const validateSlug: Validate = (value, { required }) => {
  if (value == null || value === '') {
    return required ? 'This field is required.' : true
  }
  if (typeof value !== 'string' || !SLUG_PATTERN.test(value)) {
    return 'Use a lowercase slug with letters, numbers, and hyphens.'
  }
  return true
}

export function normalizeOptionalText(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

/** Websites are optional. A value must be an absolute http or https URL. */
export const validateWebsite: Validate = (value) => {
  if (value == null || value === '') return true
  if (typeof value !== 'string') return 'Website must be an http or https URL.'

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Website must be an http or https URL.'
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'Website must be an http or https URL.'
  }
  if (!url.hostname) return 'Website must be an http or https URL.'
  return true
}

export function relationId(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return undefined
}
