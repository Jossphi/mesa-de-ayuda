// Escritura en el Excel de Google Drive mediante un Apps Script publicado como aplicación web.
// Variables: APPS_SCRIPT_URL (URL /exec) y SHEET_WEBHOOK_TOKEN (clave compartida con el script).
const activo = () => !!(process.env.APPS_SCRIPT_URL && process.env.SHEET_WEBHOOK_TOKEN);

async function enviar(carga) {
  if (!activo()) return false;
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(process.env.APPS_SCRIPT_URL, {
      method: 'POST', redirect: 'follow', signal: ctl.signal,
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ token: process.env.SHEET_WEBHOOK_TOKEN }, carga))
    });
    const j = JSON.parse(await r.text());
    return !!j.ok;
  } catch { return false; } finally { clearTimeout(t); }
}

// No se envía el nombre del estudiante: el Excel está compartido por enlace.
const agregarTicket = t => enviar({ accion: 'agregar', ticket_id: t.ticket_id, fecha: new Date(t.creado).toISOString(), canal: t.canal || 'Portal de estudiantes', descripcion: t.descripcion, categoria: t.categoria, estado: t.estado });
const cambiarEstado = (ticket_id, estado) => enviar({ accion: 'estado', ticket_id, estado });

module.exports = { activo, agregarTicket, cambiarEstado };
