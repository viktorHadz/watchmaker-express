import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import * as z from 'zod'
import { db } from '../database.js'
import { verifyUserIdentity } from '../middleware/requireAuth.js'
import { editPostSchema } from '../middleware/validationMiddleware.js'
import { sanitizePlainTextContent, sanitizeRichTextContent } from '../utils/contentSanitizer.js'
import { publicUploadsDir } from '../paths.js'
import { buildPostSlug, DEFAULT_POST_LOCATION } from '../../watchmaker/src/seo/utils.js'

const router = express.Router()
const INLINE_MEDIA_TOKEN_PATTERN = /__WATCHMAKER_MEDIA__:([a-zA-Z0-9_-]+)/g

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 200,
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

class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
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

const getExtensionFromMimetype = (mimetype) => {
  switch (mimetype) {
    case 'image/png':
      return '.png'
    case 'image/webp':
      return '.webp'
    default:
      return '.jpg'
  }
}

const cleanupCreatedFiles = (files = []) => {
  files.forEach((filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  })
}

router.patch('/edit/:postid', verifyUserIdentity, (req, res) => {
  const uploadFields = upload.fields([
    { name: 'extraImages', maxCount: 100 },
    { name: 'thumbnails', maxCount: 100 },
  ])

  uploadFields(req, res, async (err) => {
    const writtenFiles = []

    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed.',
        })
      }

      const id = req.params.postid
      if (!id) throw new ValidationError('Post ID is required')
      if (Number.isNaN(Number(id))) throw new ValidationError('Post ID must be a valid number')

      const existingPost = db.prepare('SELECT id FROM posts WHERE id = ?').get(id)
      if (!existingPost) {
        throw new ValidationError('Post not found')
      }

      const folderRow = db
        .prepare(
          `
            SELECT folder_url
            FROM images
            WHERE post_id = ? AND folder_url IS NOT NULL
            ORDER BY CASE WHEN image_type = 'title' THEN 0 ELSE 1 END, id
            LIMIT 1
          `,
        )
        .get(id)

      if (!folderRow?.folder_url) {
        throw new ValidationError('This post does not have a valid image folder.')
      }

      const files = req.files || {}
      const extraImages = files.extraImages || []
      const thumbnails = files.thumbnails || []

      if (extraImages.length !== thumbnails.length) {
        throw new ValidationError('Uploaded images and thumbnails must match.')
      }

      const extraImageIds = normaliseFieldArray(req.body.extraImageIds).map(sanitiseMediaId)
      const uploadsDir = path.join(publicUploadsDir, folderRow.folder_url)
      const inlineImagePathLookup = new Map()
      const imagesToInsert = []

      if (extraImages.length > 0) {
        fs.mkdirSync(uploadsDir, { recursive: true })

        const { maxOrder } =
          db
            .prepare(
              `
                SELECT COALESCE(MAX(order_index), -1) AS maxOrder
                FROM images
                WHERE post_id = ? AND image_type = 'extra'
              `,
            )
            .get(id) || {}

        for (let index = 0; index < extraImages.length; index++) {
          const extraFile = extraImages[index]
          const thumbnailFile = thumbnails[index]

          if (!thumbnailFile) {
            throw new ValidationError(`Missing thumbnail for image ${index + 1}.`)
          }

          const uniqueId =
            sanitiseMediaId(extraImageIds[index]) ||
            `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}`

          const ext = getExtensionFromMimetype(extraFile.mimetype)
          const extraFilename = `extra_${uniqueId}${ext}`
          const thumbnailFilename = `thumb_${uniqueId}${ext}`

          const extraDiskPath = path.join(uploadsDir, extraFilename)
          const thumbnailDiskPath = path.join(uploadsDir, thumbnailFilename)

          fs.writeFileSync(extraDiskPath, extraFile.buffer)
          fs.writeFileSync(thumbnailDiskPath, thumbnailFile.buffer)

          writtenFiles.push(extraDiskPath, thumbnailDiskPath)

          const orderIndex = (maxOrder ?? -1) + index + 1
          const extraImagePath = `/uploads/${folderRow.folder_url}/${extraFilename}`
          const thumbnailPath = `/uploads/${folderRow.folder_url}/${thumbnailFilename}`

          inlineImagePathLookup.set(uniqueId, extraImagePath)
          imagesToInsert.push(
            {
              path: extraImagePath,
              type: 'extra',
              folder: folderRow.folder_url,
              orderIndex,
            },
            {
              path: thumbnailPath,
              type: 'thumbnail',
              folder: folderRow.folder_url,
              orderIndex,
            },
          )
        }
      }

      const safeTitle = sanitizePlainTextContent(req.body?.postTitle ?? '')
      const safeBody = sanitizeRichTextContent(
        replaceInlineMediaTokens(req.body?.postBody ?? '', inlineImagePathLookup),
      )
      const safeBrand = sanitizePlainTextContent(req.body?.brand ?? '')
      const safeModel = sanitizePlainTextContent(req.body?.model ?? '')
      const safeLocationFocus = DEFAULT_POST_LOCATION

      const postEdit = editPostSchema.parse({
        postTitle: safeTitle,
        postBody: safeBody,
        brand: safeBrand,
        model: safeModel,
        locationFocus: safeLocationFocus,
      })
      const canonicalSlug = buildPostSlug({ postTitle: postEdit.postTitle })
      const updatedAt = new Date().toISOString()

      const updatePost = db.prepare(
        `
          UPDATE posts
          SET
            post_title = ?,
            post_body = ?,
            slug = ?,
            seo_title = ?,
            seo_description = ?,
            brand = ?,
            model = ?,
            service_type = ?,
            issue_summary = ?,
            location_focus = ?,
            updated_at = ?
          WHERE id = ?
        `,
      )
      const insertImage = db.prepare(
        `
          INSERT INTO images (post_id, image_path, image_type, folder_url, order_index)
          VALUES (?, ?, ?, ?, ?)
        `,
      )

      const saveChanges = db.transaction(() => {
        const result = updatePost.run(
          postEdit.postTitle,
          postEdit.postBody,
          canonicalSlug,
          null,
          null,
          emptyToNull(postEdit.brand),
          emptyToNull(postEdit.model),
          null,
          null,
          emptyToNull(postEdit.locationFocus),
          updatedAt,
          id,
        )

        if (result.changes === 0) {
          throw new ValidationError('Post not found or no changes made')
        }

        imagesToInsert.forEach((image) => {
          insertImage.run(id, image.path, image.type, image.folder, image.orderIndex)
        })
      })

      saveChanges()

      res.json({
        success: true,
        message: 'Post edited successfully',
        editedId: id,
        post: {
          postId: Number(id),
          postTitle: postEdit.postTitle,
          postBody: postEdit.postBody,
          slug: canonicalSlug,
          seoTitle: null,
          seoDescription: null,
          brand: emptyToNull(postEdit.brand),
          model: emptyToNull(postEdit.model),
          serviceType: null,
          issueSummary: null,
          locationFocus: emptyToNull(postEdit.locationFocus),
          updatedAt,
        },
      })
    } catch (error) {
      cleanupCreatedFiles(writtenFiles)
      console.error('Error: ', error)

      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message,
          errors: error.errors,
        })
      }

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
      }

      res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
      })
    }
  })
})

export default router
