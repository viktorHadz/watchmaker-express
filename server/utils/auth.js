import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import process from 'process'

export const SESSION_COOKIE_NAME = 'watchmaker_admin_session'
export const OAUTH_STATE_COOKIE_NAME = 'watchmaker_oauth_state'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000

function decodeCookieValue(value = '') {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) {
        return cookies
      }

      const key = part.slice(0, separatorIndex).trim()
      const value = part.slice(separatorIndex + 1)

      if (key) {
        cookies[key] = decodeCookieValue(value)
      }

      return cookies
    }, {})
}

function getForwardedProto(req) {
  return req.headers['x-forwarded-proto']?.split(',')[0]?.trim()
}

export function getCookieOptions(req, maxAge) {
  const forwardedProto = getForwardedProto(req)
  const isSecureRequest = req.secure || forwardedProto === 'https'

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest,
    maxAge,
    path: '/',
  }
}

export function getStateCookieOptions(req) {
  return {
    ...getCookieOptions(req, OAUTH_STATE_TTL_MS),
    path: '/api/auth/google/callback',
  }
}

export function createOAuthState() {
  return crypto.randomBytes(32).toString('hex')
}

export function getAllowedAdminEmails() {
  return Object.entries(process.env)
    .filter(([key, value]) => /^ADMIN_\d+$/.test(key) && value)
    .map(([, value]) => value.trim().toLowerCase())
}

export function createSessionToken(user) {
  const secret = process.env.TOKEN_SECRET

  if (!secret) {
    throw new Error('TOKEN_SECRET is not configured')
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      provider: 'google',
    },
    secret,
    {
      expiresIn: '7d',
      issuer: 'thewatchmaker.uk',
      audience: 'watchmaker-admin',
    },
  )
}

export function verifySessionToken(token) {
  const secret = process.env.TOKEN_SECRET

  if (!secret) {
    throw new Error('TOKEN_SECRET is not configured')
  }

  return jwt.verify(token, secret, {
    issuer: 'thewatchmaker.uk',
    audience: 'watchmaker-admin',
  })
}

export function getSessionUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE_NAME]

  if (!token) {
    return null
  }

  const payload = verifySessionToken(token)

  return {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
    avatar: payload.avatar,
    provider: payload.provider,
  }
}

export function clearAuthCookies(res, req) {
  res.clearCookie(SESSION_COOKIE_NAME, getCookieOptions(req, SESSION_TTL_MS))
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, getStateCookieOptions(req))
}

