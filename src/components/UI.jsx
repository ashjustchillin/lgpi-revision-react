import { motion, AnimatePresence } from 'framer-motion'
import { TYPES } from '../lib/firebase'
import { getType } from '../lib/utils'

// ── SYNC DOT ─────────────────────────────────────────────
export function SyncDot({ state }) {
  return (
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 sync-${state}`}
      title={state === 'ok' ? 'Synchronisé' : state === 'syncing' ? 'Synchronisation...' : 'Erreur de connexion'}
    />
  )
}

// ── TOAST ─────────────────────────────────────────────────
export function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 8, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-xl font-medium whitespace-nowrap"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── BREADCRUMB NAV ────────────────────────────────────────
export function NavBreadcrumb({ crumbs }) {
  return (
    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300 dark:text-zinc-600 text-xs">›</span>}
          <span
            onClick={c.action}
            className={`text-xs font-medium transition-colors cursor-pointer ${
              i === crumbs.length - 1
                ? 'text-gray-800 dark:text-zinc-200 font-semibold cursor-default'
                : 'text-gray-400 dark:text-zinc-500 hover:text-accent'
            }`}
            style={i === crumbs.length - 1 ? {} : {}}
          >
            {c.label}
          </span>
        </span>
      ))}
    </div>
  )
}

// ── BACK BUTTON ────────────────────────────────────────────
export function BackButton({ label, onClick }) {
  return (
    <motion.button
      whileHover={{ x: -2 }}
      onClick={onClick}
      className="flex items-center gap-2 mb-4 px-2 py-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-colors"
    >
      <span className="text-gray-400 dark:text-zinc-500 text-base">←</span>
      <span className="text-sm font-medium text-gray-400 dark:text-zinc-500">{label}</span>
    </motion.button>
  )
}

// ── TYPE BADGE ─────────────────────────────────────────────
export function TypeBadge({ typeId, size = 'sm' }) {
  const tp = getType(typeId)
  const cls = size === 'lg'
    ? 'text-xs font-semibold px-3 py-1.5 rounded-full'
    : 'text-[10px] font-semibold px-2 py-0.5 rounded-full'
  return (
    <span className={cls} style={{ background: tp.bg, color: tp.color }}>
      {tp.emoji} {tp.label}
    </span>
  )
}

// ── MODULE PILL ────────────────────────────────────────────
export function ModulePill({ mod }) {
  if (!mod) return null
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{ background: mod.bg, color: mod.tc }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: mod.color }} />
      {mod.label}
    </span>
  )
}

// ── SKELETON CARD ──────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="skeleton p-4 min-h-[120px]">
      <div className="flex justify-between mb-3">
        <div className="h-3.5 w-3/4 rounded-full bg-gray-100 dark:bg-zinc-700" />
        <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-zinc-700" />
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-zinc-700 mb-2" />
      <div className="h-2.5 w-2/3 rounded-full bg-gray-100 dark:bg-zinc-700 mb-4" />
      <div className="h-2 w-1/3 rounded-full bg-gray-100 dark:bg-zinc-700" />
    </div>
  )
}

// ── SKELETON TILE ──────────────────────────────────────────
export function SkeletonTile() {
  return (
    <div className="skeleton p-4 min-h-[115px]">
      <div className="h-7 w-7 rounded-xl bg-gray-100 dark:bg-zinc-700 mb-3" />
      <div className="h-3 w-3/4 rounded-full bg-gray-100 dark:bg-zinc-700 mb-2" />
      <div className="h-2.5 w-1/2 rounded-full bg-gray-100 dark:bg-zinc-700" />
    </div>
  )
}

// ── CHIP (TAG) ─────────────────────────────────────────────
export function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent-soft text-accent text-xs px-2.5 py-1 rounded-full font-medium">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="opacity-50 hover:opacity-100 text-[10px] leading-none">✕</button>
      )}
    </span>
  )
}

// ── CONFIRM MODAL ──────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,.4)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: .95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .95 }}
          className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="btn-ghost">Annuler</button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
