/**
 * Pure randomizer selection. Picks a uniform-random id from `ids`.
 *
 * When `avoidImmediateRepeat` is on and there is more than one candidate, the
 * `lastPickedId` is excluded so the same channel isn't chosen twice running.
 * With a single candidate the rule is impossible to honor, so it's ignored.
 *
 * `rng` is injectable for deterministic tests; defaults to Math.random.
 */
export function pickRandom(
  ids: readonly string[],
  options: {
    lastPickedId?: string
    avoidImmediateRepeat?: boolean
    rng?: () => number
  } = {},
): string | null {
  const { lastPickedId, avoidImmediateRepeat = false, rng = Math.random } = options
  if (ids.length === 0) return null
  if (ids.length === 1) return ids[0] ?? null

  let pool = ids as readonly string[]
  if (avoidImmediateRepeat && lastPickedId !== undefined) {
    const filtered = ids.filter((id) => id !== lastPickedId)
    if (filtered.length > 0) pool = filtered
  }

  const index = Math.floor(rng() * pool.length)
  // Guard against rng() returning exactly 1.
  const safeIndex = Math.min(index, pool.length - 1)
  return pool[safeIndex] ?? null
}
