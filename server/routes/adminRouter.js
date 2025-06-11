import express from 'express'
import jwt from 'jsonwebtoken'
import process from 'node:process'
import 'dotenv/config'
// import crypto from 'crypto'

const newUserRouter = express.Router()
const loginRouter = express.Router()

// Used once run in term if necessary
//   const secret = crypto.randomBytes(64).toString('hex')

// Authenticate token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

// Generates new token for a user
function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET)
}

// /api/admin/login =>
loginRouter.post('/login', (req, res) => {
  console.log(req.body)
  const email = req.body.email
  const user = { name: email }
  // const pass = req.body.password
  const token = generateAccessToken(user)
  res.json(token)
})

// // If user doesnt have a token and the password and email match /api/admin/new-user
// newUserRouter.post('/new-user', (req, res) => {
//   res.json(token)
// })

/**
Login: 
  Admin sends email + password → Server checks if they match → Server creates JWT with just {email, isAdmin: true} (no password) → Sends token back

Subsequent requests: 
  Admin sends the JWT token → Server verifies it was signed with the secret → Server trusts the claims inside

 */
export { newUserRouter, loginRouter }
