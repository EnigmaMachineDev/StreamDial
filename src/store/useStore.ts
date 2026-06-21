import { create } from 'zustand'
import type { AppData, ChannelList, ParsedChannel, StreamChannel } from '../types'
import { loadAppData, saveAppDataDebounced } from '../lib/storage'
import { newId } from '../lib/id'
import { pickRandom } from '../lib/randomizer'
import { mergeData } from '../lib/importExport'
import { defaultAppData } from '../lib/migrate'

function arrayMove<T>(arr: readonly T[], from: number, to: number): T[] {
  const next = [...arr]
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next
  const [item] = next.splice(from, 1)
  if (item !== undefined) next.splice(to, 0, item)
  return next
}

function touch(list: ChannelList): ChannelList {
  return { ...list, updatedAt: Date.now() }
}

const channelKey = (platform: string, identifier: string) => `${platform}:${identifier}`

interface StoreState {
  data: AppData
  /** Runtime-only: last randomized pick per list, for avoid-immediate-repeat. */
  lastPickedByList: Record<string, string>

  // ── Channels ────────────────────────────────────────────────
  /** Add (or reuse an existing duplicate) channel and reference it from a list. */
  addChannel: (parsed: ParsedChannel, label: string, note?: string, listId?: string) => string
  updateChannel: (id: string, patch: Partial<Pick<StreamChannel, 'label' | 'note'>>) => void
  removeChannelFromList: (listId: string, channelId: string) => void
  deleteChannelEverywhere: (channelId: string) => void
  reorderChannel: (listId: string, from: number, to: number) => void
  copyChannelToList: (channelId: string, targetListId: string) => void
  moveChannelToList: (channelId: string, fromListId: string, targetListId: string) => void

  // ── Lists ───────────────────────────────────────────────────
  createList: (name: string) => string
  renameList: (id: string, name: string) => void
  deleteList: (id: string) => void
  reorderLists: (from: number, to: number) => void
  setActiveList: (id: string) => void

  // ── Settings / data ─────────────────────────────────────────
  setAvoidImmediateRepeat: (value: boolean) => void
  pickRandomForList: (listId: string) => StreamChannel | null
  importMerge: (incoming: AppData) => void
  importReplace: (incoming: AppData) => void
  clearAll: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  data: loadAppData(),
  lastPickedByList: {},

  addChannel: (parsed, label, note, listId) => {
    const state = get()
    const targetId = listId ?? state.data.activeListId ?? state.data.lists[0]?.id
    if (!targetId) return ''

    // Reuse an existing channel with the same platform+identifier.
    const key = channelKey(parsed.platform, parsed.identifier)
    const existing = Object.values(state.data.channels).find(
      (c) => channelKey(c.platform, c.identifier) === key,
    )
    const id = existing?.id ?? newId()

    set((s) => {
      const channels = { ...s.data.channels }
      if (!existing) {
        const channel: StreamChannel = {
          id,
          platform: parsed.platform,
          identifier: parsed.identifier,
          canonicalUrl: parsed.canonicalUrl,
          label: label.trim() || parsed.suggestedLabel,
          addedAt: Date.now(),
        }
        if (parsed.thumbnailUrl) channel.thumbnailUrl = parsed.thumbnailUrl
        const trimmedNote = note?.trim()
        if (trimmedNote) channel.note = trimmedNote
        channels[id] = channel
      }
      const lists = s.data.lists.map((l) =>
        l.id === targetId && !l.channelIds.includes(id)
          ? touch({ ...l, channelIds: [...l.channelIds, id] })
          : l,
      )
      return { data: { ...s.data, channels, lists } }
    })
    return id
  },

  updateChannel: (id, patch) =>
    set((s) => {
      const channel = s.data.channels[id]
      if (!channel) return s
      const next: StreamChannel = { ...channel }
      if (patch.label !== undefined) next.label = patch.label.trim() || channel.label
      if (patch.note !== undefined) {
        const t = patch.note.trim()
        if (t) next.note = t
        else delete next.note
      }
      return { data: { ...s.data, channels: { ...s.data.channels, [id]: next } } }
    }),

