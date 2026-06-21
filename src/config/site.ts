/**
 * Single source of truth for the site's identity.
 *
 * Referenced everywhere user-facing — document title, header, footer, metadata —
 * so a rename is a one-line change here, not a find-and-replace across the tree.
 */
export const SITE_NAME = 'StreamDial'

/** Short form used in tight spaces (e.g. mobile header). */
export const SITE_NAME_SHORT = 'StreamDial'

/** Org that builds and owns the site (footer attribution). */
export const ORG_NAME = 'EnigmaMachineDev'

/** Tagline / one-line description used in metadata and the hero. */
export const SITE_TAGLINE =
  'Curate, preview, and randomize livestream channels — all in your browser.'

/**
 * localStorage key for the entire app state blob. The `:v1` suffix is the
 * storage-envelope version, distinct from the data `schemaVersion` inside it.
 */
export const STORAGE_KEY = 'mss:appData:v1'

/** Current data schema version. Bump when the shape of AppData changes. */
export const SCHEMA_VERSION = 1

/**
 * Host domains permitted as the Twitch embed `parent` param. Read from the
 * VITE_EMBED_PARENTS env var (comma-separated). The current host is always
 * included so previews work on any deploy domain without reconfiguration.
 */
export function embedParents(): string[] {
  const fromEnv = (import.meta.env.VITE_EMBED_PARENTS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const here =
    typeof window !== 'undefined' && window.location?.hostname
      ? [window.location.hostname]
      : []
  return Array.from(new Set([...here, ...fromEnv, 'localhost']))
}
