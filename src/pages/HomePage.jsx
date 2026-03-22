import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkeletonTile } from '../components/UI'
import Planning from '../components/Planning'

const container = { hidden: {}, show: { transition: { staggerChildren: .05 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export default function HomePage({ mods, notes, syncState, onModule, onAddMod, onDeleteMod, onRevision }) {
  const [search, setSearch] = useState('')

  const results = search.trim()
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(search.toLowerCase()) ||
        (n.tags || []).join(' ').toLowerCase().includes(search.toLowerCase()) ||
        (n.path || '').toLowerCase().includes(search.toLowerCase())
      )
    : []

  const loading = syncState === 'syncing' && mods.length === 0

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">⌕</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans toutes les fiches..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-sm outline-none transition-all"
          style={{ '--tw-ring-color': 'var(--accent)' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)' }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
        />
      </div>

      {/* Search results */}
      <AnimatePresence>
        {search && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs text-gray-400 font-medium mb-3">
              {results.length} fiche{results.length !== 1 ? 's' : ''} trouvée{results.length !== 1 ? 's' : ''} pour "{search}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {results.map(n => {
                const m = mods.find(x => x.id === n.module) || { label: '?', icon: '?', bg: '#eee', color: '#888', tc: '#555' }
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onModule(n.module, n.id)}
                    className="card-base p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-2" style={{ background: m.bg, color: m.tc }}>
                      {m.icon} {m.label}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">{n.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{n.content}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modules grid */}
      {!search && (
        <>
          <p className="text-sm text-gray-400 mb-4">Sélectionne un module pour accéder à ses fiches</p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonTile key={i} />)}
            </div>
          ) : (
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
            >
              {mods.map(m => {
                const cnt = notes.filter(n => n.module === m.id).length
                return (
                  <motion.button
                    key={m.id}
                    variants={item}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,.1)' }}
                    whileTap={{ scale: .97 }}
                    onClick={() => onModule(m.id)}
                    className="relative text-left p-4 rounded-2xl border-0 transition-all group"
                    style={{ background: m.bg }}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(`Supprimer ${m.label} ?`)) onDeleteMod(m.id) }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full text-[10px] items-center justify-center hidden group-hover:flex transition-colors"
                      style={{ background: 'rgba(0,0,0,.15)', color: '#fff' }}
                    >
                      ✕
                    </button>
                    <div className="text-2xl mb-2">{m.icon}</div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: m.tc }}>{m.label}</p>
                    <p className="text-xs opacity-60" style={{ color: m.tc }}>{cnt} fiche{cnt !== 1 ? 's' : ''}</p>
                  </motion.button>
                )
              })}

              {/* Add module */}
              <motion.button
                variants={item}
                whileHover={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                whileTap={{ scale: .97 }}
                onClick={onAddMod}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 text-gray-400 text-sm font-medium transition-all min-h-[115px]"
              >
                <span className="text-2xl">+</span>
                <span>Nouveau module</span>
              </motion.button>
            </motion.div>
          )}

          <div className="flex justify-end mb-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
              onClick={onRevision}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-accent-soft text-accent transition-all"
            >
              🃏 Mode révision
            </motion.button>
          </div>
        </>
      )}

      <Planning />
    </motion.div>
  )
}
