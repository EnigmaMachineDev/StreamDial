import type { ParsedChannel } from '../types'
import type { PlatformAdapter } from './types'
import { embedParents } from '../config/site'
import { bareHost, pathSegments, toUrl } from './url'

/** Twitch login: 3–25 chars, letters/digits/underscore. */
const LOGIN_RE = /^[a-zA-Z0-9_]{3,25}$/

/** First path segments that are Twitch site features, not channel logins. */
const RESERVED = new Set([
  'directory', 'videos', 'video', 'p', 'settings', 'subscriptions',
  'inventory', 'wallet', 'drops', 'downloads', 'jobs', 'turbo', 'prime',
  'friends', 'following', 'communities', 'team', 'teams', 'search',
  'u', 'popout', 'collections', 'clip', 'clips',
])

/** Matches twitch.tv and any subdomain (player.twitch.tv, m. and www. already stripped). */
function isTwitchHost(host: string): boolean {
  return host === 'twitch.tv' || host.endsWith('.twitch.tv')
}

function parsedFor(login: string): ParsedChannel {
  const id = login.toLowerCase()
  return {
    platform: 'twitch',
    identifier: id,
    kind: 'login',
    canonicalUrl: `https://www.twitch.tv/${id}`,
    suggestedLabel: login,
    thumbnailUrl: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${id}-320x180.jpg`,
    previewable: true,
  }
}

export const TwitchAdapter: PlatformAdapter = {
  platform: 'twitch',
  displayName: 'Twitch',
  enabled: true,

  matchUrl(input) {
    const url = toUrl(input)
    return url ? isTwitchHost(bareHost(url)) : false
  },

  parse(input) {
    const url = toUrl(input)
    if (!url) return null
    if (!isTwitchHost(bareHost(url))) return null

    // player.twitch.tv/?channel=<login>
    const channelParam = url.searchParams.get('channel')
    if (channelParam && LOGIN_RE.test(channelParam)) {
      return parsedFor(channelParam)
    }

    const [first] = pathSegments(url)
    if (!first) return null
    if (RESERVED.has(first.toLowerCase())) return null
    if (!LOGIN_RE.test(first)) return null
    return parsedFor(first)
  },

  canPreview(channel) {
    return LOGIN_RE.test(channel.identifier)
  },

  buildEmbedUrl(channel) {
    if (!LOGIN_RE.test(channel.identifier)) return null
    const parents = embedParents()
      .map((p) => `parent=${encodeURIComponent(p)}`)
      .join('&')
    return `https://player.twitch.tv/?channel=${encodeURIComponent(
      channel.identifier,
    )}&${parents}&muted=true&autoplay=false`
  },

  buildOpenUrl(channel) {
    return `https://www.twitch.tv/${channel.identifier}`
  },
}
