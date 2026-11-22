// Tickets enviados por estudiantes.
//  POST                     (público)      crea un ticket; devuelve ticket_id y código
//  GET ?id=E-001&codigo=XX  (público)      estado y respuesta del coordinador (requiere el código)
//  GET                      (coordinador)  lista de tickets
//  PATCH                    (coordinador)  cambia el estado y/o responde con un comentario
const { sql } = require('./_db');
const { exigir } = require('./_auth');
const excel = require('./_excel');

const CATEGORIAS = ['Aula virtual', 'Correo institucional', 'Matrícula', 'Biblioteca digital', 'Otro'];
const ESTADOS = ['Pendiente', 'Resuelto'];

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { nombre, categoria, descripcion, web } = req.body || {};
      if (web) return res.status(200).json({ ticket_id: 'E-000', codigo: '--------', estado: 'Pendiente' }); // campo trampa para bots
      const n = String(nombre || '').trim(), d = String(descripcion || '').trim();
      if (n.length < 2 || n.length > 60) return res.status(400).json({ error: 'Escribe tu nombre (2 a 60 caracteres).' });
      if (!CATEGORIAS.includes(categoria)) return res.status(400).json({ error: 'Elige una categoría.' });
      if (d.length < 5 || d.length > 300) return res.status(400).json({ error: 'Describe tu problema en 5 a 300 caracteres.' });
      const rows = await sql('INSERT INTO tickets_estudiantes (nombre, categoria, descripcion) VALUES ($1, $2, $3) RETURNING ticket_id, codigo, estado, creado', [n, categoria, d]);
      const nuevo = rows[0];
      // Se escribe también en el Excel de Drive (si falla, se reintenta cuando el coordinador abre su panel)
      if (await excel.agregarTicket({ ticket_id: nuevo.ticket_id, creado: nuevo.creado, descripcion: d, categoria, estado: nuevo.estado })) await sql('UPDATE tickets_estudiantes SET en_excel = true WHERE ticket_id = $1', [nuevo.ticket_id]);
      return res.status(201).json(nuevo);
    }
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || '').trim();
      if (id) {
        const codigo = String((req.query && req.query.codigo) || '').trim();
        const rows = await sql('SELECT ticket_id, categoria, estado, comentario, respondido, creado FROM tickets_estudiantes WHERE ticket_id = upper($1) AND codigo = upper($2)', [id.slice(0, 20), codigo.slice(0, 20)]);
        return rows.length ? res.status(200).json(rows[0]) : res.status(404).json({ error: 'No encontramos ese ticket. Revisa el TicketID y el código.' });
      }
      if (!exigir(req, res)) return;
      if (excel.activo()) {
        const faltan = await sql('SELECT ticket_id, categoria, descripcion, canal, estado, creado FROM tickets_estudiantes WHERE en_excel = false ORDER BY id LIMIT 3');
        for (const t of faltan) if (await excel.agregarTicket(t)) await sql('UPDATE tickets_estudiantes SET en_excel = true WHERE ticket_id = $1', [t.ticket_id]);
      }
      const rows = await sql('SELECT ticket_id, nombre, categoria, descripcion, canal, estado, comentario, respondido, creado FROM tickets_estudiantes ORDER BY creado DESC LIMIT 200');
      return res.status(200).json({ tickets: rows });
    }
    if (req.method === 'PATCH') {
      if (!exigir(req, res)) return;
      const { ticket_id, estado, comentario } = req.body || {};
      const e = estado === undefined ? null : estado;
      const c = comentario === undefined ? null : String(comentario).trim();
      if (e !== null && !ESTADOS.includes(e)) return res.status(400).json({ error: 'Estado no válido.' });
      if (c !== null && (c.length < 1 || c.length > 500)) return res.status(400).json({ error: 'Escribe una respuesta de hasta 500 caracteres.' });
      if (e === null && c === null) return res.status(400).json({ error: 'No hay nada que actualizar.' });
      const rows = await sql('UPDATE tickets_estudiantes SET estado = COALESCE($1::text, estado), comentario = COALESCE($2::text, comentario), respondido = CASE WHEN $2::text IS NULL THEN respondido ELSE now() END WHERE ticket_id = $3 RETURNING ticket_id, estado, comentario, respondido', [e, c, String(ticket_id || '')]);
      if (rows.length && e !== null) await excel.cambiarEstado(rows[0].ticket_id, rows[0].estado);
      return rows.length ? res.status(200).json(rows[0]) : res.status(404).json({ error: 'Ticket no encontrado.' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo completar la operación. Intenta de nuevo.' });
  }
};
