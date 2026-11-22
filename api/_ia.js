// Utilidades compartidas: lectura de la skill y llamada a la IA (Anthropic o Gemini).
const fs = require('fs');
const path = require('path');

function leerSkill() {
  const ruta = path.join(process.cwd(), '.claude', 'skills', 'informe-mesa-de-ayuda', 'SKILL.md');
  return fs.readFileSync(ruta, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
}

function hayClave() { return !!(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY); }

// Devuelve el texto de la respuesta. Lanza Error con un mensaje legible si falla.
async function llamarIA(system, user, { json = false, maxTokens = 3000 } = {}) {
  const claudeKey = process.env.ANTHROPIC_API_KEY, geminiKey = process.env.GEMINI_API_KEY;
  if (!claudeKey && geminiKey) {
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
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
  });
  const d = await r.json();
  if (!r.ok) throw new Error((d.error && d.error.message) || 'Error al consultar a Claude.');
  return (d.content || []).map(b => b.text || '').join('');
}

module.exports = { leerSkill, hayClave, llamarIA };
