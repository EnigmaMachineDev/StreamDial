import { useEffect, useMemo, useState } from 'react'
import { Info, Play, Radio, Square, Twitch, Youtube } from 'lucide-react'
import type { ParsedChannel, Platform, StreamChannel } from '../types'
import { buildEmbedUrl, getAdapter, parseUrl } from '../adapters'
import { useStore } from '../store/useStore'
import Modal from './Modal'
import PlatformBadge from './PlatformBadge'

const PlatformIcon = ({ platform, size = 36 }: { platform: Platform; size?: number }) => {
  if (platform === 'youtube') return <Youtube size={size} />
  if (platform === 'twitch') return <Twitch size={size} />
  return <Radio size={size} />
}

export default function AddChannelModal({ onClose }: { onClose: () => void }) {
  const lists = useStore((s) => s.data.lists)
  const activeListId = useStore((s) => s.data.activeListId)
  const addChannel = useStore((s) => s.addChannel)

  const [input, setInput] = useState('')
  const [label, setLabel] = useState('')
  const [note, setNote] = useState('')
  const [targetListId, setTargetListId] = useState(activeListId ?? lists[0]?.id ?? '')
  const [showPreview, setShowPreview] = useState(false)

  const parsed: ParsedChannel | null = useMemo(() => parseUrl(input), [input])
  const adapter = parsed ? getAdapter(parsed.platform) : null
  const supported = adapter?.enabled ?? false

  // Reset label/preview whenever the parsed target changes.
  useEffect(() => {
    setLabel(parsed?.suggestedLabel ?? '')
    setShowPreview(false)
  }, [parsed?.platform, parsed?.identifier])

  const trimmed = input.trim()
  const showUnrecognized = trimmed.length > 0 && !parsed
  const showHandleHint = parsed?.platform === 'youtube' && !parsed.previewable

  function handleAdd() {
    if (!parsed || !supported || !targetListId) return
    addChannel(parsed, label, note, targetListId)
    onClose()
  }

  // Build a throwaway channel for the in-modal preview.
  const previewEmbed =
    parsed && parsed.previewable && showPreview
      ? buildEmbedUrl({
          id: '',
          platform: parsed.platform,
          identifier: parsed.identifier,
          canonicalUrl: parsed.canonicalUrl,
          label,
          addedAt: 0,
        } as StreamChannel)
      : null

  return (
    <Modal
      title="Add a channel"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!parsed || !supported || !targetListId}
            className="rounded-lg bg-brand-green px-4 py-1.5 text-sm font-semibold text-brand-bg hover:bg-brand-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add channel
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="add-url" className="block text-xs font-semibold text-brand-muted mb-1">
            Channel or stream URL
          </label>
          <input
            id="add-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://www.twitch.tv/… or https://www.youtube.com/…"
            className="w-full rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text placeholder:text-brand-dim focus:border-brand-green"
          />
          {showUnrecognized && (
            <p className="mt-1.5 text-xs text-live">
              That doesn’t look like a YouTube or Twitch URL.
            </p>
          )}
        </div>

        {parsed && (
          <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
            <div className="relative aspect-video bg-brand-panel">
              {previewEmbed ? (
                <iframe
                  src={previewEmbed}
                  title="Live preview"
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  loading="lazy"
                />
              ) : parsed.thumbnailUrl ? (
                <img
                  src={parsed.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-dim">
                  <PlatformIcon platform={parsed.platform} />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <PlatformBadge platform={parsed.platform} />
              </div>
              {parsed.previewable && (
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs text-brand-text hover:bg-black/90 transition-colors"
                >
                  {showPreview ? (
                    <>
                      <Square size={13} /> Stop
                    </>
                  ) : (
                    <>
                      <Play size={13} /> Preview live
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {showHandleHint && (
          <div className="flex gap-2 rounded-lg border border-brand-border bg-brand-card p-3 text-xs text-brand-muted">
            <Info size={16} className="shrink-0 text-brand-green" />
            <p>
              This is a link-only card — no live preview is possible from a YouTube{' '}
              <code className="text-brand-text">@handle</code> URL. To enable a live preview, paste
              the channel’s <code className="text-brand-text">/channel/UC…</code> URL instead (open
              the channel, click <em>…more</em> → <em>Share channel</em> → <em>Copy channel ID</em>,
              or use a channel-ID lookup).
            </p>
          </div>
        )}

        {parsed && !supported && (
          <div className="flex gap-2 rounded-lg border border-brand-border bg-brand-card p-3 text-xs text-brand-muted">
            <Info size={16} className="shrink-0 text-brand-green" />
            <p>{getAdapter(parsed.platform).displayName} support is coming soon — can’t add it yet.</p>
          </div>
        )}

        {parsed && supported && (
          <>
            <div>
              <label htmlFor="add-label" className="block text-xs font-semibold text-brand-muted mb-1">
                Label
              </label>
              <input
                id="add-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Display name"
                className="w-full rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text placeholder:text-brand-dim focus:border-brand-green"
              />
            </div>

            <div>
              <label htmlFor="add-note" className="block text-xs font-semibold text-brand-muted mb-1">
                Note <span className="font-normal">(optional)</span>
              </label>
              <input
                id="add-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. lofi beats, only on weekends…"
                className="w-full rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text placeholder:text-brand-dim focus:border-brand-green"
              />
            </div>

            <div>
              <label htmlFor="add-list" className="block text-xs font-semibold text-brand-muted mb-1">
                Add to list
              </label>
              <select
                id="add-list"
                value={targetListId}
                onChange={(e) => setTargetListId(e.target.value)}
                className="w-full rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text focus:border-brand-green"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
