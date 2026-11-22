// Función serverless: usa la skill (SKILL.md) como instrucciones para redactar las preguntas frecuentes.
const { leerSkill, hayClave, llamarIA } = require('./_ia');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!hayClave()) return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY (o GEMINI_API_KEY) en Vercel.' });
  const { tickets, resumen } = req.body || {};
  if (!Array.isArray(tickets) || tickets.length === 0) return res.status(400).json({ error: 'No hay tickets para analizar.' });

  // Solo se envían los campos necesarios (sin datos personales).
  const limpios = tickets.slice(0, 500).map(t => ({
    id: String(t.id || '').slice(0, 30), categoria: String(t.categoria || '').slice(0, 80),
    estado: String(t.estado || '').slice(0, 40), descripcion: String(t.descripcion || '').slice(0, 200)
  }));
  const system = leerSkill() + `

## Modo portal
Ya se calcularon los indicadores y el hallazgo. Solo redacta, siguiendo las instrucciones 4 y 5 de la skill, usando exclusivamente los tickets recibidos.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código, con esta forma:
{"faqs":[{"pregunta":"...","respuesta":"..."}],
 "observaciones":["..."]}
Hasta 3 preguntas frecuentes.`;
  const user = 'Indicadores calculados:\n' + JSON.stringify(resumen || {}) + '\n\nTickets:\n' + JSON.stringify(limpios);

  try {
    const texto = await llamarIA(system, user, { json: true, maxTokens: 3000 });
    const ini = texto.indexOf('{'), fin = texto.lastIndexOf('}');
    try { return res.status(200).json(JSON.parse(texto.slice(ini, fin + 1))); }
    catch (e) { return res.status(502).json({ error: 'La IA no devolvió un formato válido. Intenta de nuevo.' }); }
  } catch (e) {
    return res.status(502).json({ error: e.message || 'No se pudo conectar con la IA.' });
  }
};
