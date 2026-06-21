import { STORAGE_KEY } from '../config/site'
import type { AppData } from '../types'
import { gcOrphans, migrate } from './migrate'

/** Load and normalize persisted state. Always returns a valid AppData. */
export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return migrate(raw ? JSON.parse(raw) : null)
  } catch {
    return migrate(null)
  }
}

/** Persist immediately (GC's orphaned channels first). Swallows quota errors. */
export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gcOrphans(data)))
  } catch {
    // Storage full or unavailable — nothing actionable here.
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined

/** Debounced persist, to coalesce bursts of state changes. */
export function saveAppDataDebounced(data: AppData, delayMs = 300): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveAppData(data), delayMs)
}

/** Wipe persisted state. */
export function clearAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
