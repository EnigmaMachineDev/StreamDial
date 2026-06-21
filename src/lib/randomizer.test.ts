import { describe, expect, it } from 'vitest'
import { pickRandom } from './randomizer'

describe('pickRandom', () => {
  it('returns null for an empty list', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('returns the only element for a single-item list', () => {
    expect(pickRandom(['a'])).toBe('a')
  })

  it('returns the single element even if it equals lastPickedId with avoidImmediateRepeat', () => {
    expect(pickRandom(['a'], { lastPickedId: 'a', avoidImmediateRepeat: true })).toBe('a')
  })

  it('selects by the injected rng', () => {
    const ids = ['a', 'b', 'c']
    expect(pickRandom(ids, { rng: () => 0 })).toBe('a')
    expect(pickRandom(ids, { rng: () => 0.5 })).toBe('b')
    expect(pickRandom(ids, { rng: () => 0.99 })).toBe('c')
  })

  it('clamps an rng that returns exactly 1', () => {
    expect(pickRandom(['a', 'b', 'c'], { rng: () => 1 })).toBe('c')
  })

  it('never repeats the last pick when avoidImmediateRepeat is on', () => {
    const ids = ['a', 'b', 'c']
    // rng=0 would normally pick 'a'; with 'a' excluded the pool is [b,c] → 'b'.
    expect(
      pickRandom(ids, { lastPickedId: 'a', avoidImmediateRepeat: true, rng: () => 0 }),
    ).toBe('b')
    // Exhaustive: across many rng values, 'a' is never returned.
    for (let i = 0; i < 100; i++) {
      const pick = pickRandom(ids, {
        lastPickedId: 'a',
        avoidImmediateRepeat: true,
        rng: () => i / 100,
      })
      expect(pick).not.toBe('a')
    }
  })

  it('ignores the repeat rule when it is off', () => {
    expect(
      pickRandom(['a', 'b'], { lastPickedId: 'a', avoidImmediateRepeat: false, rng: () => 0 }),
    ).toBe('a')
  })
})
