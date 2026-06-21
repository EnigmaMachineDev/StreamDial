import { SCHEMA_VERSION } from '../config/site'
import type {
  AppData,
  AppSettings,
  ChannelList,
  Platform,
  StreamChannel,
} from '../types'
import { newId } from './id'

const PLATFORMS: ReadonlySet<string> = new Set<Platform>(['youtube', 'twitch', 'kick'])
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/** A fresh, valid AppData with a single starter list. */
export function defaultAppData(): AppData {
  const now = Date.now()
  const list: ChannelList = {
    id: newId(),
    name: 'My Channels',
    channelIds: [],
    createdAt: now,
    updatedAt: now,
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    lists: [list],
    channels: {},
    activeListId: list.id,
    settings: { avoidImmediateRepeat: true },
  }
}

function normalizeChannel(raw: unknown): StreamChannel | null {
  if (!isObject(raw)) return null
  const id = str(raw.id)
  const platform = str(raw.platform)
  const identifier = str(raw.identifier)
  const canonicalUrl = str(raw.canonicalUrl)
  const label = str(raw.label)
  if (!id || !platform || !PLATFORMS.has(platform) || !identifier || !canonicalUrl) {
    return null
  }
  const channel: StreamChannel = {
    id,
    platform: platform as Platform,
    identifier,
    canonicalUrl,
    label: label ?? identifier,
    addedAt: num(raw.addedAt, Date.now()),
  }
  const thumbnailUrl = str(raw.thumbnailUrl)
  if (thumbnailUrl) channel.thumbnailUrl = thumbnailUrl
  const note = str(raw.note)
  if (note) channel.note = note
  return channel
}

function normalizeChannels(raw: unknown): Record<string, StreamChannel> {
  const out: Record<string, StreamChannel> = {}
  if (!isObject(raw)) return out
  for (const [key, value] of Object.entries(raw)) {
    if (DANGEROUS_KEYS.has(key)) continue
    const channel = normalizeChannel(value)
    if (channel && channel.id === key) out[key] = channel
  }
  return out
}

function normalizeList(
  raw: unknown,
  channels: Record<string, StreamChannel>,
): ChannelList | null {
  if (!isObject(raw)) return null
  const id = str(raw.id)
  const name = str(raw.name)
  if (!id || !name) return null
  const ids = Array.isArray(raw.channelIds) ? raw.channelIds : []
  const seen = new Set<string>()
  const channelIds: string[] = []
  for (const cid of ids) {
    // Drop dangling refs and duplicates.
    if (typeof cid === 'string' && channels[cid] && !seen.has(cid)) {
      seen.add(cid)
      channelIds.push(cid)
    }
  }
  const now = Date.now()
  return {
    id,
    name,
    channelIds,
    createdAt: num(raw.createdAt, now),
    updatedAt: num(raw.updatedAt, now),
  }
}

function normalizeSettings(raw: unknown): AppSettings {
  const avoid = isObject(raw) ? raw.avoidImmediateRepeat : undefined
  return { avoidImmediateRepeat: typeof avoid === 'boolean' ? avoid : true }
}

/**
 * Run sequential schema migrations from `fromVersion` to SCHEMA_VERSION. Each
 * case mutates/reshapes the raw object and falls through to the next. There are
 * no migrations yet (v1 is current); the structure is here for future bumps.
 */
function runMigrations(raw: Record<string, unknown>, fromVersion: number): Record<string, unknown> {
  let data = raw
  let v = fromVersion
  /* eslint-disable no-fallthrough */
  switch (v) {
    // case 1: data = migrateV1toV2(data); v = 2;
    default:
      break
  }
  void v
  /* eslint-enable no-fallthrough */
  return data
}

/**
 * Coerce arbitrary parsed JSON into a valid AppData. Lenient: drops invalid
 * channels/lists and dangling references rather than throwing. Always returns a
 * usable AppData (falls back to default when the input is unusable).
 */
export function migrate(raw: unknown): AppData {
  if (!isObject(raw)) return defaultAppData()
  const fromVersion = num(raw.schemaVersion, 0)
  const migrated = runMigrations(raw, fromVersion)

  const channels = normalizeChannels(migrated.channels)
  const listsRaw = Array.isArray(migrated.lists) ? migrated.lists : []
  const lists = listsRaw
    .map((l) => normalizeList(l, channels))
    .filter((l): l is ChannelList => l !== null)

  if (lists.length === 0) {
    // Preserve any salvaged channels by dropping them into a fresh default list.
    const base = defaultAppData()
    base.channels = channels
    const first = base.lists[0]
    if (first) first.channelIds = Object.keys(channels)
    base.settings = normalizeSettings(migrated.settings)
    return base
  }

  const activeRaw = str(migrated.activeListId)
  const activeListId =
    activeRaw && lists.some((l) => l.id === activeRaw) ? activeRaw : lists[0]?.id

  return {
    schemaVersion: SCHEMA_VERSION,
    lists,
    channels,
    activeListId,
    settings: normalizeSettings(migrated.settings),
  }
}

/** Remove channels referenced by no list. Called before persisting. */
export function gcOrphans(data: AppData): AppData {
  const referenced = new Set<string>()
  for (const list of data.lists) {
    for (const id of list.channelIds) referenced.add(id)
  }
  const channels: Record<string, StreamChannel> = {}
  for (const [id, channel] of Object.entries(data.channels)) {
    if (referenced.has(id)) channels[id] = channel
  }
  return { ...data, channels }
}
