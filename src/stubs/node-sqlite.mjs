/**
 * Stand-in for the optional Node built-in `node:sqlite`.
 * Workers cannot resolve that specifier, and nothing in this app calls it.
 */
export class DatabaseSync {
  constructor() {
    throw new Error('node:sqlite is not available in the Cloudflare Workers bundle.')
  }
}

const api = { DatabaseSync }
export default api
