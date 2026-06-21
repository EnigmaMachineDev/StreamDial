import type { ParsedChannel, Platform, StreamChannel } from '../types'

/**
 * One adapter per platform. Everything here is PURE and CLIENT-SIDE — no network
 * calls. Adding a platform later (e.g. Kick) is purely additive: implement this
 * interface and register it.
 */
export interface PlatformAdapter {
  platform: Platform
  /** Human label for UI (e.g. "YouTube"). */
  displayName: string
  /**
   * Whether this adapter is active. A registered-but-disabled adapter (Kick) is
   * recognized by the parser but won't be offered for adding channels yet.
   */
  enabled: boolean

  /** Does this input look like a URL this adapter handles? */
  matchUrl(input: string): boolean
  /** Parse a pasted URL into a ParsedChannel, or null if it isn't valid for this platform. */
  parse(input: string): ParsedChannel | null
  /** Whether a keyless live preview is possible for an already-saved channel. */
  canPreview(channel: StreamChannel): boolean
  /** Keyless live-preview embed URL, or null when no preview is possible. */
  buildEmbedUrl(channel: StreamChannel): string | null
  /** URL to open in a new tab. */
  buildOpenUrl(channel: StreamChannel): string
}

export type { ParsedChannel, Platform, StreamChannel }
