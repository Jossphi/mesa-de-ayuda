// Apps Script para el Excel «Mesa de ayuda» (Extensiones > Apps Script).
// Recibe los tickets del portal de estudiantes y los agrega como filas nuevas.
// Reemplaza PEGA_AQUI_EL_TOKEN por la clave que te dio el equipo.
const TOKEN = 'PEGA_AQUI_EL_TOKEN';
const GID = 816920823; // pestaña de tickets (valor "gid" de la URL del Excel)

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return salida({ ok: false, error: 'token' });
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = libro.getSheets().filter(function (s) { return s.getSheetId() === GID; })[0] || libro.getSheets()[0];
    const enc = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(clave);
    const colId = enc.indexOf('ticketid');
    if (colId < 0) return salida({ ok: false, error: 'sin columna TicketID' });
    const ultima = hoja.getLastRow();
    const ids = ultima > 1 ? hoja.getRange(2, colId + 1, ultima - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    const pos = ids.indexOf(String(d.ticket_id));

    if (d.accion === 'agregar') {
      if (pos >= 0) return salida({ ok: true, repetido: true }); // ya estaba: no duplicar
      const valores = { ticketid: d.ticket_id, fecha: new Date(d.fecha), canal: d.canal, descripcion: d.descripcion, categoria: d.categoria, estado: d.estado };
      hoja.appendRow(enc.map(function (h) { return valores[h] !== undefined ? valores[h] : ''; }));
      return salida({ ok: true });
    }
    if (d.accion === 'estado') {
      const colEstado = enc.indexOf('estado');
      if (pos >= 0 && colEstado >= 0) hoja.getRange(pos + 2, colEstado + 1).setValue(d.estado);
      return salida({ ok: true });
    }
    return salida({ ok: false, error: 'accion' });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function clave(h) { return String(h).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function salida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