  removeChannelFromList: (listId, channelId) =>
    set((s) => ({
      data: {
        ...s.data,
        lists: s.data.lists.map((l) =>
          l.id === listId
            ? touch({ ...l, channelIds: l.channelIds.filter((c) => c !== channelId) })
            : l,
        ),
      },
    })),

  deleteChannelEverywhere: (channelId) =>
    set((s) => {
      const channels = { ...s.data.channels }
      delete channels[channelId]
      return {
        data: {
          ...s.data,
          channels,
          lists: s.data.lists.map((l) =>
            l.channelIds.includes(channelId)
              ? touch({ ...l, channelIds: l.channelIds.filter((c) => c !== channelId) })
              : l,
          ),
        },
      }
    }),

  reorderChannel: (listId, from, to) =>
    set((s) => ({
      data: {
        ...s.data,
        lists: s.data.lists.map((l) =>
          l.id === listId ? touch({ ...l, channelIds: arrayMove(l.channelIds, from, to) }) : l,
        ),
      },
    })),

  copyChannelToList: (channelId, targetListId) =>
    set((s) => ({
      data: {
        ...s.data,
        lists: s.data.lists.map((l) =>
          l.id === targetListId && !l.channelIds.includes(channelId)
            ? touch({ ...l, channelIds: [...l.channelIds, channelId] })
            : l,
        ),
      },
    })),

  moveChannelToList: (channelId, fromListId, targetListId) =>
    set((s) => ({
      data: {
        ...s.data,
        lists: s.data.lists.map((l) => {
          if (l.id === fromListId) {
            return touch({ ...l, channelIds: l.channelIds.filter((c) => c !== channelId) })
          }
          if (l.id === targetListId && !l.channelIds.includes(channelId)) {
            return touch({ ...l, channelIds: [...l.channelIds, channelId] })
          }
          return l
        }),
      },
    })),

  createList: (name) => {
    const id = newId()
    const now = Date.now()
    set((s) => ({
      data: {
        ...s.data,
        lists: [
          ...s.data.lists,
          { id, name: name.trim() || 'New List', channelIds: [], createdAt: now, updatedAt: now },
        ],
        activeListId: id,
      },
    }))
    return id
  },

  renameList: (id, name) =>
    set((s) => ({
      data: {
        ...s.data,
        lists: s.data.lists.map((l) =>
          l.id === id ? touch({ ...l, name: name.trim() || l.name }) : l,
        ),
      },
    })),

  deleteList: (id) =>
    set((s) => {
      const remaining = s.data.lists.filter((l) => l.id !== id)
      const lists = remaining.length > 0 ? remaining : defaultAppData().lists
      const activeListId =
        s.data.activeListId === id ? lists[0]?.id : s.data.activeListId
      return { data: { ...s.data, lists, activeListId } }
    }),

  reorderLists: (from, to) =>
    set((s) => ({ data: { ...s.data, lists: arrayMove(s.data.lists, from, to) } })),

  setActiveList: (id) =>
    set((s) => (s.data.lists.some((l) => l.id === id) ? { data: { ...s.data, activeListId: id } } : s)),

  setAvoidImmediateRepeat: (value) =>
    set((s) => ({ data: { ...s.data, settings: { ...s.data.settings, avoidImmediateRepeat: value } } })),

  pickRandomForList: (listId) => {
    const state = get()
    const list = state.data.lists.find((l) => l.id === listId)
    if (!list) return null
    const pick = pickRandom(list.channelIds, {
      lastPickedId: state.lastPickedByList[listId],
      avoidImmediateRepeat: state.data.settings.avoidImmediateRepeat,
    })
    if (!pick) return null
    set((s) => ({ lastPickedByList: { ...s.lastPickedByList, [listId]: pick } }))
    return state.data.channels[pick] ?? null
  },

  importMerge: (incoming) => set((s) => ({ data: mergeData(s.data, incoming) })),
  importReplace: (incoming) => set({ data: incoming }),
  clearAll: () => set({ data: defaultAppData(), lastPickedByList: {} }),
}))

// Persist (debounced) whenever the data slice changes.
useStore.subscribe((state, prev) => {
  if (state.data !== prev.data) saveAppDataDebounced(state.data)
})
