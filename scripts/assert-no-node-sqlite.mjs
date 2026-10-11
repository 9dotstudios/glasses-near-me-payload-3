/**
 * Fail the build if Wrangler would still see an unresolved `node:sqlite` import.
 */
import fs from 'node:fs'
import path from 'node:path'

const outputRoot = path.join(process.cwd(), '.open-next')
const specifier = /(?:from|import|require)\s*\(?\s*(['"])node:sqlite\1/

function walk(dir, found = []) {
  if (!fs.existsSync(dir)) return found
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'cache') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath, found)
    else if (/\.(?:js|mjs|cjs)$/.test(entry.name)) {
      const text = fs.readFileSync(fullPath, 'utf8')
      if (specifier.test(text)) found.push(fullPath)
    }
  }
  return found
}

if (!fs.existsSync(outputRoot)) {
  console.error('Missing .open-next. Run the OpenNext build before this check.')
  process.exit(1)
}

const found = walk(outputRoot)
if (found.length) {
  console.error('Unresolved node:sqlite imports remain:')
  for (const file of found) console.error(`  ${file}`)
  process.exit(1)
}

console.log('OpenNext bundle does not import node:sqlite.')
