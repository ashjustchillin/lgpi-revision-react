import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useFirebase() {
  const [notes, setNotes] = useState([])
  const [mods, setMods] = useState([])
  const [syncState, setSyncState] = useState('syncing')

  const fetchAll = useCallback(async () => {
    try {
      setSyncState('syncing')
      const [ms, ns] = await Promise.all([
        getDocs(collection(db, 'modules')),
        getDocs(collection(db, 'notes')),
      ])
      setMods(ms.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)))
      setNotes(ns.docs.map(d => ({ id: d.id, ...d.data() })))
      setSyncState('ok')
    } catch (err) {
      console.error(err)
      setSyncState('error')
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const saveNote = useCallback(async data => {
    setSyncState('syncing')
    try {
      if (data.id) {
        const { id, ...rest } = data
        await setDoc(doc(db, 'notes', id), rest)
      } else {
        await addDoc(collection(db, 'notes'), data)
      }
      await fetchAll()
      setSyncState('ok')
    } catch (e) {
      console.error(e)
      setSyncState('error')
      throw e
    }
  }, [fetchAll])

  const deleteNote = useCallback(async id => {
    setSyncState('syncing')
    try {
      await deleteDoc(doc(db, 'notes', id))
      await fetchAll()
      setSyncState('ok')
    } catch (e) {
      console.error(e)
      setSyncState('error')
    }
  }, [fetchAll])

  const saveMod = useCallback(async data => {
    setSyncState('syncing')
    try {
      await addDoc(collection(db, 'modules'), { ...data, createdAt: Date.now() })
      await fetchAll()
      setSyncState('ok')
    } catch (e) {
      console.error(e)
      setSyncState('error')
      throw e
    }
  }, [fetchAll])

  const deleteMod = useCallback(async id => {
    setSyncState('syncing')
    try {
      await deleteDoc(doc(db, 'modules', id))
      const toDelete = notes.filter(n => n.module === id)
      await Promise.all(toDelete.map(n => deleteDoc(doc(db, 'notes', n.id))))
      await fetchAll()
      setSyncState('ok')
    } catch (e) {
      console.error(e)
      setSyncState('error')
    }
  }, [notes, fetchAll])

  return { notes, mods, syncState, saveNote, deleteNote, saveMod, deleteMod, refresh: fetchAll }
}
