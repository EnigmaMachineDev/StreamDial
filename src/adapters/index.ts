import type { ParsedChannel, Platform, StreamChannel } from '../types'
import type { PlatformAdapter } from './types'
import { YouTubeAdapter } from './youtube'
import { TwitchAdapter } from './twitch'
import { KickAdapter } from './kick'

/** All registered adapters, including disabled stubs (Kick). */
export const ADAPTERS: PlatformAdapter[] = [YouTubeAdapter, TwitchAdapter, KickAdapter]

const BY_PLATFORM: Record<Platform, PlatformAdapter> = {
  youtube: YouTubeAdapter,
  twitch: TwitchAdapter,
  kick: KickAdapter,
}

/** Adapters the user can actively add channels with. */
export function enabledAdapters(): PlatformAdapter[] {
  return ADAPTERS.filter((a) => a.enabled)
}

export function getAdapter(platform: Platform): PlatformAdapter {
  return BY_PLATFORM[platform]
}

/**
 * Parse a pasted URL by trying every adapter whose host matches. Disabled
 * adapters (Kick) still parse — the Add flow decides whether to allow saving —
 * so the user gets a clear "not supported yet" instead of a silent failure.
 */
export function parseUrl(input: string): ParsedChannel | null {
  for (const adapter of ADAPTERS) {
    if (adapter.matchUrl(input)) {
      const result = adapter.parse(input)
      if (result) return result
    }
  }
  return null
}

export function canPreview(channel: StreamChannel): boolean {
  return getAdapter(channel.platform).canPreview(channel)
}

export function buildEmbedUrl(channel: StreamChannel): string | null {
  return getAdapter(channel.platform).buildEmbedUrl(channel)
}

export function buildOpenUrl(channel: StreamChannel): string {
  return getAdapter(channel.platform).buildOpenUrl(channel)
}

export type { PlatformAdapter }
