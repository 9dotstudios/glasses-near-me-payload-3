import { describe, expect, it } from 'vitest'

import { validateSlug, validateWebsite } from '@/lib/directory'
import { withTrailingSlash } from '@/lib/routes'

const options = {
  required: false,
} as Parameters<typeof validateWebsite>[1]

describe('directory field rules', () => {
  it('accepts http and https websites and rejects other schemes', async () => {
    await expect(
      Promise.resolve(validateWebsite('https://optician.example/book', options)),
    ).resolves.toBe(true)
    await expect(
      Promise.resolve(validateWebsite('http://optician.example', options)),
    ).resolves.toBe(true)
    await expect(Promise.resolve(validateWebsite('', options))).resolves.toBe(true)
    await expect(Promise.resolve(validateWebsite(null, options))).resolves.toBe(true)
    await expect(
      Promise.resolve(validateWebsite('ftp://optician.example', options)),
    ).resolves.toMatch(/http/)
    await expect(Promise.resolve(validateWebsite('javascript:alert(1)', options))).resolves.toMatch(
      /http/,
    )
    await expect(Promise.resolve(validateWebsite('optician.example', options))).resolves.toMatch(
      /http/,
    )
    await expect(Promise.resolve(validateWebsite('//optician.example', options))).resolves.toMatch(
      /http/,
    )
  })

  it('accepts lowercase slugs', async () => {
    await expect(
      Promise.resolve(validateSlug('petaling-jaya', { ...options, required: true })),
    ).resolves.toBe(true)
    await expect(
      Promise.resolve(validateSlug('Petaling Jaya', { ...options, required: true })),
    ).resolves.toMatch(/lowercase/)
    await expect(
      Promise.resolve(validateSlug('', { ...options, required: true })),
    ).resolves.toMatch(/required/)
  })
})

describe('trailing slash', () => {
  it('adds a slash and does not remove one', () => {
    expect(withTrailingSlash('/about')).toBe('/about/')
    expect(withTrailingSlash('/about/')).toBe('/about/')
    expect(withTrailingSlash('/find-a-shop/malaysia')).toBe('/find-a-shop/malaysia/')
    expect(withTrailingSlash('/find-a-shop/malaysia/')).toBe('/find-a-shop/malaysia/')
    expect(withTrailingSlash('/')).toBe('/')
    expect(withTrailingSlash('/brand/logo.png')).toBe('/brand/logo.png')
    expect(withTrailingSlash('/about?q=1')).toBe('/about/?q=1')
    expect(withTrailingSlash('https://optician.example')).toBe('https://optician.example')
  })
})
