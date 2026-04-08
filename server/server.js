import './env.js'
import crypto from 'node:crypto'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { db, initializeDatabase } from './database.js'
import process from 'process'
import { apiLimiter } from './middleware/rateLimiter.js'
import { distDir, publicUploadsDir } from './paths.js'

import insertPostRouter from './routes/insertPostRouter.js'
import formRouter from './routes/formRouter.js'
import getPostRouter from './routes/getPostRouter.js'
import deletePostRouter from './routes/deletePostRouter.js'
import editPostRouter from './routes/editPostRouter.js'
import authRouter from './routes/authRouter.js'
import {
  getCanonicalPost,
  renderAppShell,
  renderPagesSitemap,
  renderPostSeoPage,
  renderPostsSitemap,
  renderRobotsTxt,
  renderSitemapIndex,
  renderStaticSeoPage,
} from './seoRenderer.js'

const app = express()

// Trust the proxy if behind one (important for correct IP detection)
app.set('trust proxy', 1)

// Registering Middleware
// Security headers
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
  next()
})

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': ["'self'"],
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
app.use('/api/auth/', authRouter)
app.use('/api/form/', formRouter)
app.use('/api/posts/', insertPostRouter)
app.use('/api/posts/', getPostRouter)
app.use('/api/posts/', deletePostRouter)
app.use('/api/posts/', editPostRouter)

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(renderRobotsTxt())
})

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(renderSitemapIndex())
})

app.get('/sitemap-pages.xml', (req, res) => {
  res.type('application/xml').send(renderPagesSitemap())
})

app.get('/sitemap-posts.xml', (req, res) => {
  res.type('application/xml').send(renderPostsSitemap())
})

app.get(/^\/my-work\/(\d+)$/, (req, res, next) => {
  const match = req.path.match(/^\/my-work\/(\d+)$/)
  const canonicalPath = getCanonicalPost(match?.[1])

  if (!canonicalPath) {
    return next()
  }

  return res.redirect(301, canonicalPath)
})

app.get(/^\/my-work\/([a-z0-9-]+)-(\d+)$/, (req, res, next) => {
  const match = req.path.match(/^\/my-work\/([a-z0-9-]+)-(\d+)$/)
  const rendered = renderPostSeoPage(match?.[2], res.locals.cspNonce)

  if (!rendered) {
    return next()
  }

  if (req.path !== rendered.canonicalPath) {
    return res.redirect(301, rendered.canonicalPath)
  }

  return res.type('html').send(rendered.html)
})

app.get(
  [
    '/',
    '/repairs',
    '/watch-repair-london',
    '/vintage-watch-repair-london',
    '/watch-restoration-london',
    '/mechanical-watch-service-london',
    '/pocket-watch-repair-london',
    '/watch-repair-by-post',
    '/my-work',
  ],
  (req, res) => {
    res.type('html').send(renderStaticSeoPage(req.path, res.locals.cspNonce))
  },
)

app.use(
  '/public/uploads',
  express.static(publicUploadsDir, {
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

app.use(express.static(distDir))

app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/') || req.path.startsWith('/public/')) {
    return next()
  }

  if (req.path.startsWith('/admin')) {
    return res.type('html').send(renderAppShell(res.locals.cspNonce))
  }

  return res.status(404).type('html').send(renderStaticSeoPage(req.path, res.locals.cspNonce))
})

initializeDatabase()
// Server start
const PORT = Number(process.env.PORT) || 5000
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
