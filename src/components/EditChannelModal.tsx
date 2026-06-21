import { useState } from 'react'
import type { StreamChannel } from '../types'
import { buildOpenUrl } from '../adapters'
import { useStore } from '../store/useStore'
import Modal from './Modal'
import PlatformBadge from './PlatformBadge'

export default function EditChannelModal({
  channel,
  onClose,
}: {
  channel: StreamChannel
  onClose: () => void
}) {
  const updateChannel = useStore((s) => s.updateChannel)
  const [label, setLabel] = useState(channel.label)
  const [note, setNote] = useState(channel.note ?? '')

  function handleSave() {
    updateChannel(channel.id, { label, note })
    onClose()
  }

  return (
    <Modal
      title="Edit channel"
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
            onClick={handleSave}
            disabled={!label.trim()}
            className="rounded-lg bg-brand-green px-4 py-1.5 text-sm font-semibold text-brand-bg hover:bg-brand-bright disabled:opacity-40 transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <PlatformBadge platform={channel.platform} />
          <span className="truncate">{buildOpenUrl(channel)}</span>
        </div>
        <div>
          <label htmlFor="edit-label" className="block text-xs font-semibold text-brand-muted mb-1">
            Label
          </label>
          <input
            id="edit-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text focus:border-brand-green"
          />
        </div>
        <div>
          <label htmlFor="edit-note" className="block text-xs font-semibold text-brand-muted mb-1">
            Note <span className="font-normal">(optional)</span>
          </label>
          <input
            id="edit-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text focus:border-brand-green"
          />
        </div>
      </div>
    </Modal>
  )
}
