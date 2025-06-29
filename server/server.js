import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { db, initializeDatabase } from './database.js'
import process from 'process'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { apiLimiter } from './middleware/rateLimiter.js'

import insertPostRouter from './routes/insertPostRouter.js'
import formRouter from './routes/formRouter.js'
import getPostRouter from './routes/getPostRouter.js'
import deletePostRouter from './routes/deletePostRouter.js'
import editPostRouter from './routes/editPostRouter.js'

const app = express()
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
const distURL = path.join(__dirname, '..', 'watchmaker', 'dist')

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${duration}`)
    next()
  }
}

// Trust the proxy if behind one (important for correct IP detection)
app.set('trust proxy', 1)

// Registering Middleware
// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'blob:'],
      },
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  }),
)

app.use(cors())
app.use(express.json())

// Using rate limiter
app.use('/api/', apiLimiter)

// Registering routes
app.use('/api/form/', formRouter)
app.use('/api/posts/', insertPostRouter)
app.use('/api/posts/', cacheMiddleware(180), getPostRouter) // 3 minutes cache
app.use('/api/posts/', deletePostRouter)
app.use('/api/posts/', editPostRouter)

app.use(
  '/public/uploads',
  express.static(path.join(__dirname, 'public', 'uploads'), {
    maxAge: '1y', // Cache for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Different cache times for different file types
      if (
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.png') ||
        path.endsWith('.webp')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year for images
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400') // 1 day for other files
      }
    },
  }),
)

app.use(express.static(distURL))

// GET homepage
app.get('/home-baby', (req, res) => {
  const htmlString = `
  <style>
  h1 {color: white;}
  html {
    height: 100%;
    width: 100%;
    background-color: #161515;
    color:white;
  }
  </style>
  <h1>Mama ti deba</h1>
  <div>
    На кака ти хуя
  </div>
  `
  res.send(htmlString)
})

app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/') || req.path.startsWith('/public/')) {
    return next()
  }
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, '..', 'watchmaker', 'dist', 'index.html'))
})

initializeDatabase()
// Server start
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`-----------------------------`)
  console.log(`Backend running on port ${PORT}`)
  console.log(`-----------------------------`)
})
process.on('SIGINT', () => {
  db.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  db.close()
  process.exit(0)
})
