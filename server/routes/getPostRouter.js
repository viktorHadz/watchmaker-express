import express from 'express'
import { db } from '../database.js'
const router = express.Router()

router.get('/get-all', (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12 // Default 10 posts per page
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
        ORDER BY post_id, order_index, id
      `,
        )
        .all(...postIds)
    }

    // Group images by post and type
    const imgsByPost = {}
    images.forEach((image) => {
      if (!imgsByPost[image.post_id]) {
        imgsByPost[image.post_id] = {
          title: null,
          extras: [],
          thumbnails: [],
        }
      }

      if (image.image_type === 'title') {
        imgsByPost[image.post_id].title = image
      } else if (image.image_type === 'extra') {
        imgsByPost[image.post_id].extras.push(image)
      } else if (image.image_type === 'thumbnail') {
        imgsByPost[image.post_id].thumbnails.push(image)
      }
    })

    // Build the result
    const result = posts.map((post) => {
      const postImages = imgsByPost[post.id] || { title: null, extras: [], thumbnails: [] }
      return {
        postId: post.id,
        postTitle: post.post_title,
        postBody: post.post_body,
        date: post.date,
        postType: post.post_type,
        postFolder: postImages.title?.folder_url || null,
        titleImage: postImages.title
          ? {
              id: postImages.title.id,
              titlePath: postImages.title.image_path,
              type: postImages.title.image_type,
            }
          : null,
        extraImages: postImages.extras.map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
          order: img.order_index,
        })),
        thumbImages: postImages.thumbnails.map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
          order: img.order_index,
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

    // Get all post IDs from this page
    const postIds = posts.map((post) => post.id)

    let images = []
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',')
      images = db
        .prepare(
          `
        SELECT * FROM images 
        WHERE post_id IN (${placeholders})
        ORDER BY post_id, order_index, id
      `,
        )
        .all(...postIds)
    }

    // Group images by post and type
    const imgsByPost = {}
    images.forEach((image) => {
      if (!imgsByPost[image.post_id]) {
        imgsByPost[image.post_id] = {
          title: null,
          extras: [],
          thumbnails: [],
        }
      }

      if (image.image_type === 'title') {
        imgsByPost[image.post_id].title = image
      } else if (image.image_type === 'extra') {
        imgsByPost[image.post_id].extras.push(image)
      } else if (image.image_type === 'thumbnail') {
        imgsByPost[image.post_id].thumbnails.push(image)
      }
    })

    const result = posts.map((post) => {
      const postImages = imgsByPost[post.id] || { title: null, extras: [], thumbnails: [] }
      return {
        postId: post.id,
        postTitle: post.post_title,
        postBody: post.post_body,
        date: post.date,
        postType: post.post_type,
        postFolder: postImages.title?.folder_url || null,
        titleImage: postImages.title
          ? {
              id: postImages.title.id,
              titlePath: postImages.title.image_path,
              type: postImages.title.image_type,
            }
          : null,
        extraImages: postImages.extras.map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
          order: img.order_index,
        })),
        thumbImages: postImages.thumbnails.map((img) => ({
          id: img.id,
          path: img.image_path,
          type: img.image_type,
          order: img.order_index,
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

// Get single post by ID
router.get('/get/:id', (req, res) => {
  try {
    const postId = req.params.id

    // Get the post
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Get all images for this post
    const images = db
      .prepare('SELECT * FROM images WHERE post_id = ? ORDER BY order_index, id')
      .all(postId)

    // Separate images by type
    const imagesByType = {
      title: null,
      extras: [],
      thumbnails: [],
    }

    images.forEach((image) => {
      if (image.image_type === 'title') {
        imagesByType.title = image
      } else if (image.image_type === 'extra') {
        imagesByType.extras.push(image)
      } else if (image.image_type === 'thumbnail') {
        imagesByType.thumbnails.push(image)
      }
    })

    // Build response
    const result = {
      postId: post.id,
      postTitle: post.post_title,
      postBody: post.post_body,
      date: post.date,
      postType: post.post_type,
      postFolder: imagesByType.title?.folder_url || null,
      titleImage: imagesByType.title
        ? {
            id: imagesByType.title.id,
            titlePath: imagesByType.title.image_path,
            type: imagesByType.title.image_type,
          }
        : null,
      extraImages: imagesByType.extras.map((img) => ({
        id: img.id,
        path: img.image_path,
        type: img.image_type,
        order: img.order_index,
      })),
      thumbImages: imagesByType.thumbnails.map((img) => ({
        id: img.id,
        path: img.image_path,
        type: img.image_type,
        order: img.order_index,
      })),
    }

    return res.json(result)
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
