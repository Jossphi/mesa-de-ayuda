// Atención a estudiantes: responde preguntas con el tono de la skill, a partir de los problemas vistos en los tickets.
const { leerSkill, hayClave, llamarIA } = require('./_ia');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!hayClave()) return res.status(500).json({ error: 'El asistente aún no está configurado.' });
  const { pregunta, problemas, canales } = req.body || {};
  const q = String(pregunta || '').trim().slice(0, 500);
  if (!q) return res.status(400).json({ error: 'Escribe tu pregunta.' });
  const probs = (Array.isArray(problemas) ? problemas : []).slice(0, 8).map(p => ({ problema: String(p.texto || '').slice(0, 120), categoria: String(p.categoria || '').slice(0, 60), casos: Number(p.cantidad) || undefined }));
  const via = (Array.isArray(canales) ? canales : []).slice(0, 6).map(c => String(c).slice(0, 30)).join(', ') || 'los canales de la mesa de ayuda';

  const system = leerSkill() + `

## Modo atención a estudiantes
Eres la asistente de la mesa de ayuda de la universidad. Responde en español, con el tono institucional descrito arriba: cordial, claro y respetuoso, en máximo 4 frases.
- Usa como contexto los problemas frecuentes observados en los tickets (abajo).
- Da solo orientación general y prudente (por ejemplo reintentar, cerrar sesión y volver a ingresar, revisar la conexión). No inventes políticas, plazos, teléfonos, enlaces ni nombres de personas.
- Si no puedes resolverlo, invita a registrar el caso por uno de los canales: ${via}.
- No pidas ni repitas datos personales.
- Responde solo con el texto de la respuesta, sin formato especial.`;
  const user = 'Problemas frecuentes en los tickets:\n' + JSON.stringify(probs) + '\n\nPregunta del estudiante:\n' + q;
  try {
    const texto = await llamarIA(system, user, { maxTokens: 600 });
    return res.status(200).json({ respuesta: texto.trim() });
  } catch (e) {
    return res.status(502).json({ error: 'No pude responder en este momento. Intenta de nuevo o contacta a la mesa de ayuda.' });
  }
};
