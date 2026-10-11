/**
 * Rewrite optional `node:sqlite` specifiers in the OpenNext bundle before Wrangler uploads it.
 * Wrangler also aliases `node:sqlite` to this stub, so either path can resolve the import.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outputRoot = path.join(root, '.open-next')
const stubSource = path.join(root, 'src/stubs/node-sqlite.mjs')
const stubTarget = path.join(outputRoot, 'node-sqlite-stub.mjs')

const specifier =
  /(?<=(?:from|import|require)\s*\(?\s*)(['"])node:sqlite\1/g

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'cache') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath, files)
    else if (/\.(?:js|mjs|cjs)$/.test(entry.name)) files.push(fullPath)
  }
  return files
}

if (!fs.existsSync(outputRoot)) {
  console.log('No .open-next bundle yet. Skipping the node:sqlite patch.')
  process.exit(0)
}

if (!fs.existsSync(stubSource)) {
  console.error('Missing src/stubs/node-sqlite.mjs')
  process.exit(1)
}

fs.copyFileSync(stubSource, stubTarget)
let patched = 0

for (const file of walk(outputRoot)) {
  if (file === stubTarget) continue
  const source = fs.readFileSync(file, 'utf8')
  if (!source.includes('node:sqlite')) continue
  const relative = path.relative(path.dirname(file), stubTarget).split(path.sep).join('/')
  const imported = relative.startsWith('.') ? relative : `./${relative}`
  const next = source.replace(specifier, `$1${imported}$1`)
  if (next !== source) {
    fs.writeFileSync(file, next)
    patched += 1
  }
}

console.log(
  patched
    ? `Rewrote node:sqlite in ${patched} OpenNext file(s) to the local stub.`
    : 'OpenNext bundle has no node:sqlite import specifiers.',
)
