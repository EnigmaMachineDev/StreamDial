import type { Platform } from '../types'
import { getAdapter } from '../adapters'

const STYLES: Record<Platform, string> = {
  youtube: 'bg-youtube/15 text-youtube',
  twitch: 'bg-twitch/20 text-twitch',
  kick: 'bg-kick/15 text-kick',
}

export default function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[platform]}`}
    >
      {getAdapter(platform).displayName}
    </span>
  )
}
