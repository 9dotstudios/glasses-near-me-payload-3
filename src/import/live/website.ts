/** Keep an absolute http(s) URL. Anything else is stored blank. */
export function sanitizeWebsite(value: unknown): { website: string | null; blanked: boolean } {
  if (typeof value !== 'string') return { website: null, blanked: false }
  const trimmed = value.trim()
  if (!trimmed) return { website: null, blanked: false }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { website: null, blanked: true }
  }

  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
    return { website: null, blanked: true }
  }

  return { website: trimmed, blanked: false }
}
