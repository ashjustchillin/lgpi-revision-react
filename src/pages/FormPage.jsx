import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { NavBreadcrumb, BackButton, Chip } from '../components/UI'
import { TYPES } from '../lib/firebase'
import { todayStr } from '../lib/utils'

export default function FormPage({ note, mods, notes, curMod, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || '')
  const [module, setModule] = useState(note?.module || curMod || mods[0]?.id || '')
  const [type, setType] = useState(note?.type || 'procedure')
  const [path, setPath] = useState(note?.path || '')
  const [content, setContent] = useState(note?.content || '')
  const [tags, setTags] = useState(note?.tags || [])
  const [links, setLinks] = useState(note?.links || [])
  const [tagInput, setTagInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [linkSearch, setLinkSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const tagRef = useRef(null)

  const curModObj = mods.find(m => m.id === module) || mods[0]
  const pathSteps = path ? path.split('>').map(s => s.trim()).filter(Boolean) : []
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))]
  const filteredNotes = notes.filter(n =>
    n.id !== note?.id &&
    (!linkSearch || n.title.toLowerCase().includes(linkSearch.toLowerCase()))
  )

  const updateTagSuggestions = val => {
    if (!val) { setSuggestions([]); return }
    const q = val.toLowerCase()
    setSuggestions(allTags.filter(t => t.toLowerCase().includes(q) && !tags.includes(t)).slice(0, 6))
  }

  const addTag = val => {
    const v = val.trim()
    if (v && !tags.includes(v)) setTags(t => [...t, v])
    setTagInput(''); setSuggestions([])
  }

  const handleSave = async () => {
    if (!title.trim()) { alert('Le titre est requis.'); return }
    setSaving(true)
    const now = Date.now()
    const data = {
      title: title.trim(), module, content: content.trim(), path: path.trim(),
      type, links, tags, date: todayStr(),
      createdAt: note ? (note.createdAt || now) : now,
      updatedAt: now,
    }
    if (note?.id) data.id = note.id
    try { await onSave(data) } finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <NavBreadcrumb crumbs={[
        { label: 'Accueil', action: () => onCancel('home') },
        { label: curModObj?.label || 'Module', action: () => onCancel('module') },
        { label: note ? 'Modifier' : 'Nouvelle fiche' },
      ]} />
      <BackButton label="Annuler" onClick={() => onCancel(note ? 'fiche' : 'module')} />

      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 max-w-2xl">

        {/* Section Informations */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-zinc-700">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">Informations</p>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Titre</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Titre de la fiche"
              className="input-base" />
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Module</label>
            <select value={module} onChange={e => setModule(e.target.value)} className="input-base">
              {mods.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(tp => (
                <motion.button
                  key={tp.id}
                  whileTap={{ scale: .95 }}
                  onClick={() => setType(tp.id)}
                  className="px-3 py-1.5 rounded-xl border-2 text-sm transition-all"
                  style={type === tp.id
                    ? { background: tp.bg, borderColor: tp.color, color: tp.color, fontWeight: 600 }
                    : { borderColor: '#d1d5db', color: '#9ca3af', background: 'transparent' }
                  }
                >
                  {tp.emoji} {tp.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Contenu */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-zinc-700">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">Contenu</p>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Chemin dans le logiciel</label>
            <input value={path} onChange={e => setPath(e.target.value)}
              placeholder="ex: Stock > Inventaires > Nouvel inventaire"
              className="input-base" />
            {/* Aperçu breadcrumb */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2 min-h-6">
              {pathSteps.length > 0 ? pathSteps.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-gray-300 text-xs">›</span>}
                  <span className="text-xs font-medium bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded-md text-gray-700 dark:text-zinc-300">{s}</span>
                </span>
              )) : (
                <span className="text-xs text-gray-300 italic">Aperçu du chemin...</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Notes</label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder={"Tes notes ici...\n\nFormatage : ## Titre  **gras**  - liste  `code`  > citation"}
              rows={7}
              className="input-base resize-y leading-relaxed"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Markdown : <code className="bg-gray-100 dark:bg-zinc-700 px-1 rounded text-[10px]">## Titre</code>{' '}
              <code className="bg-gray-100 dark:bg-zinc-700 px-1 rounded text-[10px]">**gras**</code>{' '}
              <code className="bg-gray-100 dark:bg-zinc-700 px-1 rounded text-[10px]">- liste</code>{' '}
              <code className="bg-gray-100 dark:bg-zinc-700 px-1 rounded text-[10px]">`code`</code>
            </p>
          </div>
        </div>

        {/* Section Organisation */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">Organisation</p>

          {/* Fiches liées */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Fiches liées</label>
            <div className="border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              <input
                value={linkSearch} onChange={e => setLinkSearch(e.target.value)}
                placeholder="Filtrer les fiches..."
                className="w-full px-3 py-2 text-sm border-b border-gray-100 dark:border-zinc-700 outline-none bg-transparent"
              />
              <div className="max-h-40 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-gray-400 p-3">Aucune fiche disponible</p>
                ) : filteredNotes.map(n => (
                  <label key={n.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer">
                    <input
                      type="checkbox" checked={links.includes(n.id)}
                      onChange={e => setLinks(l => e.target.checked ? [...l, n.id] : l.filter(x => x !== n.id))}
                      className="flex-shrink-0"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span className="text-xs text-gray-700 dark:text-zinc-300">{n.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Tags</label>
            <div className="relative" ref={tagRef}>
              <div
                className="flex flex-wrap gap-1.5 p-2 border border-gray-200 dark:border-zinc-700 rounded-xl min-h-10 cursor-text bg-gray-50 dark:bg-zinc-900"
                onClick={() => tagRef.current?.querySelector('input')?.focus()}
              >
                {tags.map((t, i) => <Chip key={i} label={t} onRemove={() => setTags(a => a.filter((_, j) => j !== i))} />)}
                <input
                  value={tagInput}
                  onChange={e => { setTagInput(e.target.value); updateTagSuggestions(e.target.value) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
                    if (e.key === 'Escape') setSuggestions([])
                  }}
                  onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                  placeholder="Ajouter un tag..."
                  className="flex-1 min-w-24 text-sm bg-transparent outline-none text-gray-700 dark:text-zinc-300 placeholder-gray-400"
                />
              </div>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  {suggestions.map(s => (
                    <button key={s} onMouseDown={e => { e.preventDefault(); addTag(s) }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileTap={{ scale: .96 }}
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all hover:brightness-90"
            style={{ background: curModObj?.color || 'var(--accent)' }}
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </motion.button>
          <button onClick={() => onCancel(note ? 'fiche' : 'module')}
            className="px-4 py-2.5 text-sm text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          {saving && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 border-2 border-gray-200 border-t-accent rounded-full animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
              Sauvegarde...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
