import type { StreamChannel } from '../types'
import type { PlatformAdapter } from './types'
import { bareHost, pathSegments, toUrl } from './url'

/** Kick channel slug. */
const SLUG_RE = /^[a-zA-Z0-9_]{3,25}$/

/**
 * Kick adapter STUB. Registered behind the same interface but disabled, so
 * hardening it later (preview embed, thumbnails) is purely additive. Parsing
 * works; previews are off until `enabled` is flipped and tested.
 */
export const KickAdapter: PlatformAdapter = {
  platform: 'kick',
  displayName: 'Kick',
  enabled: false,

  matchUrl(input) {
    const url = toUrl(input)
    return url ? bareHost(url) === 'kick.com' : false
  },

  parse(input) {
    const url = toUrl(input)
    if (!url) return null
    if (bareHost(url) !== 'kick.com') return null
    const [first] = pathSegments(url)
    if (!first || !SLUG_RE.test(first)) return null
    const slug = first.toLowerCase()
    return {
      platform: 'kick',
      identifier: slug,
      kind: 'slug',
      canonicalUrl: `https://kick.com/${slug}`,
      suggestedLabel: first,
      previewable: false, // disabled until the embed is implemented + tested
    }
  },

  // Disabled: no preview yet even though player.kick.com/<slug> exists.
  canPreview() {
    return false
  },

  buildEmbedUrl() {
    return null
  },

  buildOpenUrl(channel: StreamChannel) {
    return `https://kick.com/${channel.identifier}`
  },
}
