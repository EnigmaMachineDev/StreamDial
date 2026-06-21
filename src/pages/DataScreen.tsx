import { useRef, useState } from 'react'
import { AlertTriangle, Download, Upload } from 'lucide-react'
import type { AppData } from '../types'
import { useStore } from '../store/useStore'
import { SCHEMA_VERSION, SITE_NAME } from '../config/site'
import { downloadExport, parseImport } from '../lib/importExport'

export default function DataScreen() {
  const data = useStore((s) => s.data)
  const importMerge = useStore((s) => s.importMerge)
  const importReplace = useStore((s) => s.importReplace)
  const clearAll = useStore((s) => s.clearAll)
  const avoidImmediateRepeat = useStore((s) => s.data.settings.avoidImmediateRepeat)
  const setAvoidImmediateRepeat = useStore((s) => s.setAvoidImmediateRepeat)

  const fileRef = useRef<HTMLInputElement>(null)
  const [staged, setStaged] = useState<AppData | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const channelCount = Object.keys(data.channels).length

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    setStaged(null)
    setImportError(null)
    setImportMsg(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = parseImport(String(reader.result ?? ''))
      if (result.ok) {
        setStaged(result.data)
      } else {
        setImportError(result.error)
      }
    }
    reader.onerror = () => setImportError('Could not read that file.')
    reader.readAsText(file)
  }

  function applyMerge() {
    if (!staged) return
    importMerge(staged)
    setImportMsg('Merged imported lists and channels into your data.')
    setStaged(null)
  }
  function applyReplace() {
    if (!staged) return
    importReplace(staged)
    setImportMsg('Replaced all data with the imported file.')
    setStaged(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <header>
        <h1 className="text-2xl text-brand-bright">Data</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Your lists live only in this browser. Back them up or move them between devices here.
        </p>
      </header>

      {/* Settings */}
      <section className="rounded-xl border border-brand-border bg-brand-card p-4">
        <h2 className="text-base text-brand-text mb-3">Randomizer</h2>
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-sm text-brand-text">
            Avoid immediate repeat
            <span className="block text-xs text-brand-muted">
              Don’t pick the same channel twice in a row.
            </span>
          </span>
          <input
            type="checkbox"
            checked={avoidImmediateRepeat}
            onChange={(e) => setAvoidImmediateRepeat(e.target.checked)}
            className="h-5 w-5 accent-brand-green"
          />
        </label>
      </section>

      {/* Export */}
      <section className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-3">
        <h2 className="text-base text-brand-text">Export</h2>
        <p className="text-sm text-brand-muted">
          Download all {channelCount} channel{channelCount === 1 ? '' : 's'} and{' '}
          {data.lists.length} list{data.lists.length === 1 ? '' : 's'} as a JSON file.
        </p>
        <button
          type="button"
          onClick={() => downloadExport(data)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-brand-bg hover:bg-brand-bright transition-colors"
        >
          <Download size={16} /> Export JSON
        </button>
      </section>

      {/* Import */}
      <section className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-3">
        <h2 className="text-base text-brand-text">Import</h2>
        <p className="text-sm text-brand-muted">
          Load a previously exported file. Choose whether to merge it with your current data or
          replace everything.
        </p>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="sr-only" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-green px-4 py-2 text-sm font-semibold text-brand-bright hover:bg-brand-accent/20 transition-colors"
        >
          <Upload size={16} /> Choose file…
        </button>

        {importError && (
          <p className="flex items-center gap-2 text-sm text-live">
            <AlertTriangle size={15} /> {importError}
          </p>
        )}

        {staged && (
          <div className="rounded-lg border border-brand-border bg-brand-panel p-3 space-y-3">
            <p className="text-sm text-brand-text">
              File loaded: {Object.keys(staged.channels).length} channels, {staged.lists.length}{' '}
              lists. How should it be applied?
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyMerge}
                className="rounded-lg bg-brand-green px-3 py-1.5 text-sm font-semibold text-brand-bg hover:bg-brand-bright transition-colors"
              >
                Merge
              </button>
              <button
                type="button"
                onClick={applyReplace}
                className="rounded-lg border border-live/60 px-3 py-1.5 text-sm font-semibold text-live hover:bg-live/15 transition-colors"
              >
                Replace everything
              </button>
              <button
                type="button"
                onClick={() => setStaged(null)}
                className="rounded-lg px-3 py-1.5 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {importMsg && <p className="text-sm text-brand-green">{importMsg}</p>}
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-live/30 bg-brand-card p-4 space-y-3">
        <h2 className="text-base text-brand-text">Clear data</h2>
        <p className="text-sm text-brand-muted">
          Permanently delete all lists and channels from this browser. Export first if you want a
          backup.
        </p>
        {confirmClear ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-live">This can’t be undone.</span>
            <button
              type="button"
              onClick={() => {
                clearAll()
                setConfirmClear(false)
                setImportMsg(null)
              }}
              className="rounded-lg bg-live/20 px-3 py-1.5 text-sm font-semibold text-live hover:bg-live/30 transition-colors"
            >
              Delete everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-hover transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="rounded-lg border border-live/60 px-4 py-2 text-sm font-semibold text-live hover:bg-live/15 transition-colors"
          >
            Clear all data
          </button>
        )}
      </section>

      <p className="text-center text-xs text-brand-dim">
        {SITE_NAME} · data schema v{SCHEMA_VERSION}
      </p>
    </div>
  )
}
