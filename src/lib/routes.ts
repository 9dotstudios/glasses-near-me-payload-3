/** Relume path for the add-a-shop page. Legacy `/add` redirects here. */
export const ADD_SHOP_PATH = '/for-opticians/add-your-shop/'
export const ADD_SHOP_SLUG = 'for-opticians/add-your-shop'

const PUBLIC_FILE = /\/[^/]+\.[A-Za-z0-9]+$/

/**
 * Public paths match glassesnearme.org: they end with `/`.
 * `/` and files such as `/brand/logo.png` are left as they are.
 * Does not strip a trailing slash.
 */
export function withTrailingSlash(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path

  const hashIndex = path.indexOf('#')
  const hash = hashIndex === -1 ? '' : path.slice(hashIndex)
  const beforeHash = hashIndex === -1 ? path : path.slice(0, hashIndex)
  const queryIndex = beforeHash.indexOf('?')
  const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex)
  const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)

  if (pathname === '/' || pathname.endsWith('/') || PUBLIC_FILE.test(pathname)) {
    return `${pathname}${query}${hash}`
  }

  return `${pathname}/${query}${hash}`
}
