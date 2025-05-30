// Handles route /api/posts/
import express from 'express'
import multer from 'multer'
import { db } from '../database.js'
import path from 'path'
// import { fileURLToPath } from 'url'
import fs from 'fs'

const database = db
const router = express.Router()

function getNormalDate() {
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}_${mm}_${yyyy}`
}

// Base upload directory
const baseUploadDir = './public/uploads'
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true })
}

// Generate unique post folder name
function generatePostFolderName() {
  const dateStr = getNormalDate()
  const timestamp = Date.now()
  return `post_${dateStr}_${timestamp}`
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create unique folder for this post
    if (!req.postFolder) {
      req.postFolder = generatePostFolderName()
    }
    const postDir = path.join(baseUploadDir, req.postFolder)
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true })
    }

    cb(null, postDir)
  },
  filename: (req, file, cb) => {
    // Determine file extension from mimetype since originalname is 'blob'
    let ext = '.jpg' // default
    if (file.mimetype === 'image/png') ext = '.png'
    if (file.mimetype === 'image/webp') ext = '.webp'
    // Create descriptive filename
    const prefix = file.fieldname === 'titleImage' ? 'title' : 'extra'
    const timestamp = Date.now()
    cb(null, `${prefix}_${timestamp}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    // Accepts only specific image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed!'), false)
    }
  },
})

// Creates new post for route /api/posts/new-post
router.post('/new-post', (req, res) => {
  // Use multer middleware with custom field validation
  const uploadFields = upload.fields([
    { name: 'titleImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
  ])

  uploadFields(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err)

      // Handle specific multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB per image.',
        })
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many files. Maximum is 1 title image and 5 extra images.',
        })
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field.',
        })
      }

      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed.',
      })
    }

    try {
      console.log('Files received:', req.files)
      console.log('Body received:', req.body)

      const { title, bodyText, date, type } = req.body

      // Validate required fields
      if (
        !title ||
        (!req.files.titleImage && (!req.files.extraImages || req.files.extraImages.length === 0))
      ) {
        return res.status(400).json({
          success: false,
          error: 'Title and at least one image are required.',
        })
      }

      // Process uploaded files
      let titleImagePath = null
      let extraImagePaths = []

      if (req.files.titleImage) {
        const file = req.files.titleImage[0]
        titleImagePath = `/uploads/${req.postFolder}/${file.filename}`
      }

      if (req.files.extraImages) {
        extraImagePaths = req.files.extraImages.map(
          (file) => `/uploads/${req.postFolder}/${file.filename}`,
        )
      }
      // Create post object
      const post = {
        title,
        bodyText,
        titleImage: titleImagePath,
        extraImages: extraImagePaths,
        date,
        type,
        folder: req.postFolder,
      }
      console.log('Post to save', post)
      // Insert post text
      const stmtPost = database.prepare(
        `INSERT INTO posts (post_title, post_body, date, post_type) VALUES (?, ?, ?, ?)`,
      )
      const result = stmtPost.run(post.title, post.bodyText, post.date, post.type)
      // Get the ID latest id and runs result
      const postId = result.lastInsertRowid
      // Insert images
      const insertTitle = db.prepare(
        `INSERT INTO images (post_id, image_path, image_type, folder_url) VALUES (?, ?, ?, ?)`,
      )
      insertTitle.run(postId, post.titleImage, 'title', post.folder)
      const insertExtra = db.prepare(
        `INSERT INTO images (post_id, image_path, image_type, folder_url) VALUES (?, ?, ?, ?)`,
      )
      post.extraImages.forEach((extraImage) => {
        insertExtra.run(postId, extraImage, 'extra', post.folder)
      })

      res.json({
        success: true,
        message: 'Post created successfully!',
        post,
      })
    } catch (error) {
      console.error('V-Error creating post:', error)

      // Clean up uploaded files on error
      if (req.postFolder) {
        const postDir = path.join(baseUploadDir, req.postFolder)
        if (fs.existsSync(postDir)) {
          fs.rmSync(postDir, { recursive: true, force: true })
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create post',
      })
    }
  })
})

export default router
