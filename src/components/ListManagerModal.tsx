import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from './Modal'

export default function ListManagerModal({ onClose }: { onClose: () => void }) {
  const lists = useStore((s) => s.data.lists)
  const channels = useStore((s) => s.data.channels)
  const createList = useStore((s) => s.createList)
  const renameList = useStore((s) => s.renameList)
  const deleteList = useStore((s) => s.deleteList)
  const reorderLists = useStore((s) => s.reorderLists)

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function startEdit(id: string, current: string) {
    setEditingId(id)
    setEditValue(current)
  }
  function commitEdit() {
    if (editingId) renameList(editingId, editValue)
    setEditingId(null)
  }

  function countFor(channelIds: string[]): number {
    return channelIds.filter((id) => channels[id]).length
  }

  return (
    <Modal title="Manage lists" onClose={onClose}>
      <div className="space-y-4">
        <ul className="space-y-1.5">
          {lists.map((list, i) => (
            <li
              key={list.id}
              className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-2.5 py-2"
            >
              {editingId === list.id ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 rounded bg-brand-panel border border-brand-border px-2 py-1 text-sm text-brand-text focus:border-brand-green"
                    aria-label={`Rename ${list.name}`}
                  />
                  <IconBtn label="Save name" onClick={commitEdit}>
                    <Check size={15} />
                  </IconBtn>
                  <IconBtn label="Cancel rename" onClick={() => setEditingId(null)}>
                    <X size={15} />
                  </IconBtn>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-brand-text">{list.name}</p>
                    <p className="text-xs text-brand-muted">{countFor(list.channelIds)} channels</p>
                  </div>
                  <IconBtn
                    label={`Move ${list.name} up`}
                    disabled={i === 0}
                    onClick={() => reorderLists(i, i - 1)}
                  >
                    <ArrowUp size={15} />
                  </IconBtn>
                  <IconBtn
                    label={`Move ${list.name} down`}
                    disabled={i === lists.length - 1}
                    onClick={() => reorderLists(i, i + 1)}
                  >
                    <ArrowDown size={15} />
                  </IconBtn>
                  <IconBtn label={`Rename ${list.name}`} onClick={() => startEdit(list.id, list.name)}>
                    <Pencil size={15} />
                  </IconBtn>
                  {confirmId === list.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        deleteList(list.id)
                        setConfirmId(null)
                      }}
                      className="rounded bg-live/20 px-2 py-1 text-xs font-semibold text-live hover:bg-live/30"
                    >
                      Confirm
                    </button>
                  ) : (
                    <IconBtn
                      label={`Delete ${list.name}`}
                      danger
                      disabled={lists.length === 1}
                      onClick={() => setConfirmId(list.id)}
                    >
                      <Trash2 size={15} />
                    </IconBtn>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (newName.trim()) {
              createList(newName)
              setNewName('')
            }
          }}
          className="flex gap-2 pt-1"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New list name"
            aria-label="New list name"
            className="flex-1 rounded-lg bg-brand-card border border-brand-border px-3 py-2 text-sm text-brand-text placeholder:text-brand-dim focus:border-brand-green"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-brand-bg hover:bg-brand-bright disabled:opacity-40 transition-colors"
          >
            <Plus size={15} /> Add
          </button>
        </form>
      </div>
    </Modal>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? 'text-live hover:bg-live/15'
          : 'text-brand-muted hover:text-brand-bright hover:bg-brand-hover'
      }`}
    >
      {children}
    </button>
  )
}
