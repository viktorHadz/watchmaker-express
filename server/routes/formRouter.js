import express from 'express'
import { limiter } from '../middleware/rateLimiter.js'
import { validateAndSanitize, formSchema } from '../middleware/validationMiddleware.js'

const router = express.Router()

// POST form submission with rate limiting
router.post('/data', limiter, validateAndSanitize(formSchema), (req, res) => {
  try {
    console.log('Sanitized and validated form data:', req.body)

    // TODO: Send email with req.body data

    res.status(200).json({
      message: 'Form received',
      data: req.body,
    })
  } catch (error) {
    console.error('Error processing form:', error)
    res.status(500).json({
      success: false,
      message: 'Server error processing form',
    })
  }
})
/* 
TODO:
  - Needs a sanitizer for the images 
  - Needs mailer 
  - Put in temp then take from there when needing to email and delete them 
*/
export default router
