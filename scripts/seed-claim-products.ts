import { getPayload } from 'payload'

import config from '@payload-config'
import { seedClaimProducts } from '@/seed/claimProducts'

const payload = await getPayload({ config })
let code = 0

try {
  const result = await seedClaimProducts(payload)
  payload.logger.info({
    msg: `Claim products: created ${result.created} for ${result.shops} existing shops.`,
  })
} catch (error) {
  console.error(error)
  code = 1
} finally {
  await payload.destroy()
  process.exit(code)
}
