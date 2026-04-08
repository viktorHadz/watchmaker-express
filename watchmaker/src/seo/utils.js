import { getPostExcerpt } from '../utils/postContent.js'

export const SITE_ORIGIN = 'https://thewatchmaker.uk'
export const DEFAULT_OG_IMAGE_PATH = '/og-image-thewatchmaker.png'
export const DEFAULT_POST_LOCATION = 'London, UK'

export function slugify(value = '') {
  const base = `${value}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return base || 'workshop-story'
}

export function stripHtml(value = '') {
  return `${value}`
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateText(value = '', maxLength = 160) {
  const normalised = `${value}`.trim()

  if (!normalised) {
    return ''
  }

  if (normalised.length <= maxLength) {
    return normalised
  }

  return `${normalised.slice(0, maxLength - 1).trimEnd()}...`
}

export function toAbsoluteUrl(path = '/') {
  if (!path) {
    return SITE_ORIGIN
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export function formatPostalHtml(value = '') {
  return `${value}`.replace(/\n/g, '<br />')
}

export function buildPostSlug(post = {}) {
  const source = post.postTitle || post.post_title || post.title || post.slug || ''
  return slugify(source)
}

export function buildCanonicalPostPath(post = {}) {
  const postId = Number(post.postId || post.id)

  if (!Number.isFinite(postId)) {
    return '/my-work'
  }

  return `/my-work/${buildPostSlug(post)}-${postId}`
}

export function buildLegacyPostPath(postId) {
  return `/my-work/${postId}`
}

export function getPostSeoTitle(post = {}) {
  const title = `${post.postTitle || post.post_title || 'Workshop Story'}`.trim()
  return `${title} | The Watchmaker London`
}

export function getPostSeoDescription(post = {}) {
  const summary = getPostExcerpt(post.postBody || post.post_body || '', 155)

  if (summary) {
    return truncateText(summary, 160)
  }

  return 'Recent workshop work from The Watchmaker in London, covering vintage and mechanical watch repair, servicing, and restoration.'
}

export function getPostOgImage(post = {}) {
  const titlePath = post.titleImage?.titlePath || post.titleImage?.path
  if (titlePath) {
    return toAbsoluteUrl(`/public${titlePath}`)
  }

  return toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)
}

export function parseLegacyDisplayDateToIso(value = '') {
  const match = `${value}`.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/)

  if (!match) {
    return ''
  }

  const [, day, month, year] = match
  return `${year}-${month}-${day}T12:00:00.000Z`
}

export function formatDisplayDate(value = '') {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
