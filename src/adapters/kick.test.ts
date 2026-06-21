import { describe, expect, it } from 'vitest'
import { KickAdapter } from './kick'
import { parseUrl, enabledAdapters } from './index'

describe('KickAdapter (disabled stub)', () => {
  it('parses kick.com/<slug> but is not previewable', () => {
    const r = KickAdapter.parse('https://kick.com/SomeStreamer')
    expect(r).not.toBeNull()
    expect(r!.identifier).toBe('somestreamer')
    expect(r!.previewable).toBe(false)
  })

  it('is registered but disabled', () => {
    expect(KickAdapter.enabled).toBe(false)
    expect(enabledAdapters().map((a) => a.platform)).not.toContain('kick')
  })

  it('produces no embed but a valid open URL', () => {
    const channel = {
      id: 'x',
      platform: 'kick' as const,
      identifier: 'somestreamer',
      canonicalUrl: '',
      label: 'l',
      addedAt: 0,
    }
    expect(KickAdapter.buildEmbedUrl(channel)).toBeNull()
    expect(KickAdapter.canPreview(channel)).toBe(false)
    expect(KickAdapter.buildOpenUrl(channel)).toBe('https://kick.com/somestreamer')
  })
})

describe('parseUrl dispatch', () => {
  it('routes to the right adapter', () => {
    expect(parseUrl('https://youtube.com/@x/')?.platform).toBe('youtube')
    expect(parseUrl('https://twitch.tv/foobar')?.platform).toBe('twitch')
    expect(parseUrl('https://kick.com/foobar')?.platform).toBe('kick')
    expect(parseUrl('https://example.com/foo')).toBeNull()
  })
})
