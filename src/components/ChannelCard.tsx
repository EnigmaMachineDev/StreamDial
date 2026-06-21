import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  ExternalLink,
  FolderInput,
  MoreVertical,
  Pencil,
  Play,
  Radio,
  Square,
  Trash2,
  Twitch,
  Youtube,
} from 'lucide-react'
import type { Platform, StreamChannel } from '../types'
import { buildEmbedUrl, canPreview } from '../adapters'
import PlatformBadge from './PlatformBadge'

const PlatformIcon = ({ platform, size = 40 }: { platform: Platform; size?: number }) => {
  if (platform === 'youtube') return <Youtube size={size} />
  if (platform === 'twitch') return <Twitch size={size} />
  return <Radio size={size} />
}

interface ChannelCardProps {
  channel: StreamChannel
  otherLists: { id: string; name: string }[]
  isPreviewing: boolean
  onTogglePreview: () => void
  onOpen: () => void
  onEdit: () => void
  onRemove: () => void
  onCopyTo: (listId: string) => void
  onMoveTo: (listId: string) => void
}

export default function ChannelCard({
  channel,
  otherLists,
  isPreviewing,
  onTogglePreview,
  onOpen,
  onEdit,
  onRemove,
  onCopyTo,
  onMoveTo,
}: ChannelCardProps) {
  const previewable = canPreview(channel)
  const embedUrl = isPreviewing ? buildEmbedUrl(channel) : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [submenu, setSubmenu] = useState<'copy' | 'move' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) setSubmenu(null)
  }, [menuOpen])

  return (
    <div className="group flex flex-col rounded-xl bg-brand-card border border-brand-border overflow-hidden transition-colors hover:border-brand-green">
      {/* Media area: 16:9 */}
      <div className="relative aspect-video bg-brand-panel">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`Live preview of ${channel.label}`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        ) : channel.thumbnailUrl ? (
          <img
            src={channel.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-brand-dim">
            <PlatformIcon platform={channel.platform} />
          </div>
        )}

        {/* Top overlays */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <PlatformBadge platform={channel.platform} />
          {previewable ? (
            <span className="inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-live">
              <span className="w-1.5 h-1.5 rounded-full bg-live" /> Live
            </span>
          ) : (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              Link only
            </span>
          )}
        </div>

        {/* Preview controls */}
        {previewable && (
          <button
            type="button"
            onClick={onTogglePreview}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs text-brand-text hover:bg-black/90 transition-colors"
          >
            {isPreviewing ? (
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

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-brand-text" title={channel.label}>
            {channel.label}
          </h3>
          {channel.note && (
            <p className="truncate text-xs text-brand-muted" title={channel.note}>
              {channel.note}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-accent/30 px-2.5 py-1.5 text-xs text-brand-bright hover:bg-brand-accent/50 transition-colors"
          >
            <ExternalLink size={13} /> Open
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`More actions for ${channel.label}`}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand-bright hover:bg-brand-hover transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 bottom-full mb-1 z-20 w-44 rounded-lg border border-brand-border bg-brand-panel py-1 shadow-xl"
              >
                <MenuItem
                  icon={<Pencil size={14} />}
                  label="Edit"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit()
                  }}
                />
                {otherLists.length > 0 && (
                  <>
                    <SubmenuToggle
                      icon={<Copy size={14} />}
                      label="Copy to…"
                      open={submenu === 'copy'}
                      onClick={() => setSubmenu((s) => (s === 'copy' ? null : 'copy'))}
                    />
                    {submenu === 'copy' &&
                      otherLists.map((l) => (
                        <MenuItem
                          key={l.id}
                          indent
                          label={l.name}
                          onClick={() => {
                            setMenuOpen(false)
                            onCopyTo(l.id)
                          }}
                        />
                      ))}
                    <SubmenuToggle
                      icon={<FolderInput size={14} />}
                      label="Move to…"
                      open={submenu === 'move'}
                      onClick={() => setSubmenu((s) => (s === 'move' ? null : 'move'))}
                    />
                    {submenu === 'move' &&
                      otherLists.map((l) => (
                        <MenuItem
                          key={l.id}
                          indent
                          label={l.name}
                          onClick={() => {
                            setMenuOpen(false)
                            onMoveTo(l.id)
                          }}
                        />
                      ))}
                  </>
                )}
                <MenuItem
                  icon={<Trash2 size={14} />}
                  label="Remove from list"
                  danger
                  onClick={() => {
                    setMenuOpen(false)
                    onRemove()
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  indent,
}: {
  icon?: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  indent?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-brand-hover ${
        danger ? 'text-live' : 'text-brand-text'
      } ${indent ? 'pl-8' : ''}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}

function SubmenuToggle({
  icon,
  label,
  open,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-brand-text transition-colors hover:bg-brand-hover"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
