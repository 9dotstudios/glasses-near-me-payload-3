import { describe, expect, it } from 'vitest'

import { isAdminUser, isRetailer, ownedShopIds, shopFieldUpdate } from '@/access/roles'
import { claimAudienceFromEnv, claimOfferAllowed, retailerWebsiteUrl, shopPageActions } from '@/lib/claims'

describe('claim offers', () => {
  it('shows Claim only when hasWebsite is false', () => {
    expect(claimAudienceFromEnv(undefined)).toBe('without-website')
    expect(claimAudienceFromEnv('all')).toBe('without-website')
    expect(claimOfferAllowed({ hasWebsite: false })).toBe(true)
    expect(claimOfferAllowed({ hasWebsite: true })).toBe(false)
    expect(claimOfferAllowed({ hasWebsite: false }, 'off')).toBe(false)
    expect(claimOfferAllowed({ hasWebsite: true }, 'off')).toBe(false)
  })

  it('locks View Website to http(s) and never offers Claim on a shop with a website', () => {
    const withSite = shopPageActions({
      hasWebsite: true,
      website: 'https://optician.example/book',
      claimStatus: 'unclaimed',
      inventory: 1,
    })
    expect(withSite.viewWebsiteHref).toBe('https://optician.example/book')
    expect(withSite.showClaim).toBe(false)
    expect(withSite).not.toHaveProperty('showGetZumo')

    const unsafe = shopPageActions({
      hasWebsite: true,
      website: 'javascript:alert(1)',
      claimStatus: 'unclaimed',
      inventory: 1,
    })
    expect(unsafe.viewWebsiteHref).toBeNull()
    expect(unsafe.showClaim).toBe(false)
    expect(retailerWebsiteUrl('mailto:shop@example.com')).toBeNull()
  })

  it('shows Claim only while an unclaimed listing is in stock', () => {
    const open = shopPageActions({
      hasWebsite: false,
      website: null,
      claimStatus: 'unclaimed',
      inventory: 1,
    })
    expect(open.showClaim).toBe(true)
    expect(open.showClaimed).toBe(false)
    expect(open.showSoldOut).toBe(false)

    const pending = shopPageActions({ hasWebsite: false, claimStatus: 'pending', inventory: 1 })
    expect(pending.showClaim).toBe(false)
    expect(pending.showClaimed).toBe(true)

    const claimed = shopPageActions({ hasWebsite: false, claimStatus: 'claimed', inventory: 0 })
    expect(claimed.showClaim).toBe(false)
    expect(claimed.showClaimed).toBe(true)
    expect(claimed.showSoldOut).toBe(true)
  })
})

describe('retailer shop access', () => {
  it('treats missing roles as admin and retailers as restricted', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true)
    expect(isAdminUser({})).toBe(true)
    expect(isRetailer({ role: 'retailer' })).toBe(true)
    expect(isAdminUser({ role: 'retailer' })).toBe(false)
  })

  it('lets retailers edit hours, photos, website, and phone only', () => {
    const retailer = { role: 'retailer' }
    const admin = { role: 'admin' }
    for (const field of ['hours', 'photos', 'website', 'phone']) {
      expect(shopFieldUpdate(field)({ req: { user: retailer } } as never)).toBe(true)
      expect(shopFieldUpdate(field)({ req: { user: admin } } as never)).toBe(true)
    }
    for (const field of ['slug', 'town', 'claimStatus', 'name', 'country', 'hasWebsite']) {
      expect(shopFieldUpdate(field)({ req: { user: retailer } } as never)).toBe(false)
    }
  })

  it('reads shop ids from populated or raw relationships', () => {
    expect(ownedShopIds({ shops: [3, { id: '9' }, null] })).toEqual([3, '9'])
  })
})
