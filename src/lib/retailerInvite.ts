import { randomBytes } from 'node:crypto'

import type { Payload } from 'payload'

export function retailerInviteUrl(payload: Payload, token: string): string {
  const origin = payload.config.serverURL?.replace(/\/$/, '') || 'http://localhost:3000'
  return `${origin}/admin/reset/${token}`
}

function shopIdsOf(
  shops: Array<number | { id?: number | null } | null> | null | undefined,
): number[] {
  if (!shops) return []
  return shops.flatMap((shop) => {
    if (typeof shop === 'number') return [shop]
    return typeof shop?.id === 'number' ? [shop.id] : []
  })
}

export async function inviteRetailer(args: {
  payload: Payload
  email: string
  name?: string | null
  shopId: number
}): Promise<{ userId: number; inviteUrl: string | null; created: boolean }> {
  const email = args.email.trim().toLowerCase()
  const existing = await args.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })

  let user = existing.docs[0]
  let created = false

  if (!user) {
    const password = randomBytes(24).toString('hex')
    user = await args.payload.create({
      collection: 'users',
      data: {
        email,
        password,
        role: 'retailer',
        shops: [args.shopId],
      },
      overrideAccess: true,
    })
    created = true
  } else if (user.role !== 'admin') {
    const current = shopIdsOf(user.shops)
    const shops = current.includes(args.shopId) ? current : [...current, args.shopId]
    user = await args.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        role: 'retailer',
        shops,
      },
      overrideAccess: true,
    })
  } else {
    // An admin bought the claim. Keep their role and still attach the shop.
    const current = shopIdsOf(user.shops)
    if (!current.includes(args.shopId)) {
      user = await args.payload.update({
        collection: 'users',
        id: user.id,
        data: { shops: [...current, args.shopId] },
        overrideAccess: true,
      })
    }
  }

  let inviteUrl: string | null = null
  if (created || user.role === 'retailer') {
    const token = randomBytes(20).toString('hex')
    const resetPasswordExpiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    await args.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        resetPasswordExpiration,
        resetPasswordToken: token,
      },
      overrideAccess: true,
    })
    inviteUrl = retailerInviteUrl(args.payload, token)
    const emailAdapter = args.payload.email?.name
    if (emailAdapter && emailAdapter !== 'console') {
      await args.payload.sendEmail({
        to: email,
        subject: 'Set your password — Glasses Near Me',
        html: `<p>${args.name ? `${args.name}, set` : 'Set'} your password to edit your shop listing.</p><p><a href="${inviteUrl}">${inviteUrl}</a></p>`,
      })
    } else {
      args.payload.logger.info({
        msg: `No email adapter configured. Retailer invite for ${email}: ${inviteUrl}`,
      })
    }
  }

  return { userId: user.id, inviteUrl, created }
}

export async function detachShopFromUser(args: {
  payload: Payload
  userId: number
  shopId: number
}) {
  const user = await args.payload.findByID({
    collection: 'users',
    id: args.userId,
    depth: 0,
    overrideAccess: true,
  })
  const shops = shopIdsOf(user.shops).filter((id) => id !== args.shopId)
  await args.payload.update({
    collection: 'users',
    id: args.userId,
    data: { shops },
    overrideAccess: true,
  })
}
