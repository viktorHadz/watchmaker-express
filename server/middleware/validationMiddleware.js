import * as z from 'zod'
import sanitizeHtml from 'sanitize-html'
import { securityLogger } from '../utils/security.js'
import { fileTypeFromBuffer } from 'file-type'

const cleanStringInputs = (input) =>
  typeof input === 'string'
    ? sanitizeHtml(input, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
        allowedAttributes: {},
      })
    : input

const checkFileType = async (files, req = null) => {
  try {
    for (const file of files) {
      const buffer = file.buffer

      if (!buffer) {
        if (req) {
          securityLogger(
            req,
            {
              errors: [
                {
                  path: ['files', file.originalname],
                  code: 'buffer_error',
                  message: `No buffer: ${file.originalname}`,
                },
              ],
            },
            'FILE_BUFFER_ERROR',
          )
        }
        return { flag: false, error: `File buffer validation failed: ${file.originalname}` }
      }

      const type = await fileTypeFromBuffer(buffer)

      if (!type || !['image/jpeg', 'image/png', 'image/webp'].includes(type.mime)) {
        if (req) {
          securityLogger(
            req,
            {
              errors: [
                {
                  path: ['files', file.originalname],
                  code: 'invalid_file_type',
                  message: `Invalid type: ${type?.mime || 'unknown'}`,
                },
              ],
            },
            'INVALID_FILE_TYPE',
          )
        }
        return { flag: false, error: `Invalid file type: ${file.originalname}` }
      }

      // Checks if declared mime type matches actual mime type
      if (file.mimetype !== type.mime) {
        if (req) {
          securityLogger(
            req,
            {
              errors: [
                {
                  path: ['files', file.originalname],
                  code: 'mime_type_mismatch',
                  message: `Declared: ${file.mimetype}, Actual: ${type.mime}`,
                },
              ],
            },
            'MIME_MISMATCH',
          )
        }
        return { flag: false, error: `Mime type mismatch: ${file.originalname}` }
      }
    }
    return { flag: true, error: '' }
  } catch (error) {
    if (req) {
      securityLogger(
        req,
        {
          errors: [{ path: ['images'], code: 'validation_error', message: error.message }],
        },
        'FILE_VALIDATION_ERROR',
      )
    }
    return { flag: false, error: 'File type validation failed' }
  }
}

// Multer file schema for server-side validation
const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  buffer: z.instanceof(Buffer),
  size: z.number().max(7 * 1024 * 1024, 'File size must be less than 7MB'),
})

/**
 * Creates a middleware function that validates and sanitizes request body data using a Zod schema.
 * Also validates file types by checking magic numbers against declared mime types.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate the request body against
 * @returns {Function} Express middleware function that validates and sanitizes req.body
 */
export const validateAndSanitize = (schema) => {
  return async (req, res, next) => {
    try {
      // First, sanitize string inputs
      const cleanBody = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [key, cleanStringInputs(value)]),
      )

      // Add files from multer to the body for validation if they exist
      if (req.files && req.files.length > 0) {
        cleanBody.images = req.files
      }

      // Basic Zod validation
      const validatedData = schema.parse(cleanBody)

      // If there are images, validate file types and magic numbers
      if (validatedData.images && validatedData.images.length > 0) {
        // First validate each file against the multer file schema
        for (let i = 0; i < validatedData.images.length; i++) {
          try {
            multerFileSchema.parse(validatedData.images[i])
          } catch (fileError) {
            if (fileError instanceof z.ZodError) {
              securityLogger(req, fileError, 'FILE_STRUCTURE_INVALID')
              return res.status(400).json({
                success: false,
                message: 'File structure validation failed',
                errors: [{ message: `Invalid file structure at index ${i}` }],
              })
            }
          }
        }

        // Then validate file types and magic numbers
        const fileValidation = await checkFileType(validatedData.images, req)

        if (!fileValidation.flag) {
          return res.status(400).json({
            success: false,
            message: 'File validation failed',
            errors: [{ message: fileValidation.error }],
          })
        }

        // Check total file size
        const totalSize = validatedData.images.reduce((sum, file) => sum + file.size, 0)
        if (totalSize > 35 * 1024 * 1024) {
          const error = {
            errors: [
              {
                path: ['images'],
                code: 'total_size_exceeded',
                message: `Total size of all images exceeds 35MB: ${Math.round(totalSize / 1024 / 1024)}MB`,
              },
            ],
          }
          securityLogger(req, error, 'FILE_SIZE_EXCEEDED')
          return res.status(400).json({
            success: false,
            message: 'File size validation failed',
            errors: [{ message: 'Total size of all images must be less than 35MB' }],
          })
        }
      }

      req.body = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        securityLogger(req, error, 'FORM_VALIDATION_FAILED')
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ message: 'Form validation failed' }],
        })
      }
      next(error)
    }
  }
}

// Schemas
export const editPostSchema = z.object({
  postTitle: z.string().min(1).max(200),
  postBody: z.string().min(0).max(20000),
})

// Updated form schema for server-side (works with Multer files)
export const formSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(20000),
  phone: z.string().trim().max(25).optional().or(z.literal('')),
  // Images will be added by the middleware from req.files
  images: z.array(multerFileSchema).max(5, 'Maximum 5 images allowed').optional(),
})
