import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavBreadcrumb, BackButton } from '../components/UI'
import { getType } from '../lib/utils'
import { MasteryBadge } from '../components/Mastery'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RevisionPage({ notes, mods, onBack, onRecordSession, onUpdateMastery }) {
  const [modFilter, setModFilter] = useState([])
  const [deck, setDeck] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore] = useState({ ok: 0, ko: 0 })
  const [done, setDone] = useState(false)
  const [sessionResults, setSessionResults] = useState([])

  const buildDeck = (filter) => {
    const pool = filter.length ? notes.filter(n => filter.includes(n.module)) : [...notes]
    setDeck(shuffle(pool))
    setIdx(0); setFlipped(false); setScore({ ok: 0, ko: 0 }); setDone(false); setSessionResults([])
  }

  useEffect(() => { buildDeck(modFilter) }, [notes])

  const toggleMod = id => {
    const f = modFilter.includes(id) ? modFilter.filter(x => x !== id) : [...modFilter, id]
    setModFilter(f)
    buildDeck(f)
  }

  const answer = (correct) => {
    const n = deck[idx]
    const result = { noteId: n.id, moduleId: n.module, correct }
    const newResults = [...sessionResults, result]
    setSessionResults(newResults)
    const newScore = { ...score, [correct ? 'ok' : 'ko']: score[correct ? 'ok' : 'ko'] + 1 }
    setScore(newScore)
    // Mettre à jour le niveau de maîtrise
    if (onUpdateMastery) onUpdateMastery(n.id, correct)
    if (idx + 1 >= deck.length) {
      setDone(true)
      onRecordSession(newResults)
    } else {
      setIdx(i => i + 1); setFlipped(false)
    }
  }

  const n = deck[idx]
  const m = n ? (mods.find(x => x.id === n.module) || { label: '?', icon: '?', color: '#888' }) : null
  const tp = n ? getType(n.type) : null
  const pct = done ? Math.round((score.ok / (score.ok + score.ko)) * 100) || 0 : 0

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <NavBreadcrumb crumbs={[{ label: 'Accueil', action: onBack }, { label: 'Mode révision' }]} />
      <BackButton label="Retour" onClick={onBack} />

      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-zinc-100">🃏 Mode révision</h2>
          {!done && deck.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{idx + 1} / {deck.length} · ✓ {score.ok} · ✗ {score.ko}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-5">
        <span className="text-sm text-gray-400 font-medium">Modules :</span>
        {mods.filter(m => notes.some(n => n.module === m.id)).map(m => {
          const cnt = notes.filter(n => n.module === m.id).length
          const on = modFilter.length === 0 || modFilter.includes(m.id)
          return (
            <motion.button key={m.id} whileTap={{ scale: .95 }} onClick={() => toggleMod(m.id)}
              className="text-sm px-3 py-1.5 rounded-full font-medium transition-all"
              style={{ background: m.bg, color: m.tc, opacity: on ? 1 : .45 }}
            >{m.icon} {m.label} ({cnt})</motion.button>
          )
        })}
      </div>

      {deck.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-sm">Crée d'abord quelques fiches !</p>
        </div>
      ) : done ? (
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: .1 }}
            className="text-6xl font-bold mb-2"
            style={{ color: pct >= 70 ? '#1A8C6A' : pct >= 40 ? '#996600' : '#CC0022' }}
          >{pct}%</motion.div>
          <p className="text-gray-400 text-sm mb-2">
            {score.ok} correcte{score.ok > 1 ? 's' : ''} · {score.ko} à revoir
          </p>
          <p className="text-xs text-gray-400 mb-6">
            {pct >= 70 ? '🎉 Excellent travail !' : pct >= 40 ? '💪 Continue comme ça !' : '📚 Encore un peu de révision !'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button whileTap={{ scale: .95 }} onClick={() => buildDeck(modFilter)} className="btn-accent">
              🔄 Recommencer
            </motion.button>
            <motion.button whileTap={{ scale: .95 }} onClick={onBack}
              className="px-4 py-2 text-sm text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-xl"
            >Retour</motion.button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="relative bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-3xl p-8 min-h-64 flex flex-col items-center justify-center text-center cursor-pointer select-none mb-4"
              onClick={() => !flipped && setFlipped(true)}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: m?.color }} />
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: m?.color }}>
                {m?.icon} {m?.label}
              </p>
              <h2 className="text-xl font-semibold tracking-tight leading-snug mb-3 text-gray-900 dark:text-zinc-100">
                {n.title}
              </h2>
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: tp?.bg, color: tp?.color }}>
                  {tp?.emoji} {tp?.label}
                </span>
              </div>

              <AnimatePresence>
                {!flipped && (
                  <motion.p exit={{ opacity: 0 }} className="text-sm text-gray-400 mt-4">
                    Clique pour voir la réponse
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {flipped && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-4">
                    <div className="text-left text-sm text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                      {n.content || '—'}
                    </div>
                    {n.path && <p className="text-left text-xs text-gray-400 italic mt-2">↳ {n.path}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex gap-3 justify-center flex-wrap">
              {!flipped ? (
                <motion.button whileTap={{ scale: .95 }} onClick={() => setFlipped(true)}
                  className="px-8 py-3 bg-accent-soft text-accent rounded-xl text-sm font-semibold"
                >👁 Voir la réponse</motion.button>
              ) : (
                <>
                  <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: .95 }} onClick={() => answer(false)}
                    className="px-6 py-3 bg-red-50 dark:bg-red-950 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                  >✗ À revoir</motion.button>
                  <motion.button initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: .95 }} onClick={() => answer(true)}
                    className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
                  >✓ Je savais</motion.button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}
