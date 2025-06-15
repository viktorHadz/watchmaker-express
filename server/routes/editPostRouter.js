import express from 'express'
import { db } from '../database.js'
import { verifyUserIdentity } from '../middleware/supabaseAuth.js'
import { validateAndSanitize, editPostSchema } from '../middleware/validationMiddleware.js'

const router = express.Router()

// Helps avoid sending internal errors to client
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

router.patch(
  '/edit/:postid',
  verifyUserIdentity,
  validateAndSanitize(editPostSchema),
  (req, res) => {
    try {
      const id = req.params.postid
      if (!id) throw new ValidationError('Post ID is required')
      if (isNaN(id)) throw new ValidationError('Post ID must be a valid number')

      const postEdit = req.body
      console.log('attempting to enter: ', postEdit)
      const stmtUpdate = db.prepare(
        `UPDATE posts 
         SET post_title = ?, post_body = ?
         WHERE id = ?`,
      )

      const result = stmtUpdate.run(postEdit.postTitle, postEdit.postBody, id)

      if (result.changes === 0) {
        throw new ValidationError('Post not found or no changes made')
      }

      res.json({
        success: true,
        message: 'Post edited successfully',
        editedId: id,
      })
    } catch (error) {
      console.error('Error: ', error)

      // Only send validation errors to frontend
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message,
          errors: error.errors,
        })
      }

      // Sends generic errs to client
      res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
      })
    }
  },
)

export default router
