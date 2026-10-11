import { execFile } from 'node:child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'node:util'

const exec = promisify(execFile)

export const LIVE_REPO = 'https://github.com/9dotstudios/glassesnearme-org'
const LIVE_ORIGIN = 'https://glassesnearme.org'

const DATA_PATHS = [
  '/data/countries.json',
  '/data/shops.json',
  '/data/towns.json',
  '/data/guides.json',
  '/data/places.json',
  '/data/listings.json',
]

export type LiveSource = {
  root: string
  kind: 'directory' | 'git' | 'live-mirror'
  repo: string
  note?: string
  downloadFailures: string[]
}

export async function resolveLiveSource(): Promise<LiveSource> {
  const repo = process.env.LIVE_REPO || LIVE_REPO
  const override = process.env.LIVE_SOURCE
  if (override) {
    return {
      root: path.resolve(override),
      kind: 'directory',
      repo,
      downloadFailures: [],
    }
  }

  const checkout = path.resolve('.cache/glassesnearme-org')
  const refresh = process.env.IMPORT_REFRESH === '1'
  if (!refresh && (await exists(path.join(checkout, '.git')))) {
    return { root: checkout, kind: 'git', repo, downloadFailures: [] }
  }

  try {
    await fs.rm(checkout, { recursive: true, force: true })
    await exec('git', ['clone', '--depth', '1', repo, checkout], { timeout: 180_000 })
    return { root: checkout, kind: 'git', repo, downloadFailures: [] }
  } catch (error) {
    if (process.env.IMPORT_NO_MIRROR === '1') {
      throw new Error(`Could not clone ${repo}. Set LIVE_SOURCE to a local checkout.`)
    }
    const mirror = path.resolve('.cache/glassesnearme-live')
    if (!refresh && (await exists(path.join(mirror, 'sitemap.xml')))) {
      return {
        root: mirror,
        kind: 'live-mirror',
        repo,
        note: 'Using the cached public-site mirror because the git checkout was not available.',
        downloadFailures: await readFailures(mirror),
      }
    }
    const downloadFailures = await mirrorLiveSite(mirror)
    return {
      root: mirror,
      kind: 'live-mirror',
      repo,
      note: `Git clone failed (${safeError(error)}). Read the published site at ${LIVE_ORIGIN} instead.`,
      downloadFailures,
    }
  }
}

async function mirrorLiveSite(root: string) {
  await fs.rm(root, { recursive: true, force: true })
  await fs.mkdir(root, { recursive: true })
  const sitemap = await fetchText(`${LIVE_ORIGIN}/sitemap.xml`)
  await fs.writeFile(path.join(root, 'sitemap.xml'), sitemap)
  const urls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim())
  const failures: string[] = []
  let done = 0
  await mapPool(urls, 12, async (url) => {
    try {
      const html = await fetchText(url)
      const pathname = new URL(url).pathname
      const rel = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1)
      if (rel.includes('..')) return
      const dest = path.join(root, rel)
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.writeFile(dest, html)
    } catch {
      failures.push(url)
    } finally {
      done += 1
      if (done % 250 === 0 || done === urls.length) {
        console.error(`mirrored ${done}/${urls.length}`)
      }
    }
  })

  const extra = new Set<string>(DATA_PATHS)
  try {
    const nav = await fetchText(`${LIVE_ORIGIN}/assets/site-nav.js`)
    for (const match of nav.matchAll(/\/data\/[A-Za-z0-9_./-]+\.json/g)) extra.add(match[0])
  } catch {
    // The nav script is optional. countries.json is in the fixed list.
  }
  for (const dataPath of extra) {
    try {
      const body = await fetchText(`${LIVE_ORIGIN}${dataPath}`)
      const trimmed = body.trim()
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) continue
      const dest = path.join(root, dataPath.slice(1))
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.writeFile(dest, body)
    } catch {
      // Missing data files are normal on the published site.
    }
  }

  await fs.writeFile(path.join(root, 'download-failures.txt'), failures.join('\n'))
  return failures
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { accept: 'text/html,application/xml,application/json', 'user-agent': 'glasses-near-me-import' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.text()
}

async function mapPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  if (!items.length) return
  let index = 0
  async function run() {
    while (index < items.length) {
      const current = index
      index += 1
      await worker(items[current])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
}

async function exists(file: string) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function readFailures(root: string) {
  try {
    const text = await fs.readFile(path.join(root, 'download-failures.txt'), 'utf8')
    return text.split('\n').map((line) => line.trim()).filter(Boolean)
  } catch {
    return []
  }
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : 'clone failed'
  return message.replace(/https?:\/\/[^@\s]+@/g, 'https://').split('\n')[0].slice(0, 180)
}
