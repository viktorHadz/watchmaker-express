import { db } from '../database.js'
import {
  DEFAULT_POST_LOCATION,
  buildCanonicalPostPath,
  buildPostSlug,
  getPostSeoDescription,
  getPostSeoTitle,
  parseLegacyDisplayDateToIso,
} from '../../watchmaker/src/seo/utils.js'

const EMPTY_POST_IMAGES = {
  title: null,
  extras: [],
  thumbnails: [],
}

function mapImagesByPost(images = []) {
  const grouped = {}

  images.forEach((image) => {
    if (!grouped[image.post_id]) {
      grouped[image.post_id] = {
        title: null,
        extras: [],
        thumbnails: [],
      }
    }

    if (image.image_type === 'title') {
      grouped[image.post_id].title = image
    } else if (image.image_type === 'extra') {
      grouped[image.post_id].extras.push(image)
    } else if (image.image_type === 'thumbnail') {
      grouped[image.post_id].thumbnails.push(image)
    }
  })

  return grouped
}

function mapPost(post, images = EMPTY_POST_IMAGES) {
  const slug = buildPostSlug(post)
  const publishedAt = post.published_at || parseLegacyDisplayDateToIso(post.date) || ''
  const updatedAt = post.updated_at || publishedAt

  const mapped = {
    id: post.id,
    postId: post.id,
    slug,
    postTitle: post.post_title,
    postBody: post.post_body,
    date: post.date,
    postType: post.post_type,
    brand: post.brand || '',
    model: post.model || '',
    serviceType: post.service_type || '',
    issueSummary: post.issue_summary || '',
    locationFocus: post.location_focus || DEFAULT_POST_LOCATION,
    seoTitle: post.seo_title || '',
    seoDescription: post.seo_description || '',
    publishedAt,
    updatedAt,
    postFolder: images.title?.folder_url || null,
    titleImage: images.title
      ? {
          id: images.title.id,
          titlePath: images.title.image_path,
          path: images.title.image_path,
          type: images.title.image_type,
        }
      : null,
    extraImages: images.extras.map((img) => ({
      id: img.id,
      path: img.image_path,
      type: img.image_type,
      order: img.order_index,
    })),
    thumbImages: images.thumbnails.map((img) => ({
      id: img.id,
      path: img.image_path,
      type: img.image_type,
      order: img.order_index,
    })),
  }

  mapped.canonicalPath = buildCanonicalPostPath(mapped)
  mapped.seoTitleResolved = getPostSeoTitle(mapped)
  mapped.seoDescriptionResolved = getPostSeoDescription(mapped)

  return mapped
}

function getImagesForPostIds(postIds = []) {
  if (postIds.length === 0) {
    return {}
  }

  const placeholders = postIds.map(() => '?').join(',')
  const images = db
    .prepare(
      `
        SELECT *
        FROM images
        WHERE post_id IN (${placeholders})
        ORDER BY post_id, order_index, id
      `,
    )
    .all(...postIds)

  return mapImagesByPost(images)
}

export function getPaginatedPosts(page = 1, limit = 12) {
  const safePage = Number(page) > 0 ? Number(page) : 1
  const safeLimit = Number(limit) > 0 ? Number(limit) : 12
  const offset = (safePage - 1) * safeLimit
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM posts').get().count
  const posts = db
    .prepare(
      `
        SELECT *
        FROM posts
        ORDER BY COALESCE(updated_at, published_at) DESC, id DESC
        LIMIT ? OFFSET ?
      `,
    )
    .all(safeLimit, offset)

  const imagesByPost = getImagesForPostIds(posts.map((post) => post.id))
  const result = posts.map((post) => mapPost(post, imagesByPost[post.id] || EMPTY_POST_IMAGES))

  return {
    posts: result,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalPosts: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
      hasNextPage: safePage < Math.ceil(totalCount / safeLimit),
      hasPrevPage: safePage > 1,
    },
  }
}

export function searchPosts(searchTerm = '', page = 1, limit = 10) {
  const safePage = Number(page) > 0 ? Number(page) : 1
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10
  const offset = (safePage - 1) * safeLimit
  const query = `%${searchTerm}%`
  const totalCount = db
    .prepare(
      `
        SELECT COUNT(*) as count
        FROM posts
        WHERE post_title LIKE ? OR post_body LIKE ?
      `,
    )
    .get(query, query).count
  const posts = db
    .prepare(
      `
        SELECT *
        FROM posts
        WHERE post_title LIKE ? OR post_body LIKE ?
        ORDER BY COALESCE(updated_at, published_at) DESC, id DESC
        LIMIT ? OFFSET ?
      `,
    )
    .all(query, query, safeLimit, offset)

  const imagesByPost = getImagesForPostIds(posts.map((post) => post.id))
  const result = posts.map((post) => mapPost(post, imagesByPost[post.id] || EMPTY_POST_IMAGES))

  return {
    posts: result,
    searchTerm,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalPosts: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
      hasNextPage: safePage < Math.ceil(totalCount / safeLimit),
      hasPrevPage: safePage > 1,
    },
  }
}

export function getPostById(postId) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId)

  if (!post) {
    return null
  }

  const images = db
    .prepare('SELECT * FROM images WHERE post_id = ? ORDER BY order_index, id')
    .all(postId)

  return mapPost(post, mapImagesByPost(images)[post.id] || EMPTY_POST_IMAGES)
}

export function getAllPostsForSeo() {
  const posts = db
    .prepare(
      `
        SELECT *
        FROM posts
        ORDER BY COALESCE(updated_at, published_at) DESC, id DESC
      `,
    )
    .all()

  const imagesByPost = getImagesForPostIds(posts.map((post) => post.id))
  return posts.map((post) => mapPost(post, imagesByPost[post.id] || EMPTY_POST_IMAGES))
}
