import express from 'express'
import process from 'process'
import {
  SESSION_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  clearAuthCookies,
  createOAuthState,
  createSessionToken,
  getAllowedAdminEmails,
  getCookieOptions,
  getSessionUserFromRequest,
  getStateCookieOptions,
  parseCookies,
} from '../utils/auth.js'

const router = express.Router()

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
const DEFAULT_AVATAR_PATH = '/pictures/avatars/vik_avatar_sm.png'
const GOOGLE_AVATAR_HOST_PATTERN = /(^|\.)googleusercontent\.com$/i

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

function getGoogleAuthConfig() {
  return {
    clientId: getRequiredEnv('AUTH_CLIENT_ID'),
    clientSecret: getRequiredEnv('AUTH_CLIENT_SECRET'),
    redirectUri: getRequiredEnv('AUTH_REDIRECT'),
  }
}

function buildGoogleAuthUrl(state) {
  const { clientId, redirectUri } = getGoogleAuthConfig()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret, redirectUri } = getGoogleAuthConfig()

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = payload.error_description || payload.error || 'Google token exchange failed'
    throw new Error(message)
  }

  return payload
}

async function fetchGoogleUser(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = payload.error_description || payload.error || 'Failed to load Google profile'
    throw new Error(message)
  }

  return payload
}

function buildAppUser(googleUser) {
  return {
    id: googleUser.sub,
    email: googleUser.email,
    username: googleUser.name || googleUser.given_name || googleUser.email,
    avatar: googleUser.picture || DEFAULT_AVATAR_PATH,
    provider: 'google',
  }
}

function isAllowedGoogleAvatarUrl(value = '') {
  try {
    const url = new URL(value)

    return url.protocol === 'https:' && GOOGLE_AVATAR_HOST_PATTERN.test(url.hostname)
  } catch {
    return false
  }
}

router.get('/me', (req, res) => {
  try {
    const user = getSessionUserFromRequest(req)

    if (!user) {
      return res.json({ authenticated: false, user: null })
    }

    return res.json({ authenticated: true, user })
  } catch (error) {
    console.error('Failed to restore auth session:', error)
    clearAuthCookies(res, req)
    return res.json({ authenticated: false, user: null })
  }
})

router.post('/logout', (req, res) => {
  clearAuthCookies(res, req)
  res.json({ success: true })
})

router.get('/avatar', async (req, res) => {
  try {
    const user = getSessionUserFromRequest(req)
    const avatarUrl = user?.avatar || ''

    if (!isAllowedGoogleAvatarUrl(avatarUrl)) {
      return res.redirect(DEFAULT_AVATAR_PATH)
    }

    const response = await fetch(avatarUrl, {
      headers: {
        Accept: 'image/*',
      },
    })

    if (!response.ok) {
      throw new Error(`Avatar fetch failed with status ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const avatarBuffer = Buffer.from(await response.arrayBuffer())

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
      'Cross-Origin-Resource-Policy': 'same-origin',
      Vary: 'Cookie',
    })

    return res.send(avatarBuffer)
  } catch (error) {
    console.error('Failed to proxy Google avatar:', error)
    return res.redirect(DEFAULT_AVATAR_PATH)
  }
})

router.get('/google/login', (req, res) => {
  try {
    const state = createOAuthState()
    res.cookie(OAUTH_STATE_COOKIE_NAME, state, getStateCookieOptions(req))
    res.redirect(buildGoogleAuthUrl(state))
  } catch (error) {
    console.error('Failed to start Google auth flow:', error)
    res.redirect('/admin?authError=config')
  }
})

router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query

    if (error) {
      clearAuthCookies(res, req)
      return res.redirect(`/admin?authError=${encodeURIComponent(error)}`)
    }

    if (!code || !state) {
      clearAuthCookies(res, req)
      return res.redirect('/admin?authError=missing_code')
    }

    const cookies = parseCookies(req.headers.cookie)
    const expectedState = cookies[OAUTH_STATE_COOKIE_NAME]

    if (!expectedState || expectedState !== state) {
      clearAuthCookies(res, req)
      return res.redirect('/admin?authError=state_mismatch')
    }

    const tokens = await exchangeCodeForTokens(code)
    const googleUser = await fetchGoogleUser(tokens.access_token)
    const allowedAdmins = getAllowedAdminEmails()
    const normalizedEmail = googleUser.email?.trim().toLowerCase()

    if (!googleUser.email_verified || !normalizedEmail) {
      clearAuthCookies(res, req)
      return res.redirect('/admin?authError=email_not_verified')
    }

    if (allowedAdmins.length === 0) {
      clearAuthCookies(res, req)
      return res.redirect('/admin?authError=config')
    }

    if (!allowedAdmins.includes(normalizedEmail)) {
      clearAuthCookies(res, req)
      return res.redirect('/admin?authError=unauthorized')
    }

    const sessionToken = createSessionToken(buildAppUser(googleUser))
    res.cookie(SESSION_COOKIE_NAME, sessionToken, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000))
    res.clearCookie(OAUTH_STATE_COOKIE_NAME, getStateCookieOptions(req))

    return res.redirect('/my-work')
  } catch (error) {
    console.error('Google auth callback failed:', error)
    clearAuthCookies(res, req)
    return res.redirect('/admin?authError=callback_failed')
  }
})

export default router
