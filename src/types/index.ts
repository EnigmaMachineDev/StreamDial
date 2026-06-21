/** Supported streaming platforms. `kick` is stubbed behind the adapter interface. */
export type Platform = 'youtube' | 'twitch' | 'kick'

/**
 * A single channel/stream the user has saved. Channels are stored NORMALIZED in
 * a dictionary keyed by `id` and referenced from lists, so the same channel can
 * appear in multiple lists with no duplication.
 */
export interface StreamChannel {
  id: string // uuid
  platform: Platform
  /** youtube: channelId (UC…) or video id (v=…); twitch: channel login name. */
  identifier: string
  /** Channel/live URL used for open-in-new-tab. */
  canonicalUrl: string
  /** User-facing name (parsed from URL or typed; user-editable). */
  label: string
  /** YouTube video thumbnail when a video id is known; else unset (placeholder shown). */
  thumbnailUrl?: string
  note?: string
  addedAt: number
}

/** An ordered, named collection of channel references. */
export interface ChannelList {
  id: string
  name: string
  /** Ordered; references StreamChannel.id. */
  channelIds: string[]
  createdAt: number
  updatedAt: number
}

export interface AppSettings {
  /** Randomizer won't pick the same channel twice in a row. */
  avoidImmediateRepeat: boolean
}

/** The entire persisted application state. */
export interface AppData {
  /** Data schema version, for import/load migration. */
  schemaVersion: number
  lists: ChannelList[]
  /** Normalized — a channel can live in multiple lists. */
  channels: Record<string, StreamChannel>
  activeListId?: string
  settings: AppSettings
}

/**
 * Result of parsing a pasted URL, before it becomes a saved StreamChannel.
 * Pure and client-side; `previewable` reflects whether a keyless live embed is
 * possible from the information in the URL alone.
 */
export interface ParsedChannel {
  platform: Platform
  identifier: string
  /** 'channel' | 'video' for youtube; 'login' for twitch; etc. */
  kind: string
  canonicalUrl: string
  /** Suggested default label (handle / login / video id). */
  suggestedLabel: string
  thumbnailUrl?: string
  /** Whether buildEmbedUrl can produce a live preview for this channel. */
  previewable: boolean
}
