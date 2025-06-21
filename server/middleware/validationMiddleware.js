import * as z from 'zod'
import sanitizeHtml from 'sanitize-html'
import { securityLogger } from '../utils/security.js'
import { fileTypeFromBuffer } from 'file-type'

const sanitizeString = (input) =>
  typeof input === 'string'
    ? sanitizeHtml(input, {
        allowedTags: [], // No tags allowed
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      })
    : input

const validateFileTypes = async (files, req) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  for (const file of files) {
    if (!file.buffer) {
      securityLogger(
        req,
        { message: `Missing buffer for ${file.originalname}` },
        'FILE_BUFFER_ERROR',
      )
      throw new Error(`File buffer missing: ${file.originalname}`)
    }

    // Sanitize filename to prevent path traversal
    file.originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100)

    const detectedType = await fileTypeFromBuffer(file.buffer)

    if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
      securityLogger(
        req,
        {
          message: `Invalid file type detected: ${detectedType?.mime || 'unknown'} for ${file.originalname}`,
        },
        'DANGEROUS_INVALID_FILE_TYPE_POSSIBLE_ATTACK',
      )
      throw new Error(`Invalid file type: ${file.originalname}`)
    }

    if (file.mimetype !== detectedType.mime) {
      securityLogger(
        req,
        {
          message: `Mime mismatch - declared: ${file.mimetype}, actual: ${detectedType.mime}`,
        },
        'MIME_MISMATCH',
        { filename: file.originalname },
      )
      throw new Error(`Mime type mismatch: ${file.originalname}`)
    }

    // Check for embedded scripts in file content
    const bufferString = file.buffer.toString('utf8', 0, Math.min(1000, file.buffer.length))
    if (/<script|javascript:|data:text\/html|eval\(/i.test(bufferString)) {
      securityLogger(
        req,
        { message: `Suspicious content in ${file.originalname}` },
        'SUSPICIOUS_FILE_CONTENT',
      )
      throw new Error(`File contains suspicious content: ${file.originalname}`)
    }
  }
}

const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  buffer: z.instanceof(Buffer),
  size: z.number().max(7 * 1024 * 1024, 'File too large (max 7MB)'),
})

/**
 * Clean validation middleware
 * @param {z.ZodSchema} schema - Zod schema for validation
 */
export const validateAndSanitize = (schema) => {
  return async (req, res, next) => {
    try {
      // Sanitize body inputs
      const sanitizedBody = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [key, sanitizeString(value)]),
      )

      // Add files if present
      if (req.files?.length > 0) {
        // Validate file structure
        req.files.forEach((file, index) => {
          try {
            fileSchema.parse(file)
          } catch (err) {
            securityLogger(req, err, 'FILE_STRUCTURE_INVALID', { fileIndex: index })
            throw new Error(`Invalid file structure at index ${index}`)
          }
        })

        // Validate file types
        await validateFileTypes(req.files, req)

        // Check total size
        const totalSize = req.files.reduce((sum, file) => sum + file.size, 0)
        if (totalSize > 35 * 1024 * 1024) {
          securityLogger(
            req,
            {
              message: `Total file size exceeded: ${Math.round(totalSize / 1024 / 1024)}MB`,
            },
            'TOTAL_SIZE_EXCEEDED',
          )
          throw new Error('Total file size must be under 35MB')
        }

        sanitizedBody.images = req.files
      }

      // Validate with schema
      req.body = schema.parse(sanitizedBody)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        securityLogger(req, error, 'VALIDATION_FAILED')
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }

      securityLogger(req, { message: error.message }, 'VALIDATION_ERROR')
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

// Schemas
export const formSchema = z.object({
  firstName: z.string().trim().min(1, 'First name required').max(50),
  lastName: z.string().trim().min(1, 'Last name required').max(50),
  email: z.string().trim().email('Invalid email').max(254),
  message: z.string().trim().min(10, 'Message too short').max(6000, 'Message too long.'),
  phone: z.string().trim().max(25).optional().or(z.literal('')),
  images: z.array(fileSchema).max(5, 'Max 5 images').optional(),
})

export const editPostSchema = z.object({
  postTitle: z.string().min(1, 'Title required').max(200),
  postBody: z.string().min(0),
})
