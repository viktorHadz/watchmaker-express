import sanitizeHtml from 'sanitize-html'

export const sanitizePlainTextContent = (input) =>
  typeof input === 'string'
    ? sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
      })
    : input

export const sanitizeRichTextContent = (input) =>
  typeof input === 'string'
    ? sanitizeHtml(input, {
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
          ol: ['start'],
          th: ['colspan', 'rowspan'],
          td: ['colspan', 'rowspan'],
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        allowedSchemesAppliedToAttributes: ['href'],
        transformTags: {
          a: sanitizeHtml.simpleTransform('a', {
            rel: 'noopener noreferrer',
            target: '_blank',
          }),
        },
      })
    : input
