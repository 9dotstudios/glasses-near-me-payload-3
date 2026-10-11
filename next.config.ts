import path from 'path'
import { fileURLToPath } from 'url'

import { withPayload } from '@payloadcms/next/withPayload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // glassesnearme.org canonical paths end with `/`.
  // `/about` 308s to `/about/`. `/about/` is served and is not 308'd back to `/about`.
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/add',
        destination: '/for-opticians/add-your-shop/',
        permanent: false,
      },
      {
        source: '/add/',
        destination: '/for-opticians/add-your-shop/',
        permanent: false,
      },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  // Your Next.js config here
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Optional `node:sqlite` imports fail Wrangler upload. Alias them to a stub.
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      'node:sqlite': path.resolve(dirname, 'src/stubs/node-sqlite.mjs'),
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
