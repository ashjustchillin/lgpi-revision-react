import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import { Toast } from './components/UI'
import HomePage from './pages/HomePage'
import ModulePage from './pages/ModulePage'
import FichePage from './pages/FichePage'
import FormPage from './pages/FormPage'
import ModFormPage from './pages/ModFormPage'
import RevisionPage from './pages/RevisionPage'
import { useFirebase } from './hooks/useFirebase'
import { useStats } from './hooks/useStats'
import { useHistory } from './hooks/useHistory'
import { usePinned } from './hooks/usePinned'
import { useNotifications } from './hooks/useNotifications'
import { useMastery } from './hooks/useMastery'
import { collection, addDoc } from 'firebase/firestore'
import { db } from './lib/firebase'

export default function App() {
  const { notes, mods, syncState, saveNote, deleteNote, saveMod, deleteMod, refresh } = useFirebase()
  const { recordSession, getStreak, getLast7Days, getWorstNotes, getGlobalScore, getTotalReviewed, clearStats, stats } = useStats()
  const { history, addToHistory } = useHistory()
  const { pinned, togglePin, isPinned } = usePinned()
  const { permission: notifPermission, settings: notifSettings, requestPermission, saveSettings: saveNotifSettings, sendNotification } = useNotifications()
  const { getLevel, getLevelInfo, setLevel, updateFromRevision, getMasteryStats, clearMastery } = useMastery()

  const [page, setPage] = useState('home')
  const [curMod, setCurMod] = useState(null)
  const [curFiche, setCurFiche] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('lgpi-dark') === '1')
  const [accent, setAccent] = useState(() => localStorage.getItem('lgpi-accent') || '#6C63FF')
  const [toast, setToast] = useState({ msg: '', visible: false })
  let toastTimer = null

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('lgpi-dark', darkMode ? '1' : '0')
  }, [darkMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--accent-bg', accent + '22')
    document.documentElement.style.setProperty('--accent-light', accent + '1a')
    localStorage.setItem('lgpi-accent', accent)
  }, [accent])

  const showToast = useCallback(msg => {
    setToast({ msg, visible: true })
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }, [])

  useEffect(() => {
    const handler = e => {
      const tag = document.activeElement.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      switch (e.key.toLowerCase()) {
        case 'escape':
          if (page === 'module') setPage('home')
          else if (page === 'fiche') setPage('module')
          else if (page === 'form') setPage(editingNote ? 'fiche' : 'module')
          else if (page === 'revision') setPage('home')
          break
        case 'n': if (page === 'module') { setEditingNote(null); setPage('form') }; break
        case 'r': if (page === 'home' || page === 'module') setPage('revision'); break
        case 'd': setDarkMode(d => !d); break
        case '/':
          e.preventDefault()
          if (page === 'home') document.querySelector('#global-search')?.focus()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [page, editingNote])

  const goHome = () => { setPage('home'); setCurFiche(null) }
  const goModule = id => { setCurMod(id); setPage('module') }
  const goFiche = (id, modId = null) => {
    if (modId) setCurMod(modId)
    setCurFiche(id); addToHistory(id); setPage('fiche')
  }
  const goRevision = () => setPage('revision')

  const currentNote = notes.find(n => n.id === curFiche)
  const currentMod = mods.find(m => m.id === curMod)

  // Stats
  const streak = getStreak()
  const last7Days = getLast7Days()
  const globalScore = getGlobalScore()
  const totalReviewed = getTotalReviewed()
  const worstNotes = getWorstNotes(notes, 5)
  const masteryStats = getMasteryStats(notes)

  // Import fiches directes depuis Zendesk
  const handleImportFiches = useCallback(async (fiches) => {
    try {
      let count = 0
      for (const fiche of fiches) {
        // Trouver le module correspondant par nom
        const mod = mods.find(m => m.label.toLowerCase() === (fiche.module || '').toLowerCase())
          || mods.find(m => fiche.module && m.label.toLowerCase().includes(fiche.module.toLowerCase()))
          || mods[0]
        if (!mod) continue
        await saveNote({
          title: fiche.title || 'Ticket Zendesk',
          module: mod.id,
          content: fiche.content || '',
          path: fiche.path || '',
          type: fiche.type || 'attention',
          links: [],
          tags: fiche.tags || [],
          date: new Date().toISOString().slice(0, 10),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        count++
      }
      await refresh()
      showToast(count + ' fiches Zendesk importées ! 🎫')
    } catch (e) {
      console.error(e)
      showToast('Erreur lors de l'import Zendesk')
    }
  }, [mods, saveNote, refresh, showToast])

  // Import JSON — ajoute les données dans Firebase
  const handleImportJSON = useCallback(async ({ notes: importNotes, mods: importMods }) => {
    try {
      let modCount = 0, noteCount = 0
      // Importer les modules manquants
      for (const m of importMods) {
        if (!mods.find(x => x.id === m.id)) {
          await addDoc(collection(db, 'modules'), { ...m, createdAt: m.createdAt || Date.now() })
          modCount++
        }
      }
      // Importer les fiches manquantes
      for (const n of importNotes) {
        if (!notes.find(x => x.id === n.id)) {
          await addDoc(collection(db, 'notes'), n)
          noteCount++
        }
      }
      await refresh()
      showToast(`Import réussi : +${noteCount} fiches, +${modCount} modules`)
    } catch (e) {
      console.error(e)
      showToast('Erreur lors de l\'import')
    }
  }, [notes, mods, refresh, showToast])

  const pageTitle =
    page === 'home' ? 'Mes fiches de notes' :
    page === 'module' ? (currentMod?.label || '') :
    page === 'fiche' ? (currentNote?.title || '') :
    page === 'form' ? (editingNote ? 'Modifier' : 'Nouvelle fiche') :
    page === 'modform' ? 'Nouveau module' : 'Mode révision'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Fond gradient subtil */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-home opacity-60 dark:opacity-30" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Header
          title={pageTitle} syncState={syncState} darkMode={darkMode}
          onDarkToggle={() => setDarkMode(d => !d)}
          accent={accent} onAccentChange={setAccent}
          onHome={goHome} onRevision={goRevision}
        />

        <AnimatePresence mode="wait">
          <motion.div key={page}
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            transition={{ duration: .18, ease: 'easeOut' }}
          >
            {page === 'home' && (
              <HomePage
                mods={mods} notes={notes} syncState={syncState}
                onModule={goModule}
                onAddMod={() => setPage('modform')}
                onDeleteMod={async id => { await deleteMod(id); showToast('Module supprimé') }}
                onRevision={goRevision}
                history={history} onFiche={goFiche}
                stats={stats} streak={streak} last7Days={last7Days}
                globalScore={globalScore} totalReviewed={totalReviewed}
                worstNotes={worstNotes}
                onClearStats={() => { clearStats(); clearMastery(); showToast('Stats réinitialisées') }}
                notifPermission={notifPermission} notifSettings={notifSettings}
                onRequestNotifPermission={requestPermission}
                onSaveNotifSettings={saveNotifSettings}
                onTestNotif={() => { sendNotification('LGPI Notes', 'Notification test !'); showToast('Notification envoyée !') }}
                onImportJSON={handleImportJSON}
                onImportFiches={handleImportFiches}
                getMasteryLevel={getLevel}
                masteryStats={masteryStats}
              />
            )}

            {page === 'module' && currentMod && (
              <ModulePage
                mod={currentMod} notes={notes}
                onBack={goHome}
                onFiche={id => goFiche(id)}
                onNewFiche={() => { setEditingNote(null); setPage('form') }}
                onDeleteNote={async id => { await deleteNote(id); showToast('Fiche supprimée') }}
                pinned={pinned}
                onTogglePin={id => {
                  const was = isPinned(id); togglePin(id)
                  showToast(was ? 'Désépinglée' : 'Épinglée 📌')
                }}
                getMasteryLevel={getLevel}
              />
            )}

            {page === 'fiche' && currentNote && currentMod && (
              <FichePage
                note={currentNote} mod={currentMod} allNotes={notes}
                onBack={dest => { if (dest === 'home') goHome(); else setPage('module') }}
                onEdit={() => { setEditingNote(currentNote); setPage('form') }}
                onDelete={async () => { await deleteNote(curFiche); showToast('Fiche supprimée'); setPage('module') }}
                onFiche={goFiche} onToast={showToast}
                isPinned={isPinned(curFiche)}
                onTogglePin={() => {
                  const was = isPinned(curFiche); togglePin(curFiche)
                  showToast(was ? 'Désépinglée' : 'Épinglée 📌')
                }}
                masteryLevel={getLevel(curFiche)}
                onMasteryChange={level => { setLevel(curFiche, level); showToast('Niveau mis à jour ' + ['🌱','📖','⚡','🔥','⭐'][level]) }}
              />
            )}

            {page === 'form' && (
              <FormPage
                note={editingNote} mods={mods} notes={notes} curMod={curMod}
                onSave={async data => {
                  await saveNote(data); showToast('Sauvegardé ✓')
                  if (editingNote) { setCurFiche(editingNote.id); setPage('fiche') }
                  else setPage('module')
                }}
                onCancel={dest => {
                  if (dest === 'home') goHome()
                  else if (dest === 'fiche') setPage('fiche')
                  else setPage('module')
                }}
              />
            )}

            {page === 'modform' && (
              <ModFormPage
                onSave={async data => { await saveMod(data); showToast('Module créé ! 🎉'); goHome() }}
                onCancel={goHome}
              />
            )}

            {page === 'revision' && (
              <RevisionPage
                notes={notes} mods={mods}
                onBack={goHome}
                onRecordSession={recordSession}
                onUpdateMastery={updateFromRevision}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <Toast message={toast.msg} visible={toast.visible} />
      </div>
    </div>
  )
}
