import express from 'express'
import { db } from '../database.js'

const router = express.Router()

router.get('/get-all', (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10 // Default 10 posts per page
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM posts').get().count

    // Get paginated posts
    const posts = db
      .prepare(
        `
      SELECT * FROM posts 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `,
      )
      .all(limit, offset)

    // Get all post IDs from this page
    const postIds = posts.map((post) => post.id)

    // Only fetch images for the posts we're returning
    let images = []
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',')
      images = db
        .prepare(
          `
        SELECT * FROM images 
        WHERE post_id IN (${placeholders})
        ORDER BY post_id, id
      `,
        )
        .all(...postIds)
    }

    // Group images by post
    const imgsByPost = {}
    images.forEach((image) => {
      if (!imgsByPost[image.post_id]) {
        imgsByPost[image.post_id] = []
      }
      imgsByPost[image.post_id].push(image)
    })

    // Build the result
    const result = posts.map((post) => {
      const postImages = imgsByPost[post.id] || []
      return {
        postId: post.id,
        postTitle: post.post_title,
        postBody: post.post_body,
        date: post.date,
        postFolder: postImages[0]?.folder_url || null,
        titleImage: postImages[0]
          ? {
              id: postImages[0].id,
              titlePath: postImages[0].image_path,
              type: postImages[0].image_type,
            }
          : null,
        extraImages: postImages.slice(1).map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
        })),
      }
    })

    // Return paginated response with metadata
    return res.json({
      posts: result,
      pagination: {
        page,
        limit,
        totalPosts: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.log(`V-Error: ${error}`)
    return res.status(500).json({ error: 'Database error' })
  }
})

// Alternative: Keep a simpler endpoint without pagination for backward compatibility
router.get('/get-all-simple', (req, res) => {
  try {
    const posts = db.prepare(`SELECT * FROM posts`).all()
    const images = db.prepare('SELECT * FROM images ORDER BY post_id, id').all()

    const imgsByPost = {}
    images.forEach((image) => {
      if (!imgsByPost[image.post_id]) {
        imgsByPost[image.post_id] = []
      }
      imgsByPost[image.post_id].push(image)
    })

    const result = posts.map((post) => {
      const postImages = imgsByPost[post.id] || []
      return {
        postId: post.id,
        postTitle: post.post_title,
        postBody: post.post_body,
        date: post.date,
        postFolder: postImages[0]?.folder_url || null,
        titleImage: postImages[0]
          ? {
              id: postImages[0].id,
              titlePath: postImages[0].image_path,
              type: postImages[0].image_type,
            }
          : null,
        extraImages: postImages.slice(1).map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
        })),
      }
    })
    return res.json(result)
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
    const offset = (page - 1) * limit

    // Get total count for search results
    const totalCount = db
      .prepare(
        `
      SELECT COUNT(*) as count FROM posts 
      WHERE post_title LIKE ? OR post_body LIKE ?
    `,
      )
      .get(`%${searchTerm}%`, `%${searchTerm}%`).count

    // Get paginated search results
    const posts = db
      .prepare(
        `
      SELECT * FROM posts 
      WHERE post_title LIKE ? OR post_body LIKE ?
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `,
      )
      .all(`%${searchTerm}%`, `%${searchTerm}%`, limit, offset)

    // Rest is the same as the paginated get-all...
    const postIds = posts.map((post) => post.id)

    let images = []
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',')
      images = db
        .prepare(
          `
        SELECT * FROM images 
        WHERE post_id IN (${placeholders})
        ORDER BY post_id, id
      `,
        )
        .all(...postIds)
    }

    const imgsByPost = {}
    images.forEach((image) => {
      if (!imgsByPost[image.post_id]) {
        imgsByPost[image.post_id] = []
      }
      imgsByPost[image.post_id].push(image)
    })

    const result = posts.map((post) => {
      const postImages = imgsByPost[post.id] || []
      return {
        postId: post.id,
        postTitle: post.post_body,
        date: post.date,
        postFolder: postImages[0]?.folder_url || null,
        titleImage: postImages[0]
          ? {
              id: postImages[0].id,
              titlePath: postImages[0].image_path,
              type: postImages[0].image_type,
            }
          : null,
        extra_images: postImages.slice(1).map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
        })),
      }
    })

    return res.json({
      posts: result,
      searchTerm,
      pagination: {
        page,
        limit,
        totalPosts: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    })
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
