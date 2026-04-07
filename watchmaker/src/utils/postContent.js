const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i
const MEDIA_TAG_PATTERN = /<(img|figure)\b/i
const HEADING_SELECTOR = 'h1, h2, h3, h4'

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const normalisePostHtml = (content = '') => {
  const trimmedContent = typeof content === 'string' ? content.trim() : ''

  if (!trimmedContent) {
    return ''
  }

  if (HTML_TAG_PATTERN.test(trimmedContent)) {
    return trimmedContent
  }

  return escapeHtml(trimmedContent).replace(/\n/g, '<br />')
}

const slugifyHeading = (value = '') => {
  const base = `${value}`
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

  return base || 'section'
}

const decorateHeadingNodes = (root) => {
  const counts = new Map()

  return Array.from(root.querySelectorAll(HEADING_SELECTOR))
    .map((heading) => {
      const text = heading.textContent?.replace(/\s+/g, ' ').trim() || ''
      if (!text) {
        return null
      }

      const baseId = slugifyHeading(text)
      const duplicateCount = counts.get(baseId) || 0
      counts.set(baseId, duplicateCount + 1)

      const nextId = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`
      heading.id = heading.id || nextId

      return {
        id: heading.id,
        text,
        level: Number(heading.tagName.slice(1)) || 2,
      }
    })
    .filter(Boolean)
}

export const getPostHeadings = (content = '') => {
  const html = normalisePostHtml(content)

  if (!html || typeof document === 'undefined') {
    return []
  }

  const root = document.createElement('div')
  root.innerHTML = html

  return decorateHeadingNodes(root)
}

export const addHeadingAnchorsToPostHtml = (content = '') => {
  const html = normalisePostHtml(content)

  if (!html || typeof document === 'undefined') {
    return html
  }

  const root = document.createElement('div')
  root.innerHTML = html
  decorateHeadingNodes(root)

  return root.innerHTML
}

export const getPostPlainText = (content = '') => {
  const html = normalisePostHtml(content)

  if (!html) {
    return ''
  }

  if (typeof document === 'undefined') {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const parser = document.createElement('div')
  parser.innerHTML = html

  return parser.textContent?.replace(/\s+/g, ' ').trim() || ''
}

export const getPostExcerpt = (content = '', maxLength = 140) => {
  const plainText = getPostPlainText(content)

  if (!plainText) {
    return ''
  }

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
}

export const hasPostContent = (content = '') => {
  const html = normalisePostHtml(content)

  if (!html) {
    return false
  }

  if (MEDIA_TAG_PATTERN.test(html)) {
    return true
  }

  return Boolean(getPostPlainText(html))
}
