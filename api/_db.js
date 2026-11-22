// Acceso a Neon Postgres por HTTP (sin dependencias).
async function sql(query, params = []) {
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('Falta configurar DATABASE_URL.');
  const host = new URL(conn).hostname;
  const r = await fetch('https://' + host + '/sql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'Neon-Connection-String': conn },
    body: JSON.stringify({ query, params })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || 'Error de base de datos.');
  return d.rows || [];
}
module.exports = { sql };
