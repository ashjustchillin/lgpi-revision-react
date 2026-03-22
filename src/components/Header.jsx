import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SyncDot } from './UI'
import { ACCENT_COLORS } from '../lib/firebase'

export default function Header({ title, syncState, darkMode, onDarkToggle, accent, onAccentChange, onHome, onRevision }) {
  const [accentOpen, setAccentOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const accentRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (accentRef.current && !accentRef.current.contains(e.target)) setAccentOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <header className="flex items-center gap-3 mb-8">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
          onClick={onHome}
          className="text-sm font-bold px-3.5 py-2 rounded-xl flex-shrink-0"
          style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}
        >
          LGPI
        </motion.button>

        {/* Title */}
        <h1 className="text-xl font-semibold tracking-tight flex-1 truncate text-gray-900 dark:text-zinc-100">
          {title}
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SyncDot state={syncState} />

          {/* Dark toggle */}
          <motion.button
            whileTap={{ scale: .9 }}
            onClick={onDarkToggle}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-zinc-700 text-base hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>

          {/* Accent picker */}
          <div className="relative hidden sm:block" ref={accentRef}>
            <motion.button
              whileTap={{ scale: .9 }}
              onClick={() => setAccentOpen(o => !o)}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-zinc-700 text-base hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              title="Couleur accent"
            >
              🎨
            </motion.button>
            <AnimatePresence>
              {accentOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: .95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .95 }}
                  className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 shadow-xl z-50 flex flex-wrap gap-2 w-44"
                >
                  {ACCENT_COLORS.map(ac => (
                    <button
                      key={ac.hex}
                      title={ac.name}
                      onClick={() => { onAccentChange(ac.hex); setAccentOpen(false) }}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: ac.hex,
                        border: `3px solid ${ac.hex === accent ? '#1d1d1f' : 'transparent'}`,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-zinc-700 text-base"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 sm:hidden"
            style={{ background: 'rgba(0,0,0,.4)' }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</div>
              {[
                { icon: '🏠', label: 'Accueil', action: () => { onHome(); setMobileOpen(false) } },
                { icon: '🃏', label: 'Mode révision', action: () => { onRevision(); setMobileOpen(false) } },
                { icon: darkMode ? '☀️' : '🌙', label: darkMode ? 'Mode clair' : 'Mode sombre', action: () => { onDarkToggle(); setMobileOpen(false) } },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 w-full py-3 border-b border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-800 dark:text-zinc-200 last:border-0"
                >
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
