import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { db, initializeDatabase } from './database.js'
import process from 'process'
import path from 'node:path'
import { fileURLToPath } from 'url'
import insertPostRouter from './routes/insertPostRouter.js'
import formRouter from './routes/formRouter.js'
import getPostRouter from './routes/getPostRouter.js'
import deletePostRouter from './routes/deletePostRouter.js'
import editPostRouter from './routes/editPostRouter.js'

const app = express()
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
// Trust the proxy if behind one (important for correct IP detection)
app.set('trust proxy', 1 /*this needs to be the proxy's ip here not 1 when i implement nginx */)

// Registering Middleware
// Security headers
app.use(
  helmet({
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  }),
)

app.use(cors())
app.use(express.json())

// Registering routes
app.use('/api/form/', formRouter)
app.use('/api/posts/', insertPostRouter)
app.use('/api/posts/', getPostRouter)
app.use('/api/posts/', deletePostRouter)
app.use('/api/posts/', editPostRouter)

app.use('/public/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

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
