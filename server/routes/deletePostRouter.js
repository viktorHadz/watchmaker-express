import express from 'express'
import { db } from '../database.js'
import { verifyUserIdentity } from '../middleware/supabaseAuth.js'

const router = express.Router()
// Deletes selected
router.delete('/delete/:postid', verifyUserIdentity, (req, res) => {
  try {
    const postId = req.params.postid
    if (!postId) throw new Error('Bad post id')
    if (isNaN(postId)) throw new Error('Bad post id: not a number')
    console.log('Deleting post with id: ', postId)

    const stmtDeletePost = db.prepare(`DELETE FROM posts WHERE id = ?`)
    const result = stmtDeletePost.run(postId)
    if (result.changes === 0) {
      return res.status(404).send({ success: false, error: 'Post not found' })
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
      deletedId: postId,
    })
  } catch (error) {
    console.error('Error: ', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message,
    })
  }
  // NEEED TOOO DELETE THE FKKKEEEEN PHOTOOOS  TOOOO O OFFFUUUK
})
export default router
