import express from 'express'
import { db } from '../database.js'
import { verifyUserIdentity } from '../middleware/supabaseAuth.js'

const router = express.Router()
// Deletes selected
router.delete('/delete/:postid', verifyUserIdentity, (req, res) => {
  try {
    const postId = req.params.postid
    console.log(postId)
    if (!postId) throw new Error('Bad post id')
    console.log(postId)
  } catch {
    console.error('Server error deleting post')
  }
  res.send('Got a DELETE request at /user')
})
export default router
