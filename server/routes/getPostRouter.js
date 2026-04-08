import express from 'express'
import { getPaginatedPosts, getPostById, searchPosts } from '../services/postRepository.js'
const router = express.Router()

router.get('/get-all', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    return res.json(getPaginatedPosts(page, limit))
  } catch (error) {
    console.log(`V-Error: ${error}`)
    return res.status(500).json({ error: 'Database error' })
  }
})

// Bonus: Add a search endpoint with pagination
router.get('/search', (req, res) => {
  try {
    const searchTerm = req.query.q || ''
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    return res.json(searchPosts(searchTerm, page, limit))
  } catch (error) {
    console.log(`V-Error: ${error}`)
    return res.status(500).json({ error: 'Database error' })
  }
})

// Get single post by ID
router.get('/get/:id', (req, res) => {
  try {
    const post = getPostById(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    return res.json(post)
  } catch (error) {
    console.log(`V-Error: ${error}`)
    return res.status(500).json({ error: 'Database error' })
  }
})

export default router

// Usage examples:
// GET /posts/get-all?page=1&limit=10
// GET /posts/get-all?page=2&limit=20
// GET /posts/search?q=javascript&page=1&limit=10
// GET /posts/get/123
