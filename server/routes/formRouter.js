import express from 'express'
import { limiter } from '../middleware/rateLimiter.js'
import { validateAndSanitize, formSchema } from '../middleware/validationMiddleware.js'
import { Resend } from 'resend'
import multer from 'multer'
import { generateEmailTemplate } from '../utils/generateEmailTemplate.js'

const router = express.Router()
const resend = new Resend(process.env.RESEND_KEY_TOKEN)

// Multer configuration with memory storage
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 7 * 1024 * 1024, // 7MB each
    files: 5,
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
const sendToMail = process.env.WATCHMAKER_EMAIL


// POST form submission with rate limiting
router.post(
  '/data',
  limiter,
  upload.array('images', 5), // This processes the files first
  validateAndSanitize(formSchema), // This then validates including the files
  async (req, res) => {
    try {
      console.log('Sanitized and validated form data:', req.body)
      console.log('Validated files:', req.body.images?.length || 0, 'images')

      // Prepare attachments for email if images exist
      let attachments = []
      if (req.body.images && req.body.images.length > 0) {
        attachments = req.body.images.map((file, index) => ({
          content: file.buffer.toString('base64'),
          filename: `image_${index + 1}${getExtensionFromMimetype(file.mimetype)}`,
          type: file.mimetype,
        }))
      }
      const emailContent = generateEmailTemplate(req.body)
        
      const { data, error } = await resend.emails.send({
        from: 'Viktor <mailer@mail.thewatchmaker.uk>',
        to: sendToMail,
        subject: `New Email From - ${req.body.firstName} ${req.body.lastName}`,
        html: emailContent.html,
        text: emailContent.text,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      if (error) {
        console.error('Email error:', error)
        return res.status(400).json({
          success: false,
          message: 'Failed to send email',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        data: {
          ...req.body,
          images: req.body.images ? `${req.body.images.length} images processed` : 'No images',
        },
      })
    } catch (error) {
      console.error('Error processing form:', error)
      res.status(500).json({
        success: false,
        message: 'Server error processing form',
      })
    }
  },
)

export default router
