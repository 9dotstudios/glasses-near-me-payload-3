import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

function readEnv(name: string): string {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Stripe stays in test mode and is omitted entirely when STRIPE_SECRET_KEY is unset,
 * so deploys and local runs do not need Stripe env. Pay later is the checkout that runs instead.
 */
export function stripePaymentMethod(): PaymentAdapter | null {
  const secretKey = readEnv('STRIPE_SECRET_KEY')
  if (!secretKey) return null
  if (!secretKey.startsWith('sk_test_')) {
    throw new Error('Stripe is locked to test mode. STRIPE_SECRET_KEY must start with sk_test_.')
  }

  const publishableKey = readEnv('STRIPE_PUBLISHABLE_KEY')
  if (publishableKey && !publishableKey.startsWith('pk_test_')) {
    throw new Error('STRIPE_PUBLISHABLE_KEY must start with pk_test_.')
  }

  const webhookSecret = readEnv('STRIPE_WEBHOOKS_SIGNING_SECRET')
  if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
    throw new Error('STRIPE_WEBHOOKS_SIGNING_SECRET must start with whsec_.')
  }

  return stripeAdapter({
    secretKey,
    publishableKey,
    webhookSecret: webhookSecret || undefined,
    label: 'Stripe (test)',
  })
}

export function stripeConfigured(): boolean {
  return readEnv('STRIPE_SECRET_KEY').length > 0
}
