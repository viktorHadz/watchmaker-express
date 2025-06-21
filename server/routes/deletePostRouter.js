import express from 'express'
import { db } from '../database.js'
import { verifyUserIdentity } from '../middleware/supabaseAuth.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
// Deletes selected
router.delete('/delete/:postid', verifyUserIdentity, async (req, res) => {
  try {
    const postId = req.params.postid

    // Validation
    if (!postId || isNaN(postId)) {
      return res.status(400).json({ success: false, error: 'Invalid post ID' })
    }

    // Delete files first - non-blocking!
    await deletePostFiles(postId)

    // Delete from database
    const result = db.prepare(`DELETE FROM posts WHERE id = ?`).run(postId)
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' })
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
      deletedId: postId,
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ success: false, message: 'Failed to delete post' })
  }
})

async function deletePostFiles(postId) {
  // This is synchronous - no await needed
  const stmtImageData = db.prepare(`SELECT folder_url FROM images WHERE post_id=?`).get(postId)

  if (!stmtImageData?.folder_url) {
    console.log(`No files to delete for post ${postId}`)
    return
  }

  const currentDir = dirname(fileURLToPath(import.meta.url))
  const dir = path.join(currentDir, '..', 'public', 'uploads', stmtImageData.folder_url)

  try {
    await fs.rm(dir, { recursive: true, force: true })
    console.log(`Deleted folder: ${dir}`)
  } catch (error) {
    console.warn(`Could not delete folder ${dir}:`, error.message)
  }
}
export default router
