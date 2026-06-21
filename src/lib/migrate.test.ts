import { describe, expect, it } from 'vitest'
import { defaultAppData, gcOrphans, migrate } from './migrate'
import type { AppData, StreamChannel } from '../types'

function channel(id: string, identifier = id): StreamChannel {
  return {
    id,
    platform: 'youtube',
    identifier,
    canonicalUrl: `https://youtube.com/channel/${identifier}`,
    label: id,
    addedAt: 1,
  }
}

describe('migrate', () => {
  it('returns a valid default for null/garbage input', () => {
    const d = migrate(null)
    expect(d.lists.length).toBe(1)
    expect(d.activeListId).toBe(d.lists[0]!.id)
    expect(d.settings.avoidImmediateRepeat).toBe(true)
    expect(migrate('nonsense').lists.length).toBe(1)
    expect(migrate(42).channels).toEqual({})
  })

  it('drops invalid channels and channels whose key mismatches their id', () => {
    const raw = {
      schemaVersion: 1,
      channels: {
        good: channel('good'),
        bad: { id: 'bad', platform: 'nope', identifier: 'x', canonicalUrl: 'y' },
        mismatch: channel('other'),
      },
      lists: [{ id: 'L', name: 'L', channelIds: ['good', 'mismatch'] }],
    }
    const d = migrate(raw)
    expect(Object.keys(d.channels)).toEqual(['good'])
  })

  it('drops dangling and duplicate channel references in lists', () => {
    const raw = {
      schemaVersion: 1,
      channels: { a: channel('a') },
      lists: [{ id: 'L', name: 'L', channelIds: ['a', 'a', 'ghost'] }],
    }
    const d = migrate(raw)
    expect(d.lists[0]!.channelIds).toEqual(['a'])
  })

  it('ignores prototype-polluting channel keys', () => {
    const raw = JSON.parse(
      '{"schemaVersion":1,"channels":{"__proto__":{"id":"__proto__"}},"lists":[]}',
    )
    const d = migrate(raw)
    expect(Object.keys(d.channels)).not.toContain('__proto__')
  })

  it('salvages channels into a default list when no valid list exists', () => {
    const raw = { schemaVersion: 1, channels: { a: channel('a') }, lists: [] }
    const d = migrate(raw)
    expect(d.lists.length).toBe(1)
    expect(d.lists[0]!.channelIds).toContain('a')
  })

  it('repairs an activeListId that points nowhere', () => {
    const raw = {
      schemaVersion: 1,
      channels: {},
      lists: [{ id: 'L', name: 'L', channelIds: [] }],
      activeListId: 'gone',
    }
    expect(migrate(raw).activeListId).toBe('L')
  })
})

describe('gcOrphans', () => {
  it('removes channels referenced by no list', () => {
    const data: AppData = {
      schemaVersion: 1,
      channels: { a: channel('a'), b: channel('b') },
      lists: [{ id: 'L', name: 'L', channelIds: ['a'], createdAt: 0, updatedAt: 0 }],
      activeListId: 'L',
      settings: { avoidImmediateRepeat: true },
    }
    const gced = gcOrphans(data)
    expect(Object.keys(gced.channels)).toEqual(['a'])
  })

  it('keeps a channel shared across multiple lists', () => {
    const data: AppData = {
      schemaVersion: 1,
      channels: { a: channel('a') },
      lists: [
        { id: 'L1', name: 'L1', channelIds: ['a'], createdAt: 0, updatedAt: 0 },
        { id: 'L2', name: 'L2', channelIds: ['a'], createdAt: 0, updatedAt: 0 },
      ],
      activeListId: 'L1',
      settings: { avoidImmediateRepeat: true },
    }
    expect(Object.keys(gcOrphans(data).channels)).toEqual(['a'])
  })
})

describe('defaultAppData', () => {
  it('produces distinct ids on each call', () => {
    expect(defaultAppData().lists[0]!.id).not.toBe(defaultAppData().lists[0]!.id)
  })
})
