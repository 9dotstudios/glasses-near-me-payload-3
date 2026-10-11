'use server'

import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { placePayLaterOrder } from '@/lib/claimCheckout'
import { withTrailingSlash } from '@/lib/routes'

export async function payLaterCheckout(formData: FormData) {
  const slug = String(formData.get('slug') ?? '')
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const payload = await getPayload({ config: configPromise })
  const result = await placePayLaterOrder({ payload, slug, name, email })

  if (result.ok === false) {
    redirect(
      withTrailingSlash(
        `/shops/${encodeURIComponent(slug)}/checkout?error=${encodeURIComponent(result.error)}`,
      ),
    )
  }

  redirect(
    withTrailingSlash(
      `/shops/${encodeURIComponent(slug)}/checkout/confirmation?order=${result.orderId}&secret=${result.secret}`,
    ),
  )
}
