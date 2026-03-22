// Export toutes les données en JSON
export function exportJSON(notes, mods) {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    mods,
    notes,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `LGPI_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Import depuis un fichier JSON
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data.notes || !data.mods) {
          reject(new Error('Format invalide — le fichier doit contenir notes et mods'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Fichier JSON invalide'))
      }
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsText(file)
  })
}
