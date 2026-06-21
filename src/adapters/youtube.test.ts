import { describe, expect, it } from 'vitest'
import { YouTubeAdapter, ytKind } from './youtube'
import type { StreamChannel } from '../types'

const CHANNEL_ID = 'UC1234567890abcdefghijkl' // UC + 22 chars
const VIDEO_ID = 'dQw4w9WgXcQ' // 11 chars

function chan(identifier: string): StreamChannel {
  return {
    id: 'x',
    platform: 'youtube',
    identifier,
    canonicalUrl: '',
    label: 'l',
    addedAt: 0,
  }
}

describe('YouTubeAdapter.parse', () => {
  it('parses /channel/UC… as a previewable channel', () => {
    const r = YouTubeAdapter.parse(`https://www.youtube.com/channel/${CHANNEL_ID}`)
    expect(r).not.toBeNull()
    expect(r!.kind).toBe('channel')
    expect(r!.identifier).toBe(CHANNEL_ID)
    expect(r!.previewable).toBe(true)
    expect(r!.thumbnailUrl).toBeUndefined()
  })

  it('parses watch?v=VIDEO_ID as a previewable video with a thumbnail', () => {
    const r = YouTubeAdapter.parse(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    expect(r!.kind).toBe('video')
    expect(r!.identifier).toBe(VIDEO_ID)
    expect(r!.previewable).toBe(true)
    expect(r!.thumbnailUrl).toBe(`https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`)
  })

  it('parses youtu.be short links as videos', () => {
    const r = YouTubeAdapter.parse(`https://youtu.be/${VIDEO_ID}`)
    expect(r!.kind).toBe('video')
    expect(r!.identifier).toBe(VIDEO_ID)
  })

  it('parses /live/VIDEO_ID and /embed/VIDEO_ID and /shorts/VIDEO_ID as videos', () => {
    for (const path of ['live', 'embed', 'shorts', 'v']) {
      const r = YouTubeAdapter.parse(`https://www.youtube.com/${path}/${VIDEO_ID}`)
      expect(r!.kind).toBe('video')
      expect(r!.identifier).toBe(VIDEO_ID)
    }
  })

  it('parses /embed/live_stream?channel=UC… as a channel', () => {
    const r = YouTubeAdapter.parse(
      `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`,
    )
    expect(r!.kind).toBe('channel')
    expect(r!.identifier).toBe(CHANNEL_ID)
  })

  it('parses /@handle as link-only (not previewable)', () => {
    const r = YouTubeAdapter.parse('https://www.youtube.com/@LofiGirl')
    expect(r!.kind).toBe('handle')
    expect(r!.identifier).toBe('@LofiGirl')
    expect(r!.suggestedLabel).toBe('LofiGirl')
    expect(r!.previewable).toBe(false)
  })

  it('parses /c/Custom and /user/Legacy as link-only', () => {
    const c = YouTubeAdapter.parse('https://www.youtube.com/c/SomeName')
    expect(c!.kind).toBe('custom')
    expect(c!.previewable).toBe(false)
    const u = YouTubeAdapter.parse('https://www.youtube.com/user/OldName')
    expect(u!.kind).toBe('legacy')
    expect(u!.previewable).toBe(false)
  })

  it('tolerates a missing scheme', () => {
    const r = YouTubeAdapter.parse('youtube.com/@LofiGirl')
    expect(r!.kind).toBe('handle')
  })

  it('returns null for non-YouTube hosts', () => {
    expect(YouTubeAdapter.parse('https://twitch.tv/foo')).toBeNull()
    expect(YouTubeAdapter.parse('not a url')).toBeNull()
  })
})

describe('YouTubeAdapter embed/open URLs', () => {
  it('builds a keyless live embed for a channel', () => {
    expect(YouTubeAdapter.buildEmbedUrl(chan(CHANNEL_ID))).toBe(
      `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&mute=1`,
    )
    expect(YouTubeAdapter.buildOpenUrl(chan(CHANNEL_ID))).toBe(
      `https://www.youtube.com/channel/${CHANNEL_ID}/live`,
    )
  })

  it('builds a video embed and watch open URL', () => {
    expect(YouTubeAdapter.buildEmbedUrl(chan(VIDEO_ID))).toBe(
      `https://www.youtube.com/embed/${VIDEO_ID}?mute=1`,
    )
    expect(YouTubeAdapter.buildOpenUrl(chan(VIDEO_ID))).toBe(
      `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    )
  })

  it('returns null embed for handles, opens the handle page', () => {
    expect(YouTubeAdapter.buildEmbedUrl(chan('@LofiGirl'))).toBeNull()
    expect(YouTubeAdapter.canPreview(chan('@LofiGirl'))).toBe(false)
    expect(YouTubeAdapter.buildOpenUrl(chan('@LofiGirl'))).toBe(
      'https://www.youtube.com/@LofiGirl',
    )
  })
})

describe('ytKind', () => {
  it('classifies identifiers by shape', () => {
    expect(ytKind(CHANNEL_ID)).toBe('channel')
    expect(ytKind(VIDEO_ID)).toBe('video')
    expect(ytKind('@handle')).toBe('handle')
    expect(ytKind('c/Name')).toBe('custom')
    expect(ytKind('user/Name')).toBe('legacy')
  })
})
