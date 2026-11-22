// Valida usuario y clave del coordinador en el servidor y entrega un token de sesión.
const { firmar, iguales } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!process.env.AUTH_SECRET) return res.status(500).json({ error: 'El acceso aún no está configurado.' });
  const { usuario, clave } = req.body || {};
  const u = process.env.COORD_USER || 'coordinador', p = process.env.COORD_PASS || '12345678';
  if (iguales(usuario || '', u) && iguales(clave || '', p)) {
    return res.status(200).json({ token: firmar({ rol: 'coordinador', exp: Date.now() + 8 * 3600 * 1000 }) });
  }
  return res.status(401).json({ error: 'Usuario o clave incorrectos.' });
};
