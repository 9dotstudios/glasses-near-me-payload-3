import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Countries } from './collections/Countries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Shops } from './collections/Shops'
import { Towns } from './collections/Towns'
import { Users } from './collections/Users'
import { ecommerce } from './plugins/ecommerce'
import { seedDemoPages } from './seed/demo'
import { seedDirectory } from './seed/directory'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined
  } catch {
    return undefined
  }
}

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)
  if (!resolved) return false
  return (
    resolved.endsWith(path.join('payload', 'bin.js')) ||
    resolved.endsWith(path.join('next', 'dist', 'bin', 'next'))
  )
})
const isProduction = process.env.NODE_ENV === 'production'

declare global {
  interface CloudflareEnv {
    PAYLOAD_SECRET?: string
  }
}

// Bracket access so Next does not inline these at build time. OpenNext copies
// Worker secrets and the request origin into process.env before the app loads.
function readRuntimeOrigin(): string {
  const origin = process.env['__NEXT_PRIVATE_ORIGIN']
  return typeof origin === 'string' && origin.startsWith('http') ? origin : ''
}

function readPayloadSecret(env: CloudflareEnv): string {
  if (typeof env.PAYLOAD_SECRET === 'string' && env.PAYLOAD_SECRET.length > 0) {
    return env.PAYLOAD_SECRET
  }
  const fromProcess = process.env['PAYLOAD_SECRET']
  return typeof fromProcess === 'string' ? fromProcess : ''
}

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

// Bracket access so Next does not inline this during the production build.
const nextPhase = process.env['NEXT_PHASE']
const isNextBuild = nextPhase === 'phase-production-build'

// `next build` workers are production but not the Cloudflare runtime. They load
// this config while collecting page data and need a local D1 proxy. The Worker
// itself uses getCloudflareContext.
const cloudflare =
  isCLI || !isProduction || isNextBuild
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const serverURL = readRuntimeOrigin()

// Auth cookies default to Secure=false. Mark them Secure when this process is
// serving the HTTPS Worker so the admin session matches that public URL.
if (serverURL.startsWith('https://') && Users.auth === true) {
  Users.auth = {
    cookies: {
      sameSite: 'Lax',
      secure: true,
    },
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Bahasa Melayu', code: 'ms' },
      { label: '中文', code: 'zh' },
      { label: '中文（繁體）', code: 'zh-Hant' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [Users, Media, Countries, Towns, Shops, Pages],
  editor: lexicalEditor(),
  secret: readPayloadSecret(cloudflare.env),
  serverURL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  logger: isProduction ? cloudflareLogger : undefined,
  onInit: async (payload) => {
    if (process.env.SKIP_SEED === 'true') return
    if (process.env['NEXT_PHASE'] === 'phase-production-build') return
    const isMigrate = process.argv.some((value) => value.includes('migrate'))
    if (isMigrate) return
    try {
      await seedDemoPages(payload)
      await seedDirectory(payload)
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Glasses Near Me demo seed skipped' })
    }
  },
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    ecommerce(),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        // Remote D1 is only for production `payload migrate` (`pnpm deploy`).
        remoteBindings:
          isProduction && !isNextBuild && process.argv.some((value) => value.includes('migrate')),
        // Page-data workers each open D1. A shared file locks with SQLITE_BUSY.
        ...(isNextBuild
          ? {
              persist: {
                path: path.join(dirname, '..', '.wrangler', 'build', String(process.pid)),
              },
            }
          : {}),
      } satisfies GetPlatformProxyOptions),
  )
}
