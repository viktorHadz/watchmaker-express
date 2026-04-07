import sanitizeHtml from 'sanitize-html'

const plainTextSanitizerConfig = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
}

const decodeBasicHtmlEntities = (input = '') =>
  input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

const collapsePlainText = (input = '') => decodeBasicHtmlEntities(input).replace(/\s+/g, ' ').trim()
const MEDIA_TAG_PATTERN = /<(img|figure)\b/i

export const sanitizePlainTextContent = (input) =>
  typeof input === 'string'
    ? decodeBasicHtmlEntities(sanitizeHtml(input, plainTextSanitizerConfig)).trim()
    : input

export const sanitizeRichTextContent = (input) =>
  typeof input === 'string'
    ? (() => {
        const sanitized = sanitizeHtml(input, {
          allowedTags: [
            'p',
            'br',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'ul',
            'ol',
            'li',
            'div',
            'figure',
            'figcaption',
            'img',
            'strong',
            'b',
            'em',
            'i',
            'u',
            's',
            'a',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
            'hr',
            'code',
            'pre',
          ],
          allowedAttributes: {
            a: ['href', 'target', 'rel'],
            div: ['class'],
            figure: ['class'],
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            ol: ['start'],
            th: ['colspan', 'rowspan'],
            td: ['colspan', 'rowspan'],
          },
          allowedSchemes: ['http', 'https', 'mailto', 'tel'],
          allowedSchemesAppliedToAttributes: ['href', 'src'],
          transformTags: {
            a: sanitizeHtml.simpleTransform('a', {
              rel: 'noopener noreferrer',
              target: '_blank',
            }),
          },
        }).trim()

        const plainText = collapsePlainText(sanitizeHtml(sanitized, plainTextSanitizerConfig))
        return plainText || MEDIA_TAG_PATTERN.test(sanitized) ? sanitized : ''
      })()
    : input
