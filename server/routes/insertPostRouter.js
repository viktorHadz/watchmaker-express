// TODO: ISSUE WITH COMPRESSION composable

// Handles route /api/posts/
import express from 'express'
import multer from 'multer'
import { db } from '../database.js'
import path from 'path'
import fs from 'fs'
import { verifyUserIdentity } from '../middleware/requireAuth.js'
import { getNormalDate } from '../utils/security.js'
import { sanitizePlainTextContent, sanitizeRichTextContent } from '../utils/contentSanitizer.js'
import { publicUploadsDir, tempUploadsDir } from '../paths.js'
import { buildPostSlug, DEFAULT_POST_LOCATION } from '../../watchmaker/src/seo/utils.js'

const database = db
const router = express.Router()
const ALLOWED_POST_TYPES = new Set(['empty', 'blog', 'gallery', 'mixed'])
const INLINE_MEDIA_TOKEN_PATTERN = /__WATCHMAKER_MEDIA__:([a-zA-Z0-9_-]+)/g

// Base upload directory - use temp directory first
const tempUploadDir = tempUploadsDir
const finalUploadDir = publicUploadsDir

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

const normaliseFieldArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  return value ? [value] : []
}

const sanitiseMediaId = (value = '') => `${value}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
const emptyToNull = (value = '') => {
  const trimmed = `${value}`.trim()
  return trimmed ? trimmed : null
}

const replaceInlineMediaTokens = (content, imagePathLookup) =>
  typeof content === 'string'
    ? content.replace(INLINE_MEDIA_TOKEN_PATTERN, (_, mediaId) => {
        const resolvedPath = imagePathLookup.get(mediaId)
        return resolvedPath ? `/public${resolvedPath}` : ''
      })
    : content

// Multer configuration with memory storage first
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 201, // 1 title + 100 extras + 100 thumbnails
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
async function saveFilesToDisk(files, postFolder, extraImageIds = []) {
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
        const uniqueId =
          sanitiseMediaId(extraImageIds[i]) ||
          `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
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
          id: uniqueId,
          path: `/uploads/${postFolder}/${extraFilename}`,
          order: i,
        })

        savedFiles.thumbnails.push({
          id: uniqueId,
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
router.post('/new-post', verifyUserIdentity, (req, res) => {
  const uploadFields = upload.fields([
    { name: 'titleImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 100 },
    { name: 'thumbnails', maxCount: 101 },
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
            error: 'Too many files. Maximum is 1 title image and 100 extra images.',
          })
        }

        return res.status(400).json({
          success: false,
          error: err.message || 'File upload failed.',
        })
      }

      const files = req.files || {}
      console.log('Files received:', Object.keys(files))
      console.log('Body received:', req.body)

      const { title, bodyText, date, type } = req.body
      const extraImageIds = normaliseFieldArray(req.body.extraImageIds).map(sanitiseMediaId)
      const rawBodyText = typeof bodyText === 'string' ? bodyText : ''
      const safeTitle = sanitizePlainTextContent(title ?? '')
      const safeDate = sanitizePlainTextContent(date ?? '')
      const safeType = sanitizePlainTextContent(type ?? '')
      const safeBrand = sanitizePlainTextContent(req.body.brand ?? '')
      const safeModel = sanitizePlainTextContent(req.body.model ?? '')
      const safeLocationFocus = DEFAULT_POST_LOCATION

      // Validate required fields
      if (!safeTitle || !files.titleImage) {
        return res.status(400).json({
          success: false,
          error: 'Title and featured image are required.',
        })
      }

      if (!safeDate) {
        return res.status(400).json({
          success: false,
          error: 'A valid post date is required.',
        })
      }

      if (!ALLOWED_POST_TYPES.has(safeType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid post type.',
        })
      }

      // Validate thumbnails match extra images
      const extraCount = files.extraImages ? files.extraImages.length : 0
      const thumbCount = files.thumbnails ? files.thumbnails.length : 0

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
      const { savedFiles, tempPostDir: tempDir } = await saveFilesToDisk(
        files,
        postFolder,
        extraImageIds,
      )
      tempPostDir = tempDir

      console.log('Files saved to temp:', {
        title: savedFiles.titleImage,
        extraCount: savedFiles.extraImages.length,
        thumbCount: savedFiles.thumbnails.length,
      })
      if (!savedFiles.titleImage) {
        cleanupTempFiles(tempPostDir)
        return res.status(400).json({
          success: false,
          error: 'Featured image (title image) is required.',
        })
      }
      // Database transaction - only if this succeeds do we move files
      const insertPost = database.prepare(
        `
          INSERT INTO posts (
            post_title,
            post_body,
            date,
            post_type,
            slug,
            seo_title,
            seo_description,
            brand,
            model,
            service_type,
            issue_summary,
            location_focus,
            published_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      const insertImage = database.prepare(
        `INSERT INTO images (post_id, image_path, image_type, folder_url, order_index) VALUES (?, ?, ?, ?, ?)`,
      )
      const inlineImagePathLookup = new Map(
        savedFiles.extraImages.map((image) => [image.id, image.path]),
      )
      const safeBodyText = sanitizeRichTextContent(
        replaceInlineMediaTokens(rawBodyText, inlineImagePathLookup),
      )
      const canonicalSlug = buildPostSlug({ postTitle: safeTitle })
      const publishedAt = new Date().toISOString()

      const savePost = database.transaction(() => {
        // Insert post
        const result = insertPost.run(
          safeTitle,
          safeBodyText,
          safeDate,
          safeType,
          canonicalSlug,
          null,
          null,
          emptyToNull(safeBrand),
          emptyToNull(safeModel),
          null,
          null,
          emptyToNull(safeLocationFocus),
          publishedAt,
          publishedAt,
        )
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
          title: safeTitle,
          bodyText: safeBodyText,
          titleImage: savedFiles.titleImage,
          extraImages: savedFiles.extraImages.map((img) => img.path),
          thumbnails: savedFiles.thumbnails.map((thumb) => thumb.path),
          date: safeDate,
          type: safeType,
          folder: postFolder,
          slug: canonicalSlug,
          seoTitle: null,
          seoDescription: null,
          brand: emptyToNull(safeBrand),
          model: emptyToNull(safeModel),
          serviceType: null,
          issueSummary: null,
          locationFocus: emptyToNull(safeLocationFocus),
          publishedAt,
          updatedAt: publishedAt,
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
