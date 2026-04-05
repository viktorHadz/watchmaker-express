import { clearAuthCookies, getSessionUserFromRequest } from '../utils/auth.js'

export const verifyUserIdentity = (req, res, next) => {
  try {
    const user = getSessionUserFromRequest(req)

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    req.user = user
    return next()
  } catch (error) {
    console.error('Auth verification error:', error)
    clearAuthCookies(res, req)
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

