import { describe, expect, it } from 'vitest'
import { exportFilename, mergeData, parseImport, serializeExport } from './importExport'
import { defaultAppData } from './migrate'
import type { AppData, StreamChannel } from '../types'

function channel(id: string, identifier = id): StreamChannel {
  return {
    id,
    platform: 'twitch',
    identifier,
    canonicalUrl: `https://www.twitch.tv/${identifier}`,
    label: id,
    addedAt: 1,
  }
}

function appWith(channels: StreamChannel[], listId = 'L'): AppData {
  const map: Record<string, StreamChannel> = {}
  for (const c of channels) map[c.id] = c
  return {
    schemaVersion: 1,
    channels: map,
    lists: [
      {
        id: listId,
        name: listId,
        channelIds: channels.map((c) => c.id),
        createdAt: 0,
        updatedAt: 0,
      },
    ],
    activeListId: listId,
    settings: { avoidImmediateRepeat: true },
  }
}

describe('parseImport', () => {
  it('rejects non-JSON', () => {
    const r = parseImport('{not json')
    expect(r.ok).toBe(false)
  })

  it('rejects JSON that is not an object', () => {
    expect(parseImport('[]').ok).toBe(false)
    expect(parseImport('42').ok).toBe(false)
  })

  it('rejects an object with neither lists nor channels', () => {
    expect(parseImport('{"foo":1}').ok).toBe(false)
  })

  it('accepts and normalizes a valid export', () => {
    const text = serializeExport(appWith([channel('a')]))
    const r = parseImport(text)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(Object.keys(r.data.channels)).toContain('a')
      expect(r.data.lists[0]!.channelIds).toContain('a')
    }
  })

  it('round-trips through serialize → parse', () => {
    const data = appWith([channel('a'), channel('b')])
    const r = parseImport(serializeExport(data))
    expect(r.ok).toBe(true)
    if (r.ok) expect(Object.keys(r.data.channels).sort()).toEqual(['a', 'b'])
  })
})

describe('exportFilename', () => {
  it('is lowercase and date-stamped', () => {
    expect(exportFilename(new Date('2026-06-14T10:00:00Z'))).toBe(
      'streamdial-2026-06-14.json',
    )
  })
})

describe('mergeData', () => {
  it('de-dupes channels by platform+identifier, remapping references', () => {
    const current = appWith([channel('id-1', 'lofi')], 'L1')
    // Same platform+identifier ("twitch:lofi") under a different id and list.
    const incoming = appWith([channel('id-2', 'lofi')], 'L2')

    const merged = mergeData(current, incoming)
    // Only one physical channel survives (the existing one).
    expect(Object.keys(merged.channels)).toEqual(['id-1'])
    // The incoming list references it by the canonical id.
    const l2 = merged.lists.find((l) => l.id === 'L2')!
    expect(l2.channelIds).toEqual(['id-1'])
  })

  it('unions distinct channels and appends new lists', () => {
    const current = appWith([channel('a', 'aaa')], 'L1')
    const incoming = appWith([channel('b', 'bbb')], 'L2')
    const merged = mergeData(current, incoming)
    expect(Object.keys(merged.channels).sort()).toEqual(['a', 'b'])
    expect(merged.lists.map((l) => l.id).sort()).toEqual(['L1', 'L2'])
  })

  it('unions channelIds when a list id collides, preserving order and dropping dupes', () => {
    const current = appWith([channel('a', 'aaa')], 'L')
    const incoming: AppData = {
      ...appWith([channel('a', 'aaa'), channel('c', 'ccc')], 'L'),
    }
    const merged = mergeData(current, incoming)
    const l = merged.lists.find((x) => x.id === 'L')!
    expect(l.channelIds).toEqual(['a', 'c'])
  })

  it('keeps current settings and a valid activeListId', () => {
    const current = appWith([channel('a', 'aaa')], 'L1')
    const merged = mergeData(current, defaultAppData())
    expect(merged.activeListId).toBe('L1')
  })
})
