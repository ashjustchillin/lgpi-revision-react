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
import { ACCENT_COLORS } from './lib/firebase'

const PAGES = ['home', 'module', 'fiche', 'form', 'modform', 'revision']

export default function App() {
  const { notes, mods, syncState, saveNote, deleteNote, saveMod, deleteMod } = useFirebase()

  const [page, setPage] = useState('home')
  const [curMod, setCurMod] = useState(null)
  const [curFiche, setCurFiche] = useState(null)
  const [editingNote, setEditingNote] = useState(null)

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('lgpi-dark') === '1')
  const [accent, setAccent] = useState(() => localStorage.getItem('lgpi-accent') || '#6C63FF')
  const [toast, setToast] = useState({ msg: '', visible: false })
  let toastTimer = null

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('lgpi-dark', darkMode ? '1' : '0')
  }, [darkMode])

  // Apply accent
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

  // Keyboard shortcuts
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

  // Navigation helpers
  const goHome = () => { setPage('home'); setCurFiche(null) }
  const goModule = (modId, ficheId = null) => {
    setCurMod(modId)
    if (ficheId) { setCurFiche(ficheId); setPage('fiche') }
    else setPage('module')
  }
  const goFiche = id => { setCurFiche(id); setPage('fiche') }
  const goRevision = () => setPage('revision')

  const currentNote = notes.find(n => n.id === curFiche)
  const currentMod = mods.find(m => m.id === curMod)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Header
          title={
            page === 'home' ? 'Mes fiches de notes' :
            page === 'module' ? (currentMod?.label || '') :
            page === 'fiche' ? (currentNote?.title || '') :
            page === 'form' ? (editingNote ? 'Modifier' : 'Nouvelle fiche') :
            page === 'modform' ? 'Nouveau module' :
            'Mode révision'
          }
          syncState={syncState}
          darkMode={darkMode}
          onDarkToggle={() => setDarkMode(d => !d)}
          accent={accent}
          onAccentChange={setAccent}
          onHome={goHome}
          onRevision={goRevision}
        />

        <AnimatePresence mode="wait">
          <motion.div key={page}>
            {page === 'home' && (
              <HomePage
                mods={mods} notes={notes} syncState={syncState}
                onModule={goModule}
                onAddMod={() => setPage('modform')}
                onDeleteMod={async id => { await deleteMod(id); showToast('Module supprimé') }}
                onRevision={goRevision}
              />
            )}

            {page === 'module' && currentMod && (
              <ModulePage
                mod={currentMod}
                notes={notes}
                onBack={goHome}
                onFiche={goFiche}
                onNewFiche={() => { setEditingNote(null); setPage('form') }}
                onDeleteNote={async id => { await deleteNote(id); showToast('Fiche supprimée') }}
              />
            )}

            {page === 'fiche' && currentNote && currentMod && (
              <FichePage
                note={currentNote}
                mod={currentMod}
                allNotes={notes}
                onBack={dest => {
                  if (dest === 'home') goHome()
                  else if (dest === 'module') setPage('module')
                }}
                onEdit={() => { setEditingNote(currentNote); setPage('form') }}
                onDelete={async () => {
                  await deleteNote(curFiche)
                  showToast('Fiche supprimée')
                  setPage('module')
                }}
                onFiche={goFiche}
                onToast={showToast}
              />
            )}

            {page === 'form' && (
              <FormPage
                note={editingNote}
                mods={mods}
                notes={notes}
                curMod={curMod}
                onSave={async data => {
                  await saveNote(data)
                  showToast('Sauvegardé ✓')
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
                onSave={async data => {
                  await saveMod(data)
                  showToast('Module créé ! 🎉')
                  goHome()
                }}
                onCancel={goHome}
              />
            )}

            {page === 'revision' && (
              <RevisionPage
                notes={notes} mods={mods}
                onBack={goHome}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <Toast message={toast.msg} visible={toast.visible} />
      </div>
    </div>
  )
}
