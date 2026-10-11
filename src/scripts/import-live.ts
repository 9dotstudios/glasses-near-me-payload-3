import fs from 'fs/promises'
import path from 'path'

import { parseLiveSource } from '../import/live/parse'
import { buildReport, formatReport } from '../import/live/report'
import { resolveLiveSource } from '../import/live/source'
import { upsertLive } from '../import/live/upsert'

process.env.SKIP_SEED = process.env.SKIP_SEED || 'true'

const dryRun =
  process.env.IMPORT_DRY_RUN === '1' ||
  process.argv.includes('--dry-run') ||
  process.argv.includes('dry-run')

const source = await resolveLiveSource()
console.error(`reading ${source.kind} from ${source.root}`)
if (source.note) console.error(source.note)

const parsed = parseLiveSource(source.root)
const writes = dryRun ? null : await writeParsed(parsed)
const report = buildReport({ source, parsed, writes, dryRun })
const reportPath = path.resolve(process.env.IMPORT_REPORT || 'reports/import-live.json')
await fs.mkdir(path.dirname(reportPath), { recursive: true })
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(formatReport(report))
console.log(`report ${reportPath}`)

async function writeParsed(parsed: ReturnType<typeof parseLiveSource>) {
  const { getPayload } = await import('payload')
  const configModule = await import('../payload.config')
  const config = await configModule.default
  const payload = await getPayload({ config })
  if (process.env.NODE_ENV === 'production') {
    await payload.db.migrate()
  }
  return upsertLive(payload, parsed)
}
