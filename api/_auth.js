// Sesión del coordinador: token firmado (HMAC) con caducidad de 8 horas.
const crypto = require('crypto');
const secreto = () => process.env.AUTH_SECRET || '';

function firmar(datos) {
  const cuerpo = Buffer.from(JSON.stringify(datos)).toString('base64url');
  const firma = crypto.createHmac('sha256', secreto()).update(cuerpo).digest('base64url');
  return cuerpo + '.' + firma;
}
function verificar(token) {
  if (!secreto() || !token || token.indexOf('.') < 0) return null;
  const [cuerpo, firma] = token.split('.');
  const esperada = crypto.createHmac('sha256', secreto()).update(cuerpo).digest('base64url');
  const a = Buffer.from(firma), b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const d = JSON.parse(Buffer.from(cuerpo, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch { return null; }
}
function exigir(req, res) {
  const t = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!verificar(t)) { res.status(401).json({ error: 'Sesión no válida. Vuelve a iniciar sesión.' }); return false; }
  return true;
}
function iguales(x, y) {
  const h = s => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(x), h(y));
}
module.exports = { firmar, verificar, exigir, iguales };
