import type { ParsedChannel } from '../types'
import type { PlatformAdapter } from './types'
import { bareHost, pathSegments, toUrl } from './url'

const YT_HOSTS = new Set([
  'youtube.com',
  'youtube-nocookie.com',
  'youtu.be',
])

/** A YouTube channel id: starts with "UC", 24 chars total. */
const CHANNEL_ID_RE = /^UC[\w-]{22}$/
/** A YouTube video id: 11 chars of [A-Za-z0-9_-]. */
const VIDEO_ID_RE = /^[\w-]{11}$/

type YtKind = 'channel' | 'video' | 'handle' | 'custom' | 'legacy'

/**
 * Classify a stored identifier back into its kind. This lets the card layer
 * decide previewability without storing a separate discriminator: channel ids
 * and video ids have distinct shapes, and handles/custom/legacy carry a sigil.
 */
export function ytKind(identifier: string): YtKind {
  if (CHANNEL_ID_RE.test(identifier)) return 'channel'
  if (identifier.startsWith('@')) return 'handle'
  if (identifier.startsWith('c/')) return 'custom'
  if (identifier.startsWith('user/')) return 'legacy'
  if (VIDEO_ID_RE.test(identifier)) return 'video'
  return 'custom'
}

function thumbFor(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function parsed(
  identifier: string,
  kind: YtKind,
  canonicalUrl: string,
  suggestedLabel: string,
): ParsedChannel {
  const previewable = kind === 'channel' || kind === 'video'
  return {
    platform: 'youtube',
    identifier,
    kind,
    canonicalUrl,
    suggestedLabel,
    thumbnailUrl: kind === 'video' ? thumbFor(identifier) : undefined,
    previewable,
  }
}

export const YouTubeAdapter: PlatformAdapter = {
  platform: 'youtube',
  displayName: 'YouTube',
  enabled: true,

  matchUrl(input) {
    const url = toUrl(input)
    return url ? YT_HOSTS.has(bareHost(url)) : false
  },

  parse(input) {
    const url = toUrl(input)
    if (!url) return null
    const host = bareHost(url)
    if (!YT_HOSTS.has(host)) return null

    // youtu.be/VIDEO_ID short links.
    if (host === 'youtu.be') {
      const [videoId] = pathSegments(url)
      if (videoId && VIDEO_ID_RE.test(videoId)) {
        return parsed(videoId, 'video', `https://www.youtube.com/watch?v=${videoId}`, '')
      }
      return null
    }

    // watch?v=VIDEO_ID
    const vParam = url.searchParams.get('v')
    if (vParam && VIDEO_ID_RE.test(vParam)) {
      return parsed(vParam, 'video', `https://www.youtube.com/watch?v=${vParam}`, '')
    }

    const segs = pathSegments(url)
    const [first, second] = segs

    if (!first) return null

    // /channel/UC…  (best case — keyless live preview)
    if (first === 'channel' && second && CHANNEL_ID_RE.test(second)) {
      return parsed(second, 'channel', `https://www.youtube.com/channel/${second}/live`, '')
    }

    // /embed/live_stream?channel=UC…  (checked before the generic video case below,
    // because "live_stream" also happens to match the 11-char video-id pattern).
    if (first === 'embed' && second === 'live_stream') {
      const ch = url.searchParams.get('channel')
      if (ch && CHANNEL_ID_RE.test(ch)) {
        return parsed(ch, 'channel', `https://www.youtube.com/channel/${ch}/live`, '')
      }
      return null
    }
    // /live/VIDEO_ID , /embed/VIDEO_ID , /shorts/VIDEO_ID , /v/VIDEO_ID
    if (
      (first === 'live' || first === 'embed' || first === 'shorts' || first === 'v') &&
      second &&
      VIDEO_ID_RE.test(second)
    ) {
      return parsed(second, 'video', `https://www.youtube.com/watch?v=${second}`, '')
    }

    // /@handle  → link-only (channel id not in URL)
    if (first.startsWith('@')) {
      return parsed(first, 'handle', `https://www.youtube.com/${first}`, first.slice(1))
    }
    // /c/CustomName → link-only
    if (first === 'c' && second) {
      return parsed(`c/${second}`, 'custom', `https://www.youtube.com/c/${second}`, second)
    }
    // /user/LegacyName → link-only
    if (first === 'user' && second) {
      return parsed(`user/${second}`, 'legacy', `https://www.youtube.com/user/${second}`, second)
    }

    return null
  },

  canPreview(channel) {
    const kind = ytKind(channel.identifier)
    return kind === 'channel' || kind === 'video'
  },

  buildEmbedUrl(channel) {
    const kind = ytKind(channel.identifier)
    if (kind === 'channel') {
      return `https://www.youtube.com/embed/live_stream?channel=${channel.identifier}&mute=1`
    }
    if (kind === 'video') {
      return `https://www.youtube.com/embed/${channel.identifier}?mute=1`
    }
    return null
  },

  buildOpenUrl(channel) {
    const kind = ytKind(channel.identifier)
    if (kind === 'channel') {
      return `https://www.youtube.com/channel/${channel.identifier}/live`
    }
    if (kind === 'video') {
      return `https://www.youtube.com/watch?v=${channel.identifier}`
    }
    if (kind === 'handle') {
      return `https://www.youtube.com/${channel.identifier}`
    }
    // custom / legacy already carry their path prefix in the identifier.
    return `https://www.youtube.com/${channel.identifier}`
  },
}
