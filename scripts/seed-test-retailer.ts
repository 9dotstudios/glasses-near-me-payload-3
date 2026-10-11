import { getPayload } from 'payload'

import config from '@payload-config'
import { seedTestRetailer, TEST_RETAILER_EMAIL, TEST_SHOP_SLUG } from '@/seed/testRetailer'

const payload = await getPayload({ config })
let code = 0

try {
  await seedTestRetailer(payload)
  payload.logger.info({
    msg: `Test retailer ${TEST_RETAILER_EMAIL} linked to /shops/${TEST_SHOP_SLUG}. Password is test-retailer-password.`,
  })
} catch (error) {
  console.error(error)
  code = 1
} finally {
  await payload.destroy()
  process.exit(code)
}
