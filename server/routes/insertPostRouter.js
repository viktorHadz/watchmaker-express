// Handles route /api/posts/
import express from 'express'
import multer from 'multer'
import { db } from '../database.js'
import path from 'path'
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

// Base upload directory - use temp directory first
const tempUploadDir = './temp/uploads'
const finalUploadDir = './public/uploads'

// Ensure directories exist
;[tempUploadDir, finalUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Generate unique post folder name
function generatePostFolderName() {
  const dateStr = getNormalDate()
  const timestamp = Date.now()
  return `post_${dateStr}_${timestamp}`
}

// Multer configuration with memory storage first
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 11, // 1 title + 5 extra + 5 thumbnails
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed!'), false)
    }
  },
})

// Helper to save files to disk with proper naming
async function saveFilesToDisk(files, postFolder) {
  const savedFiles = {
    titleImage: null,
    extraImages: [],
    thumbnails: [],
  }

  // Create temp directory for this post
  const tempPostDir = path.join(tempUploadDir, postFolder)

  try {
    if (!fs.existsSync(tempPostDir)) {
      fs.mkdirSync(tempPostDir, { recursive: true })
    }

    // Process title image
    if (files.titleImage && files.titleImage[0]) {
      const file = files.titleImage[0]
      const ext = getExtensionFromMimetype(file.mimetype)
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const filename = `title_${uniqueId}${ext}`
      const filepath = path.join(tempPostDir, filename)

      fs.writeFileSync(filepath, file.buffer)
      savedFiles.titleImage = `/uploads/${postFolder}/${filename}`
    }

    // Process extra images and thumbnails together
    if (files.extraImages) {
      for (let i = 0; i < files.extraImages.length; i++) {
        const extraFile = files.extraImages[i]
        const thumbFile = files.thumbnails ? files.thumbnails[i] : null

        if (!thumbFile) {
          throw new Error(`Missing thumbnail for extra image at index ${i}`)
        }

        // Generate base name for this image pair with guaranteed uniqueness
        const timestamp = Date.now()
        const uniqueId = `${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`
        const ext = getExtensionFromMimetype(extraFile.mimetype)

        // Save extra image
        const extraFilename = `extra_${uniqueId}${ext}`
        const extraPath = path.join(tempPostDir, extraFilename)
        fs.writeFileSync(extraPath, extraFile.buffer)

        // Save thumbnail with matching name
        const thumbFilename = `thumb_${uniqueId}${ext}`
        const thumbPath = path.join(tempPostDir, thumbFilename)
        fs.writeFileSync(thumbPath, thumbFile.buffer)

        savedFiles.extraImages.push({
          path: `/uploads/${postFolder}/${extraFilename}`,
          order: i,
        })

        savedFiles.thumbnails.push({
          path: `/uploads/${postFolder}/${thumbFilename}`,
          order: i,
          parentName: extraFilename,
        })
      }
    }

    return { savedFiles, tempPostDir }
  } catch (error) {
    // Clean up any partially written files
    if (fs.existsSync(tempPostDir)) {
      fs.rmSync(tempPostDir, { recursive: true, force: true })
    }
    throw new Error(`Failed to save files: ${error.message}`)
  }
}

function getExtensionFromMimetype(mimetype) {
  switch (mimetype) {
    case 'image/png':
      return '.png'
    case 'image/webp':
      return '.webp'
    default:
      return '.jpg'
  }
}

// Move files from temp to final destination
function moveToFinalDestination(tempPostDir, postFolder) {
  const finalPostDir = path.join(finalUploadDir, postFolder)

  // Create final directory
  if (!fs.existsSync(finalPostDir)) {
    fs.mkdirSync(finalPostDir, { recursive: true })
  }

  // Copy all files (works across filesystems)
  const files = fs.readdirSync(tempPostDir)
  files.forEach((file) => {
    const tempPath = path.join(tempPostDir, file)
    const finalPath = path.join(finalPostDir, file)
    fs.copyFileSync(tempPath, finalPath)
  })

  // Remove temp directory after successful copy
  fs.rmSync(tempPostDir, { recursive: true, force: true })
}

// Cleanup function
function cleanupTempFiles(tempPostDir) {
  if (tempPostDir && fs.existsSync(tempPostDir)) {
    fs.rmSync(tempPostDir, { recursive: true, force: true })
  }
}

// Creates new post for route /api/posts/new-post
router.post('/new-post', (req, res) => {
  const uploadFields = upload.fields([
    { name: 'titleImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 5 },
    { name: 'thumbnails', maxCount: 5 },
  ])

  uploadFields(req, res, async (err) => {
    let tempPostDir = null

    try {
      if (err) {
        console.error('Upload error:', err)

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

        return res.status(400).json({
          success: false,
          error: err.message || 'File upload failed.',
        })
      }

      console.log('Files received:', Object.keys(req.files))
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

      // Validate thumbnails match extra images
      const extraCount = req.files.extraImages ? req.files.extraImages.length : 0
      const thumbCount = req.files.thumbnails ? req.files.thumbnails.length : 0

      console.log(`Validation: ${extraCount} extra images, ${thumbCount} thumbnails`)

      if (extraCount !== thumbCount) {
        return res.status(400).json({
          success: false,
          error: `Thumbnail count (${thumbCount}) must match extra image count (${extraCount}).`,
        })
      }

      // Generate post folder name
      const postFolder = generatePostFolderName()

      // Save files to temp directory with proper naming
      const { savedFiles, tempPostDir: tempDir } = await saveFilesToDisk(req.files, postFolder)
      tempPostDir = tempDir

      console.log('Files saved to temp:', {
        title: savedFiles.titleImage,
        extraCount: savedFiles.extraImages.length,
        thumbCount: savedFiles.thumbnails.length,
      })

      // Database transaction - only if this succeeds do we move files
      const insertPost = database.prepare(
        `INSERT INTO posts (post_title, post_body, date, post_type) VALUES (?, ?, ?, ?)`,
      )
      const insertImage = database.prepare(
        `INSERT INTO images (post_id, image_path, image_type, folder_url, order_index) VALUES (?, ?, ?, ?, ?)`,
      )

      const savePost = database.transaction(() => {
        // Insert post
        const result = insertPost.run(title, bodyText, date, type)
        const postId = result.lastInsertRowid

        // Insert title image
        if (savedFiles.titleImage) {
          insertImage.run(postId, savedFiles.titleImage, 'title', postFolder, 0)
        }

        // Insert extra images and thumbnails with order
        savedFiles.extraImages.forEach((extraImage, index) => {
          insertImage.run(postId, extraImage.path, 'extra', postFolder, extraImage.order)

          const thumbnail = savedFiles.thumbnails[index]
          insertImage.run(postId, thumbnail.path, 'thumbnail', postFolder, thumbnail.order)
        })

        return postId
      })

      // Execute transaction
      const postId = savePost()

      // Only after successful database save, move files to final destination
      moveToFinalDestination(tempPostDir, postFolder)
      tempPostDir = null // Clear so cleanup doesn't remove it

      res.json({
        success: true,
        message: 'Post created successfully!',
        postId,
        post: {
          id: postId,
          title,
          bodyText,
          titleImage: savedFiles.titleImage,
          extraImages: savedFiles.extraImages.map((img) => img.path),
          thumbnails: savedFiles.thumbnails.map((thumb) => thumb.path),
          date,
          type,
          folder: postFolder,
        },
      })
    } catch (error) {
      console.error('Error creating post:', error)

      // Clean up temp files on any error
      if (tempPostDir) {
        cleanupTempFiles(tempPostDir)
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create post',
      })
    }
  })
})

export default router
