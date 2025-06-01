import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import process from 'node:process'
import 'dotenv/config'
import { strict } from 'node:assert'

const router = express.Router()

// Used once
function generateSecret() {
  const secret = crypto.randomBytes(64).toString('hex')
  console.log(secret)
}
// Generates new token
function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '2592000s' })
}
// If user doesnt have a token and the password and email match
router.post('/newUser', (req, res) => {
  const token = generateAccessToken({ username: req.body.username })
  res.json(token)
})
// Authenticate token
function authenticateToken(req, res, next) {
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

// Login route - this is the api which the client calls

// const token = jwt.

/**
Login: 
  Admin sends email + password → Server checks if they match → Server creates JWT with just {email, isAdmin: true} (no password) → Sends token back

Subsequent requests: 
  Admin sends the JWT token → Server verifies it was signed with the secret → Server trusts the claims inside

 */
