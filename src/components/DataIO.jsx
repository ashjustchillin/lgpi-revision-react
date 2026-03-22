import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportJSON, importJSON } from '../lib/dataIO'

export default function DataIO({ notes, mods, onImport }) {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)

  const handleExport = () => {
    exportJSON(notes, mods)
    setOpen(false)
  }

  const handleFileChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const data = await importJSON(file)
      setImportResult({
        ok: true,
        msg: `${data.notes.length} fiches et ${data.mods.length} modules prêts à importer`,
        data,
      })
    } catch (err) {
      setImportResult({ ok: false, msg: err.message })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (!importResult?.data) return
    await onImport(importResult.data)
    setImportResult(null)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 transition-all hover:border-accent bg-white dark:bg-zinc-800"
      >
        💾 Sauvegarde
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: .95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .95 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 shadow-xl z-50 w-72"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Export / Import
            </p>

            {/* Export */}
            <div className="mb-3 pb-3 border-b border-gray-100 dark:border-zinc-700">
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Exporter</p>
              <p className="text-xs text-gray-400 mb-2">
                Télécharge un fichier JSON avec toutes tes fiches et modules.
              </p>
              <motion.button
                whileTap={{ scale: .96 }}
                onClick={handleExport}
                className="w-full py-2 bg-accent-soft text-accent rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              >
                ⬇️ Exporter ({notes.length} fiches, {mods.length} modules)
              </motion.button>
            </div>

            {/* Import */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Importer</p>
              <p className="text-xs text-gray-400 mb-2">
                Importe un fichier JSON exporté précédemment. Les données existantes seront conservées.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <motion.button
                whileTap={{ scale: .96 }}
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="w-full py-2 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-500 dark:text-zinc-400 font-medium hover:border-accent hover:text-accent transition-all disabled:opacity-50"
              >
                {importing ? '⏳ Lecture...' : '⬆️ Choisir un fichier JSON'}
              </motion.button>

              <AnimatePresence>
                {importResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-2 p-3 rounded-xl text-xs ${importResult.ok ? 'bg-green-50 dark:bg-green-950 text-green-600' : 'bg-red-50 dark:bg-red-950 text-red-500'}`}>
                      {importResult.ok ? '✓' : '✗'} {importResult.msg}
                    </div>
                    {importResult.ok && (
                      <div className="flex gap-2 mt-2">
                        <motion.button
                          whileTap={{ scale: .96 }}
                          onClick={handleConfirmImport}
                          className="flex-1 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--accent)' }}
                        >
                          Confirmer l'import
                        </motion.button>
                        <button
                          onClick={() => setImportResult(null)}
                          className="px-3 py-1.5 text-xs text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
