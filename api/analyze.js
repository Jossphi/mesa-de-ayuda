// Función serverless: usa la skill (SKILL.md) como instrucciones de Claude
// para redactar el hallazgo y las preguntas frecuentes.
const fs = require('fs');
const path = require('path');

function leerSkill() {
  const ruta = path.join(process.cwd(), '.claude', 'skills', 'informe-mesa-de-ayuda', 'SKILL.md');
  return fs.readFileSync(ruta, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en Vercel.' });

  const { tickets, resumen } = req.body || {};
  if (!Array.isArray(tickets) || tickets.length === 0) return res.status(400).json({ error: 'No hay tickets para analizar.' });

  // Solo se envían los campos necesarios (sin datos personales).
  const limpios = tickets.slice(0, 500).map(t => ({
    id: String(t.id || '').slice(0, 30),
    categoria: String(t.categoria || '').slice(0, 80),
    estado: String(t.estado || '').slice(0, 40),
    descripcion: String(t.descripcion || '').slice(0, 200)
  }));

  const system = leerSkill() + `

## Modo portal
Ya se calcularon los indicadores. Solo redacta, siguiendo las instrucciones 3, 4 y 5 de la skill, usando exclusivamente los tickets recibidos.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código, con esta forma:
{"hallazgo":{"hallazgo":"...","evidencia":"...","ids":["T-001"],"accion":"..."},
 "faqs":[{"pregunta":"...","respuesta":"..."}],
 "observaciones":["..."]}
"ids" solo puede contener TicketID presentes en los datos (vacío si no hay TicketID). Hasta 3 preguntas frecuentes.`;

  const user = 'Indicadores calculados:\n' + JSON.stringify(resumen || {}) + '\n\nTickets:\n' + JSON.stringify(limpios);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: (data.error && data.error.message) || 'Error al consultar a Claude.' });
    const texto = (data.content || []).map(b => b.text || '').join('');
    const ini = texto.indexOf('{'), fin = texto.lastIndexOf('}');
    const json = JSON.parse(texto.slice(ini, fin + 1));
    const validos = new Set(limpios.map(t => t.id));
    if (json.hallazgo && Array.isArray(json.hallazgo.ids)) json.hallazgo.ids = json.hallazgo.ids.filter(i => validos.has(i));
    return res.status(200).json(json);
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo interpretar la respuesta de Claude.' });
  }
};
