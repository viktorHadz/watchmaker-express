import express from 'express'
import { limiter } from '../middleware/rateLimiter.js'
import { validateAndSanitize, formSchema } from '../middleware/validationMiddleware.js'
import { Resend } from 'resend'

const router = express.Router()
const resend = new Resend(process.env.RESEND_KEY_TOKEN)

// POST form submission with rate limiting
router.post('/data', limiter, validateAndSanitize(formSchema), async (req, res) => {
  try {
    console.log('Sanitized and validated form data:', req.body)

    // TODO: Send email with req.body data
    console.log('Emailing...')
    const { data, error } = await resend.emails.send({
      from: 'Viktor <onboarding@resend.dev>',
      to: ['watchmaker.ves@gmail.com'],
      subject: 'hello world',
      html: `
        <strong>New Contact Form Submission</strong><br/>
        <strong>Name:</strong> ${req.body.firstName} ${req.body.lastName}<br/>
        <strong>Email:</strong> ${req.body.email}<br/>
        <strong>Phone:</strong> ${req.body.phone ? req.body.phone : 'No phone provided'}<br/>
        <strong>Message:</strong><br/>
        <pre>${req.body.message}</pre>
      `,
      // attachments: {
      //   content: 'attachment', // This needs the base64
      //   filename: `userImage.png`,
      // },
    })

    if (error) {
      res.status(400).json({ error })
      console.log(error)
      throw new Error('Error emailing: ', error)
    }

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
