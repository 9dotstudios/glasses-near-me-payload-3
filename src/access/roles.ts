import type { FieldAccess, PayloadRequest, Where } from 'payload'

type UserLike = {
  id?: number | string
  role?: string | null
  shops?: unknown
} | null

export const RETAILER_EDITABLE_SHOP_FIELDS = ['hours', 'photos', 'website', 'phone'] as const

export function isRetailer(user: UserLike): boolean {
  return user?.role === 'retailer'
}

/**
 * Accounts created before roles existed have no role. They stay admins.
 * Only an explicit retailer role is restricted.
 */
export function isAdminUser(user: UserLike): boolean {
  return Boolean(user) && !isRetailer(user)
}

export function ownedShopIds(user: UserLike): Array<number | string> {
  if (!user || !Array.isArray(user.shops)) return []
  return user.shops.flatMap((shop) => {
    if (typeof shop === 'number' || typeof shop === 'string') return [shop]
    if (shop && typeof shop === 'object' && 'id' in shop) {
      const id = (shop as { id?: unknown }).id
      if (typeof id === 'number' || typeof id === 'string') return [id]
    }
    return []
  })
}

export function adminAccess({ req }: { req: { user?: { role?: string | null } | null } }): boolean {
  return isAdminUser(req.user)
}

export function hideFromRetailers({ user }: { user: UserLike }): boolean {
  return isRetailer(user)
}

export function shopFieldUpdate(field: string): FieldAccess {
  return ({ req }) => {
    if (isAdminUser(req.user)) return true
    if (
      isRetailer(req.user) &&
      (RETAILER_EDITABLE_SHOP_FIELDS as readonly string[]).includes(field)
    ) {
      return true
    }
    return false
  }
}

async function retailerShopConstraint(req: PayloadRequest): Promise<boolean | Where> {
  if (!req.user) return false
  const fresh = await req.payload.findByID({
    collection: 'users',
    id: req.user.id,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const ids = ownedShopIds(fresh)
  if (!ids.length) return false
  return { id: { in: ids } }
}

export async function shopsReadAccess({ req }: { req: PayloadRequest }): Promise<boolean | Where> {
  if (!req.user) return true
  if (isAdminUser(req.user)) return true
  if (isRetailer(req.user)) return retailerShopConstraint(req)
  return false
}

export async function shopsUpdateAccess({
  req,
}: {
  req: PayloadRequest
}): Promise<boolean | Where> {
  if (isAdminUser(req.user)) return true
  if (isRetailer(req.user)) return retailerShopConstraint(req)
  return false
}
