// Proxy Cloudflare Worker — contourne le CORS
const WORKER_URL = 'https://lgpi-groq-proxy.ashjacquin70.workers.dev'
const MODEL = 'llama3-70b-8192'

async function groqCall(messages, maxTokens = 1000) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature: 0.4 }),
  })
  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

export async function reformulerContenu(content, title = '') {
  const prompt = `Tu es un assistant qui aide à structurer des notes de travail sur un logiciel de gestion (LGPI).

Reformule ces notes prises à la va-vite en une fiche claire et bien structurée en français.
Utilise du markdown : ## pour les titres de sections, - pour les listes, **gras** pour les points importants, \`code\` pour les termes techniques.
Garde un ton professionnel et concis. Ne rajoute pas d'informations inventées.
${title ? `Le titre de la fiche est : "${title}"` : ''}

Notes brutes :
${content}

Réponds uniquement avec le contenu reformulé, sans introduction ni conclusion.`

  return groqCall([{ role: 'user', content: prompt }], 1500)
}

export async function suggererTitre(content) {
  const prompt = `En te basant sur ce contenu de fiche de travail sur le logiciel LGPI, propose un titre court et précis (5-8 mots maximum, en français).
Réponds uniquement avec le titre, sans guillemets ni ponctuation finale.

Contenu :
${content.slice(0, 500)}`

  return groqCall([{ role: 'user', content: prompt }], 50)
}

export async function suggererTags(content, title = '', existingTags = []) {
  const prompt = `En te basant sur ce contenu de fiche de travail sur LGPI, propose 3 à 5 tags pertinents en français (mots-clés courts, en minuscules).
${existingTags.length ? `Tags déjà existants dans l'app : ${existingTags.join(', ')}. Réutilise-les si pertinent.` : ''}
Réponds uniquement avec les tags séparés par des virgules, sans espaces superflus.

Titre : ${title}
Contenu : ${content.slice(0, 400)}`

  const result = await groqCall([{ role: 'user', content: prompt }], 80)
  return result.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5)
}
