import { describe, expect, it } from 'vitest'
import { TwitchAdapter } from './twitch'
import type { StreamChannel } from '../types'

function chan(identifier: string): StreamChannel {
  return {
    id: 'x',
    platform: 'twitch',
    identifier,
    canonicalUrl: '',
    label: 'l',
    addedAt: 0,
  }
}

describe('TwitchAdapter.parse', () => {
  it('parses twitch.tv/<login> as a previewable login (lowercased)', () => {
    const r = TwitchAdapter.parse('https://www.twitch.tv/STEEZYASFUCK')
    expect(r).not.toBeNull()
    expect(r!.kind).toBe('login')
    expect(r!.identifier).toBe('steezyasfuck')
    expect(r!.suggestedLabel).toBe('STEEZYASFUCK')
    expect(r!.previewable).toBe(true)
  })

  it('parses player.twitch.tv/?channel=<login>', () => {
    const r = TwitchAdapter.parse('https://player.twitch.tv/?channel=lofi')
    expect(r!.identifier).toBe('lofi')
  })

  it('tolerates missing scheme', () => {
    expect(TwitchAdapter.parse('twitch.tv/foobar')!.identifier).toBe('foobar')
  })

  it('rejects reserved site paths (directory, videos, etc.)', () => {
    expect(TwitchAdapter.parse('https://www.twitch.tv/directory')).toBeNull()
    expect(TwitchAdapter.parse('https://www.twitch.tv/videos/123')).toBeNull()
    expect(TwitchAdapter.parse('https://www.twitch.tv/settings')).toBeNull()
  })

  it('rejects logins that are too short or malformed', () => {
    expect(TwitchAdapter.parse('https://www.twitch.tv/ab')).toBeNull()
    expect(TwitchAdapter.parse('https://www.twitch.tv/has space')).toBeNull()
  })

  it('returns null for non-Twitch hosts', () => {
    expect(TwitchAdapter.parse('https://youtube.com/@x')).toBeNull()
  })
})

describe('TwitchAdapter embed/open URLs', () => {
  it('builds a muted, non-autoplay player embed with a parent param', () => {
    const url = TwitchAdapter.buildEmbedUrl(chan('lofi'))!
    expect(url.startsWith('https://player.twitch.tv/?channel=lofi')).toBe(true)
    expect(url).toContain('parent=')
    expect(url).toContain('muted=true')
    expect(url).toContain('autoplay=false')
  })

  it('opens twitch.tv/<login>', () => {
    expect(TwitchAdapter.buildOpenUrl(chan('lofi'))).toBe('https://www.twitch.tv/lofi')
  })

  it('canPreview is true for valid logins', () => {
    expect(TwitchAdapter.canPreview(chan('lofi'))).toBe(true)
  })
})
