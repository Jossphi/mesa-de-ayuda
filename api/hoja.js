// Lee en vivo el Excel de Google Drive (carpeta Maestria, «Mesa de ayuda») y lo entrega al panel del coordinador.
// El archivo debe estar compartido con «cualquiera con el enlace» (como mínimo, lector).
const { exigir } = require('./_auth');

const SHEET_ID = process.env.SHEET_ID || '1G8Nop4wM-4p6FS0WfGDugwm8XERsCoSv-2vIUmyl-xg';

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  if (!exigir(req, res)) return;
  try {
    const r = await fetch('https://docs.google.com/spreadsheets/d/' + encodeURIComponent(SHEET_ID) + '/export?format=xlsx', { redirect: 'follow' });
    const tipo = r.headers.get('content-type') || '';
    if (!r.ok || /text\/html/i.test(tipo)) return res.status(502).json({ error: 'No se pudo leer el Excel de Drive. Revisa que esté compartido con el enlace.' });
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('cache-control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: 'No se pudo conectar con Google Drive.' });
  }
};
