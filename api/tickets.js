// Tickets enviados por estudiantes.
//  POST            (público)      crea un ticket
//  GET ?id=E-001   (público)      estado de un ticket (sin descripción)
//  GET             (coordinador)  lista de tickets
//  PATCH           (coordinador)  cambia el estado
const { sql } = require('./_db');
const { exigir } = require('./_auth');

const CATEGORIAS = ['Aula virtual', 'Correo institucional', 'Matrícula', 'Biblioteca digital', 'Otro'];
const ESTADOS = ['Pendiente', 'Resuelto'];

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { categoria, descripcion, web } = req.body || {};
      if (web) return res.status(200).json({ ticket_id: 'E-000', estado: 'Pendiente' }); // campo trampa para bots
      const d = String(descripcion || '').trim();
      if (!CATEGORIAS.includes(categoria)) return res.status(400).json({ error: 'Elige una categoría.' });
      if (d.length < 5 || d.length > 300) return res.status(400).json({ error: 'Describe tu problema en 5 a 300 caracteres.' });
      const rows = await sql('INSERT INTO tickets_estudiantes (categoria, descripcion) VALUES ($1, $2) RETURNING ticket_id, estado, creado', [categoria, d]);
      return res.status(201).json(rows[0]);
    }
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || '').trim();
      if (id) {
        const rows = await sql('SELECT ticket_id, categoria, estado, creado FROM tickets_estudiantes WHERE ticket_id = upper($1)', [id.slice(0, 20)]);
        return rows.length ? res.status(200).json(rows[0]) : res.status(404).json({ error: 'No encontramos ese TicketID.' });
      }
      if (!exigir(req, res)) return;
      const rows = await sql('SELECT ticket_id, categoria, descripcion, canal, estado, creado FROM tickets_estudiantes ORDER BY creado DESC LIMIT 200');
      return res.status(200).json({ tickets: rows });
    }
    if (req.method === 'PATCH') {
      if (!exigir(req, res)) return;
      const { ticket_id, estado } = req.body || {};
      if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado no válido.' });
      const rows = await sql('UPDATE tickets_estudiantes SET estado = $1 WHERE ticket_id = $2 RETURNING ticket_id, estado', [estado, String(ticket_id || '')]);
      return rows.length ? res.status(200).json(rows[0]) : res.status(404).json({ error: 'Ticket no encontrado.' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo completar la operación. Intenta de nuevo.' });
  }
};
