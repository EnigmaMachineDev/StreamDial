import { SITE_NAME } from '../config/site'
import type { AppData, ChannelList, StreamChannel } from '../types'
import { gcOrphans, migrate } from './migrate'

/** Extra, non-authoritative metadata added to an export file. */
interface ExportEnvelope extends AppData {
  exportedAt: string
  exportedBy: string
}

export function serializeExport(data: AppData): string {
  const envelope: ExportEnvelope = {
    ...gcOrphans(data),
    exportedAt: new Date().toISOString(),
    exportedBy: SITE_NAME,
  }
  return JSON.stringify(envelope, null, 2)
}

/** Timestamped filename like `streamdial-2026-06-14.json`. */
export function exportFilename(now = new Date()): string {
  const stamp = now.toISOString().slice(0, 10)
  return `${SITE_NAME.toLowerCase()}-${stamp}.json`
}

/** Trigger a browser download of the current state. */
export function downloadExport(data: AppData): void {
  const blob = new Blob([serializeExport(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = exportFilename()
  a.click()
  URL.revokeObjectURL(url)
}

export type ImportResult =
  | { ok: true; data: AppData }
  | { ok: false; error: string }

/**
 * Parse and validate an import file's text. Never partially applies: returns a
 * fully-normalized AppData on success or a clear error on malformed input.
 */
export function parseImport(text: string): ImportResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: 'File does not contain an object.' }
  }
  const obj = raw as Record<string, unknown>
  const hasChannels = typeof obj.channels === 'object' && obj.channels !== null
  const hasLists = Array.isArray(obj.lists)
  if (!hasChannels && !hasLists) {
    return {
      ok: false,
      error: 'File does not look like a StreamDial export (no lists or channels).',
    }
  }
  // migrate() normalizes, drops invalid entries, and repairs references.
  return { ok: true, data: migrate(raw) }
}

const channelKey = (c: StreamChannel): string => `${c.platform}:${c.identifier}`

/**
 * Merge `incoming` into `current`: union of channels (de-duped by
 * platform+identifier) and lists (by id; channelIds unioned, order preserved).
 * Incoming channel ids are remapped onto existing ids where a duplicate exists.
 */
export function mergeData(current: AppData, incoming: AppData): AppData {
  const channels: Record<string, StreamChannel> = { ...current.channels }

  // Map existing channels by their dedupe key → canonical id.
  const keyToId = new Map<string, string>()
  for (const c of Object.values(channels)) keyToId.set(channelKey(c), c.id)

  // Remap incoming channel ids onto existing ones (or keep, adding new).
  const idRemap = new Map<string, string>()
  for (const c of Object.values(incoming.channels)) {
    const key = channelKey(c)
    const existingId = keyToId.get(key)
    if (existingId) {
      idRemap.set(c.id, existingId)
    } else {
      channels[c.id] = c
      keyToId.set(key, c.id)
      idRemap.set(c.id, c.id)
    }
  }

  const resolve = (id: string): string => idRemap.get(id) ?? id

  const lists: ChannelList[] = current.lists.map((l) => ({ ...l, channelIds: [...l.channelIds] }))
  const listById = new Map<string, ChannelList>()
  for (const l of lists) listById.set(l.id, l)

  for (const inc of incoming.lists) {
    const mappedIds = inc.channelIds.map(resolve).filter((id) => channels[id])
    const existing = listById.get(inc.id)
    if (existing) {
      const seen = new Set(existing.channelIds)
      for (const id of mappedIds) {
        if (!seen.has(id)) {
          existing.channelIds.push(id)
          seen.add(id)
        }
      }
      existing.updatedAt = Date.now()
    } else {
      const cloned: ChannelList = {
        ...inc,
        channelIds: Array.from(new Set(mappedIds)),
      }
      lists.push(cloned)
      listById.set(cloned.id, cloned)
    }
  }

  const merged: AppData = {
    schemaVersion: current.schemaVersion,
    lists,
    channels,
    activeListId: current.activeListId ?? lists[0]?.id,
    settings: current.settings,
  }
  return gcOrphans(merged)
}
