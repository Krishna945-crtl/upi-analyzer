// 🛡️ auth middleware — Bearer token check chesi req.userId set cheyyadam
const jwt = require('jsonwebtoken')

const SECRET = () => process.env.JWT_SECRET || 'dev-only-secret'

function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, SECRET(), { expiresIn: '24h' })
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ detail: 'Login required.' })
  }
  try {
    req.userId = jwt.verify(token, SECRET()).sub
    next()
  } catch {
    res.status(401).json({ detail: 'Invalid or expired token. Please login again.' })
  }
}

module.exports = { signToken, requireAuth }
