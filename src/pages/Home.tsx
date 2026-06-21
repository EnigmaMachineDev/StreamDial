import { useState } from 'react'
import { ListPlus, Plus, Shuffle, Tv } from 'lucide-react'
import type { StreamChannel } from '../types'
import { buildOpenUrl } from '../adapters'
import { useStore } from '../store/useStore'
import { SITE_NAME, SITE_TAGLINE } from '../config/site'
import ChannelCard from '../components/ChannelCard'
import AddChannelModal from '../components/AddChannelModal'
import EditChannelModal from '../components/EditChannelModal'
import ListManagerModal from '../components/ListManagerModal'

function openChannel(channel: StreamChannel) {
  window.open(buildOpenUrl(channel), '_blank', 'noopener,noreferrer')
}

export default function Home() {
  const lists = useStore((s) => s.data.lists)
  const channels = useStore((s) => s.data.channels)
  const activeListId = useStore((s) => s.data.activeListId)
  const setActiveList = useStore((s) => s.setActiveList)
  const pickRandomForList = useStore((s) => s.pickRandomForList)
  const removeChannelFromList = useStore((s) => s.removeChannelFromList)
  const copyChannelToList = useStore((s) => s.copyChannelToList)
  const moveChannelToList = useStore((s) => s.moveChannelToList)

  const [showAdd, setShowAdd] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [editing, setEditing] = useState<StreamChannel | null>(null)
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)

  const activeList = lists.find((l) => l.id === activeListId) ?? lists[0]
  const items = activeList
    ? activeList.channelIds.map((id) => channels[id]).filter((c): c is StreamChannel => Boolean(c))
    : []

  function handleRandomize() {
    if (!activeList) return
    const pick = pickRandomForList(activeList.id)
    if (pick) openChannel(pick)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl text-brand-bright">{SITE_NAME}</h1>
        <p className="mt-1 text-sm text-brand-muted">{SITE_TAGLINE}</p>
      </section>

      {/* List bar */}
      <div className="flex items-center gap-2 mb-4 border-b border-brand-border pb-3">
        <div
          className="flex-1 flex items-center gap-1.5 overflow-x-auto"
          role="tablist"
          aria-label="Channel lists"
        >
          {lists.map((l) => {
            const active = l.id === activeList?.id
            return (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveList(l.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-brand-accent/30 text-brand-bright'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-hover'
                }`}
              >
                {l.name}
                <span className="ml-1.5 text-xs text-brand-dim">
                  {l.channelIds.filter((id) => channels[id]).length}
                </span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowManage(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1.5 text-xs text-brand-muted hover:text-brand-bright hover:border-brand-green transition-colors"
        >
          <ListPlus size={14} /> <span className="hidden sm:inline">Manage lists</span>
        </button>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={handleRandomize}
          disabled={items.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-brand-bg hover:bg-brand-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Shuffle size={16} /> Randomize
        </button>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-green px-4 py-2 text-sm font-semibold text-brand-bright hover:bg-brand-accent/20 transition-colors"
        >
          <Plus size={16} /> Add channel
        </button>
      </div>

      {/* Grid or empty state */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-card/40 py-16 text-center">
          <Tv size={40} className="mx-auto text-brand-dim" />
          <p className="mt-3 text-sm text-brand-text">
            {activeList ? `“${activeList.name}” has no channels yet.` : 'No list selected.'}
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            Add a YouTube or Twitch channel to get started.
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-brand-bg hover:bg-brand-bright transition-colors"
          >
            <Plus size={16} /> Add channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              otherLists={lists
                .filter((l) => l.id !== activeList?.id)
                .map((l) => ({ id: l.id, name: l.name }))}
              isPreviewing={activePreviewId === channel.id}
              onTogglePreview={() =>
                setActivePreviewId((cur) => (cur === channel.id ? null : channel.id))
              }
              onOpen={() => openChannel(channel)}
              onEdit={() => setEditing(channel)}
              onRemove={() => activeList && removeChannelFromList(activeList.id, channel.id)}
              onCopyTo={(listId) => copyChannelToList(channel.id, listId)}
              onMoveTo={(listId) =>
                activeList && moveChannelToList(channel.id, activeList.id, listId)
              }
            />
          ))}
        </div>
      )}

      {/* Reserved content slot — intro / how-it-works. Leaves room for future
          Mediavine Grow content without restructuring the page. */}
      <section className="mt-16 max-w-3xl space-y-4 text-sm text-brand-muted">
        <h2 className="text-lg text-brand-bright">How it works</h2>
        <p>
          {SITE_NAME} lets you keep your own lists of livestream channels — lofi radios, art
          streams, music DJs — and jump to whatever’s live. Paste a YouTube or Twitch URL and it’s
          parsed right in your browser; nothing is sent to a server, and there’s no account.
        </p>
        <p>
          Hit <strong className="text-brand-text">Randomize</strong> to open a random channel from
          the active list in a new tab, or preview a channel live without leaving the page. YouTube
          live previews need the channel’s <code className="text-brand-text">/channel/UC…</code> URL;
          handle-only links still work as quick-open cards.
        </p>
        <p>
          Everything lives in your browser’s local storage. Use the{' '}
          <strong className="text-brand-text">Data</strong> screen to export a backup or move your
          lists to another device.
        </p>
      </section>

      {showAdd && <AddChannelModal onClose={() => setShowAdd(false)} />}
      {showManage && <ListManagerModal onClose={() => setShowManage(false)} />}
      {editing && <EditChannelModal channel={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
