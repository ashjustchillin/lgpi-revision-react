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
      <header className="flex items-center gap-3 mb-7">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: .93 }}
          onClick={onHome}
          className="relative text-sm font-bold px-3.5 py-2 rounded-xl flex-shrink-0 overflow-hidden"
          style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}
        >
          <span className="relative z-10">LGPI</span>
        </motion.button>

        {/* Title */}
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold tracking-tight flex-1 truncate text-gray-900 dark:text-zinc-100"
        >
          {title}
        </motion.h1>

        {/* Actions desktop */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <SyncDot state={syncState} />

          <motion.button whileTap={{ scale: .9 }} onClick={onDarkToggle}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>

          <div className="relative" ref={accentRef}>
            <motion.button whileTap={{ scale: .9 }}
              onClick={() => setAccentOpen(o => !o)}
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              title="Couleur"
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" style={{ background: accent }} />
            </motion.button>
            <AnimatePresence>
              {accentOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: .92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .92 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 shadow-xl z-50"
                  style={{ width: 160 }}
                >
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Couleur accent</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ACCENT_COLORS.map(ac => (
                      <motion.button key={ac.hex} whileTap={{ scale: .9 }} title={ac.name}
                        onClick={() => { onAccentChange(ac.hex); setAccentOpen(false) }}
                        className="relative w-full aspect-square rounded-xl transition-all flex items-center justify-center"
                        style={{ background: ac.hex + '20' }}
                      >
                        <span className="w-5 h-5 rounded-full shadow-sm" style={{ background: ac.hex }} />
                        {ac.hex === accent && (
                          <span className="absolute inset-0 rounded-xl border-2 border-gray-800 dark:border-white opacity-20" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sync dot mobile */}
        <div className="sm:hidden flex items-center gap-2">
          <SyncDot state={syncState} />
          <button onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm"
          >☰</button>
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
            style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl pt-2 pb-8 px-6 safe-area-inset-bottom"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</p>
              {[
                { icon: '🏠', label: 'Accueil', action: () => { onHome(); setMobileOpen(false) } },
                { icon: '🃏', label: 'Mode révision', action: () => { onRevision(); setMobileOpen(false) } },
                { icon: darkMode ? '☀️' : '🌙', label: darkMode ? 'Mode clair' : 'Mode sombre', action: () => { onDarkToggle(); setMobileOpen(false) } },
              ].map(item => (
                <motion.button key={item.label} whileTap={{ scale: .97 }} onClick={item.action}
                  className="flex items-center gap-3.5 w-full py-3.5 border-b border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-800 dark:text-zinc-200 last:border-0"
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
              {/* Sélecteur couleur mobile */}
              <div className="mt-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Couleur accent</p>
                <div className="flex gap-3">
                  {ACCENT_COLORS.map(ac => (
                    <motion.button key={ac.hex} whileTap={{ scale: .9 }}
                      onClick={() => { onAccentChange(ac.hex) }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: ac.hex + '20' }}
                    >
                      <span className="w-5 h-5 rounded-full shadow-sm" style={{
                        background: ac.hex,
                        outline: ac.hex === accent ? `3px solid ${ac.hex}` : 'none',
                        outlineOffset: 2,
                      }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
