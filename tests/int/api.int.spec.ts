import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
      overrideAccess: true,
    })
    expect(users).toBeDefined()
  })

  it('seeds the home page', async () => {
    const pages = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
    })
    expect(pages.docs[0]?.title).toBe('Home')
    expect(pages.docs[0]?.layout?.length).toBeGreaterThan(0)
  })
})
