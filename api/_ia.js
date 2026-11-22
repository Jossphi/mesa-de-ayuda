// Utilidades compartidas: lectura de la skill y llamada a la IA (Gemini).
const fs = require('fs');
const path = require('path');

function leerSkill() {
  const ruta = path.join(process.cwd(), '.claude', 'skills', 'informe-mesa-de-ayuda', 'SKILL.md');
  return fs.readFileSync(ruta, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
}

function hayClave() { return !!process.env.GEMINI_API_KEY; }

// Devuelve el texto de la respuesta. Lanza Error con un mensaje legible si falla.
async function llamarIA(system, user, { json = false, maxTokens = 3000 } = {}) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('Falta configurar GEMINI_API_KEY.');
  const modelo = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: Object.assign({ maxOutputTokens: maxTokens }, json ? { responseMimeType: 'application/json' } : {})
    })
  });
  const d = await r.json();
  if (!r.ok) throw new Error((d.error && d.error.message) || 'Error al consultar a Gemini.');
  return ((d.candidates && d.candidates[0] && d.candidates[0].content.parts) || []).map(b => b.text || '').join('');
}

module.exports = { leerSkill, hayClave, llamarIA };
