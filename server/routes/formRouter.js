import express from 'express'
import sanitizeHtml from 'sanitize-html'
import rateLimit from 'express-rate-limit'
import * as z from 'zod'

const router = express.Router()
// Zod schema
const formSchema = z.object({
  firstName: z.string().trim().min(3).max(50).nonempty(),
  lastName: z.string().trim().min(3).max(50).nonempty(),
  email: z.string().trim().email().max(254).nonempty(),
  message: z.string().trim().min(10).max(1000).nonempty(),
  phone: z.string().trim().max(25).optional().or(z.literal('')),
})
// Sanitize helper
const sanitizeInput = (input) =>
  typeof input === 'string'
    ? sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} })
    : input

// Rate limiter ONLY for form endpoint
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // allow 10 requests per IP for the form submission
  message: 'Too many form submissions. Please try again later.',
})

// POST form submission with rate limiting
router.post('/data', formLimiter, (req, res) => {
  console.log('Server got a hit')

  const rawFormData = req.body

  const sanitizedFormData = {
    firstName: sanitizeInput(rawFormData.firstName),
    lastName: sanitizeInput(rawFormData.lastName),
    email: sanitizeInput(rawFormData.email),
    phone: sanitizeInput(rawFormData.phone),
    message: sanitizeInput(rawFormData.message),
  }

  const result = formSchema.safeParse(sanitizedFormData)

  if (!result.success) {
    console.error('Validation errors:', result.error.format())
    return res.status(400).json({ errors: result.error.format() })
  }

  console.log('Sanitized and validated form data: ', result.data)
  res.status(200).json({ message: 'Form received', data: result.data })
})

export default router
