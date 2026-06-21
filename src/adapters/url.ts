/**
 * Shared, pure URL helpers for the platform adapters. No network access.
 */

/**
 * Parse arbitrary user input into a URL object. Tolerates a missing scheme
 * (prepends https://) but requires a recognizable host. Returns null on garbage.
 */
export function toUrl(input: string): URL | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (!url.hostname || !url.hostname.includes('.')) return null
    return url
  } catch {
    return null
  }
}

/** Lowercased hostname with a leading `www.`/`m.` stripped. */
export function bareHost(url: URL): string {
  return url.hostname.toLowerCase().replace(/^(www\.|m\.)/, '')
}

/** Path split into non-empty segments. */
export function pathSegments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean)
}
