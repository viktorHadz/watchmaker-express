const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i

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

export const getPostPlainText = (content = '') => {
  const html = normalisePostHtml(content)

  if (!html) {
    return ''
  }

  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
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
