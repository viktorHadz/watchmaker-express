import { supabase } from '../supabase.js'
export const verifyUserIdentity = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader && !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'None or bad token provided' })
    }
    const token = authHeader.split(' ')[1]

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  } catch (error) {
    console.error('Auth verification error:', error)
    res.status(500).json({ error: 'Server authentication error' })
  }
}

// Flow
// client sends a request to a protected router
// ataches the token inside the auth header
// then the backend asks supabase if this token is legit
// if the token is indeed legit return an okay to the router and pass next else throw an error
