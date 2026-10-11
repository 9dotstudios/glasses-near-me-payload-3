export const CLAIM_AUDIENCES = ['without-website', 'off'] as const
export type ClaimAudience = (typeof CLAIM_AUDIENCES)[number]

export const PAY_LATER_STATUS = 'pending/pay later'
export const CLAIM_PRICE_CENTS = 100

export type ShopClaimInput = {
  hasWebsite?: boolean | null
  claimStatus?: 'unclaimed' | 'pending' | 'claimed' | string | null
  inventory?: number | null
  website?: string | null
}

/**
 * Claim stays off for every shop whose directory `hasWebsite` flag is true.
 * `off` hides Claim everywhere. There is no audience that shows Claim on a shop with a website.
 */
export function claimAudienceFromEnv(value: string | undefined): ClaimAudience {
  if (value === 'off' || value === 'without-website') return value
  return 'without-website'
}

/** http(s) only. javascript:, mailto:, and other schemes are not retailer sites. */
export function retailerWebsiteUrl(website: string | null | undefined): string | null {
  if (typeof website !== 'string' || website.trim().length === 0) return null
  try {
    const url = new URL(website.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname) return null
    return url.toString()
  } catch {
    return null
  }
}

export function claimOfferAllowed(
  shop: ShopClaimInput,
  audience: ClaimAudience = claimAudienceFromEnv(process.env.CLAIM_AUDIENCE),
): boolean {
  if (audience === 'off') return false
  return shop.hasWebsite === false
}

export function claimListingClosed(shop: ShopClaimInput): boolean {
  return shop.claimStatus === 'claimed' || shop.claimStatus === 'pending' || shop.inventory === 0
}

export type ShopPageActions = {
  viewWebsiteHref: string | null
  showClaim: boolean
  showClaimed: boolean
  showSoldOut: boolean
}

export function shopPageActions(
  shop: ShopClaimInput,
  options?: { audience?: ClaimAudience },
): ShopPageActions {
  const audience = options?.audience ?? claimAudienceFromEnv(process.env.CLAIM_AUDIENCE)
  const eligible = claimOfferAllowed(shop, audience)
  const closed = claimListingClosed(shop)
  return {
    viewWebsiteHref: retailerWebsiteUrl(shop.website),
    showClaim: eligible && shop.claimStatus === 'unclaimed' && !closed,
    showClaimed: shop.claimStatus === 'claimed' || shop.claimStatus === 'pending',
    showSoldOut: shop.inventory === 0 || shop.claimStatus === 'claimed' || shop.claimStatus === 'pending',
  }
}
