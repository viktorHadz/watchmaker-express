const ASSET_TOKEN_PREFIX = '__WATCHMAKER_MEDIA__:'
export const BULK_GALLERY_BLOCK_COUNT = 100
export const GALLERY_BLOCK_COUNTS = [2, 3, 6, 9, BULK_GALLERY_BLOCK_COUNT]
const MAX_GALLERY_BLOCK_IMAGES = Math.max(...GALLERY_BLOCK_COUNTS)

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const createBlockId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 8)}`

const normaliseText = (value = '') => `${value}`.replace(/\s+/g, ' ').trim()
const normaliseRef = (value = '') => `${value}`.trim()

const normaliseLayout = (layout = 'full') =>
  ['full', 'caption', 'pair', 'gallery'].includes(layout) ? layout : 'full'

const normaliseGalleryCount = (count = 3) => {
  const parsed = Number(count)
  return GALLERY_BLOCK_COUNTS.includes(parsed) ? parsed : 3
}

const getGalleryCountClass = (count = 3) =>
  `post-block-row--gallery-${normaliseGalleryCount(count)}`

const getGalleryCountFromClassList = (classList, fallbackCount) => {
  const galleryClass = Array.from(classList || []).find((className) =>
    className.startsWith('post-block-row--gallery-'),
  )

  if (!galleryClass) {
    return fallbackCount
  }

  const parsed = Number(galleryClass.replace('post-block-row--gallery-', ''))
  return GALLERY_BLOCK_COUNTS.includes(parsed) ? parsed : fallbackCount
}

const getDefaultImageRefs = (layout = 'full') => {
  switch (normaliseLayout(layout)) {
    case 'pair':
      return ['', '']
    case 'gallery':
      return Array.from({ length: normaliseGalleryCount(3) }, () => '')
    default:
      return ['']
  }
}

const resolveAssetByRef = (imageRef = '', assets = []) => {
  const ref = normaliseRef(imageRef)
  if (!ref) {
    return null
  }

  return (
    assets.find((asset) => normaliseRef(asset.id) === ref || normaliseRef(asset.src) === ref) ||
    null
  )
}

const shouldUseAssetToken = (asset) =>
  Boolean(asset?.file || asset?.thumbnailFile || asset?.isLocalUpload)

const resolveImageSrc = (imageRef = '', assets = [], { useTokens = false } = {}) => {
  const ref = normaliseRef(imageRef)
  if (!ref) {
    return ''
  }

  const asset = resolveAssetByRef(ref, assets)
  if (asset) {
    return useTokens && shouldUseAssetToken(asset) ? `${ASSET_TOKEN_PREFIX}${asset.id}` : asset.src
  }

  return ref
}

const resolveImageAlt = (imageRef = '', assets = []) => {
  const asset = resolveAssetByRef(imageRef, assets)
  return asset?.alt || asset?.label || ''
}

const sanitiseParagraphNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent || '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  if (node.tagName === 'BR') {
    return '<br />'
  }

  const childHtml = Array.from(node.childNodes).map(sanitiseParagraphNode).join('')

  if (node.tagName === 'STRONG' || node.tagName === 'B') {
    return childHtml ? `<strong>${childHtml}</strong>` : ''
  }

  return childHtml
}

const tidyParagraphHtml = (html = '') =>
  html
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />')
    .replace(/^(<br\s*\/?>\s*)+/gi, '')
    .replace(/(<br\s*\/?>\s*)+$/gi, '')
    .trim()

const buildImageFigure = (src, alt = '', caption = '') => {
  if (!src) {
    return ''
  }

  const safeSrc = escapeHtml(src)
  const safeAlt = escapeHtml(alt)
  const safeCaption = normaliseText(caption)

  return safeCaption
    ? `<figure class="post-block-image"><img src="${safeSrc}" alt="${safeAlt}" /><figcaption class="text-fg/90">${escapeHtml(safeCaption)}</figcaption></figure>`
    : `<figure class="post-block-image"><img src="${safeSrc}" alt="${safeAlt}" /></figure>`
}

const createParagraphFromText = (value = '') => {
  const text = `${value}`.trim()
  if (!text) {
    return null
  }

  return createParagraphBlock(escapeHtml(text).replace(/\n/g, '<br />'))
}

const parseImageRefs = (elements = [], assets = []) =>
  elements
    .map((element) => normaliseRef(element.getAttribute('src') || ''))
    .map((src) => resolveAssetByRef(src, assets)?.id || src)
    .filter(Boolean)

export const createHeadingBlock = (level = 2, text = '') => ({
  id: createBlockId(),
  type: 'heading',
  level: [1, 2, 3].includes(Number(level)) ? Number(level) : 2,
  text: `${text}`,
})

export const createParagraphBlock = (html = '') => ({
  id: createBlockId(),
  type: 'paragraph',
  html: `${html}`,
})

export const createImageBlock = (layout = 'full') => ({
  id: createBlockId(),
  type: 'image',
  layout: normaliseLayout(layout),
  imageRefs: getDefaultImageRefs(layout),
  caption: '',
})

export const getBlockLabel = (block) => {
  if (!block) {
    return 'Block'
  }

  if (block.type === 'heading') {
    return 'Title'
  }

  if (block.type === 'paragraph') {
    return 'Paragraph'
  }

  switch (block.layout) {
    case 'caption':
      return 'Image + caption'
    case 'pair':
      return 'Two images'
    case 'gallery':
      return 'Gallery row'
    default:
      return 'Full width image'
  }
}

export const getImageLayoutSlots = (layout = 'full') => getDefaultImageRefs(layout).length

export const sanitizeParagraphHtml = (html = '') => {
  if (typeof document === 'undefined') {
    return tidyParagraphHtml(
      `${html}`
        .replace(/<(?!\/?(strong|b|br)\b)[^>]*>/gi, '')
        .replace(/<b(\s[^>]*)?>/gi, '<strong>')
        .replace(/<\/b>/gi, '</strong>'),
    )
  }

  const container = document.createElement('div')
  container.innerHTML = html
  return tidyParagraphHtml(Array.from(container.childNodes).map(sanitiseParagraphNode).join(''))
}

export const getReferencedAssetIds = (blocks = []) =>
  new Set(
    blocks.flatMap((block) =>
      block?.type === 'image'
        ? (block.imageRefs || []).map((imageRef) => normaliseRef(imageRef)).filter(Boolean)
        : [],
    ),
  )

export const buildPostHtmlFromBlocks = (blocks = [], assets = [], options = {}) =>
  blocks
    .flatMap((block) => {
      if (!block || !block.type) {
        return []
      }

      if (block.type === 'heading') {
        const text = normaliseText(block.text)
        if (!text) {
          return []
        }

        const level = [1, 2, 3].includes(Number(block.level)) ? Number(block.level) : 2
        return [`<h${level}>${escapeHtml(text)}</h${level}>`]
      }

      if (block.type === 'paragraph') {
        const html = sanitizeParagraphHtml(block.html)
        return html ? [`<p>${html}</p>`] : []
      }

      if (block.type !== 'image') {
        return []
      }

      const imageRefs = Array.isArray(block.imageRefs) ? block.imageRefs.map(normaliseRef) : []
      const selectedRefs = imageRefs.filter(Boolean)

      if (!selectedRefs.length) {
        return []
      }

      if (block.layout === 'caption') {
        const src = resolveImageSrc(selectedRefs[0], assets, options)
        const alt = resolveImageAlt(selectedRefs[0], assets)
        const figure = buildImageFigure(src, alt, block.caption)
        return figure ? [figure] : []
      }

      if (block.layout === 'pair') {
        if (selectedRefs.length < 2) {
          return []
        }

        const figures = selectedRefs
          .slice(0, 2)
          .map((imageRef) =>
            buildImageFigure(
              resolveImageSrc(imageRef, assets, options),
              resolveImageAlt(imageRef, assets),
            ),
          )
          .filter(Boolean)

        return figures.length === 2
          ? [`<div class="post-block-row post-block-row--pair">${figures.join('')}</div>`]
          : []
      }

      if (block.layout === 'gallery') {
        if (selectedRefs.length < 2) {
          return []
        }

        const galleryCount = normaliseGalleryCount(imageRefs.length)
        const figures = selectedRefs
          .slice(0, MAX_GALLERY_BLOCK_IMAGES)
          .map((imageRef) =>
            buildImageFigure(
              resolveImageSrc(imageRef, assets, options),
              resolveImageAlt(imageRef, assets),
            ),
          )
          .filter(Boolean)

        return figures.length >= 2
          ? [
              `<div class="post-block-row post-block-row--gallery ${getGalleryCountClass(galleryCount)}">${figures.join('')}</div>`,
            ]
          : []
      }

      const src = resolveImageSrc(selectedRefs[0], assets, options)
      const alt = resolveImageAlt(selectedRefs[0], assets)
      const figure = buildImageFigure(src, alt)
      return figure ? [figure] : []
    })
    .join('\n')

export const parsePostHtmlToBlocks = (html = '', assets = []) => {
  if (!html?.trim()) {
    return []
  }

  if (typeof document === 'undefined') {
    const paragraphBlock = createParagraphFromText(html)
    return paragraphBlock ? [paragraphBlock] : []
  }

  const root = document.createElement('div')
  root.innerHTML = html

  const blocks = []

  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const paragraphBlock = createParagraphFromText(node.textContent || '')
      if (paragraphBlock) {
        blocks.push(paragraphBlock)
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const tagName = node.tagName.toLowerCase()

    if (['h1', 'h2', 'h3'].includes(tagName)) {
      blocks.push(createHeadingBlock(Number(tagName.slice(1)), node.textContent || ''))
      return
    }

    if (tagName === 'p') {
      const paragraphHtml = sanitizeParagraphHtml(node.innerHTML)
      if (paragraphHtml || normaliseText(node.textContent || '')) {
        blocks.push(createParagraphBlock(paragraphHtml))
      }
      return
    }

    if (tagName === 'figure') {
      const image = node.querySelector('img')
      if (!image) {
        return
      }

      const imageRef = parseImageRefs([image], assets)[0]
      if (!imageRef) {
        return
      }

      const caption = node.querySelector('figcaption')?.textContent?.trim() || ''
      blocks.push({
        id: createBlockId(),
        type: 'image',
        layout: caption ? 'caption' : 'full',
        imageRefs: [imageRef],
        caption,
      })
      return
    }

    if (tagName === 'div' && node.classList.contains('post-block-row--pair')) {
      const imageRefs = parseImageRefs(Array.from(node.querySelectorAll('img')).slice(0, 2), assets)
      if (imageRefs.length === 2) {
        blocks.push({
          id: createBlockId(),
          type: 'image',
          layout: 'pair',
          imageRefs,
          caption: '',
        })
      }
      return
    }

    if (tagName === 'div' && node.classList.contains('post-block-row--gallery')) {
      const imageRefs = parseImageRefs(
        Array.from(node.querySelectorAll('img')).slice(0, MAX_GALLERY_BLOCK_IMAGES),
        assets,
      )
      if (imageRefs.length >= 2) {
        const galleryCount = getGalleryCountFromClassList(node.classList, imageRefs.length)
        blocks.push({
          id: createBlockId(),
          type: 'image',
          layout: 'gallery',
          imageRefs: Array.from({ length: galleryCount }, (_, index) => imageRefs[index] || ''),
          caption: '',
        })
      }
      return
    }

    if (tagName === 'img') {
      const imageRef = parseImageRefs([node], assets)[0]
      if (!imageRef) {
        return
      }

      blocks.push({
        id: createBlockId(),
        type: 'image',
        layout: 'full',
        imageRefs: [imageRef],
        caption: '',
      })
      return
    }

    const fallbackBlock = createParagraphFromText(node.textContent || '')
    if (fallbackBlock) {
      blocks.push(fallbackBlock)
    }
  })

  return blocks
}

export const removeAssetFromBlocks = (blocks = [], assetId = '') =>
  blocks.map((block) => {
    if (block?.type !== 'image') {
      return block
    }

    return {
      ...block,
      imageRefs: (block.imageRefs || []).map((imageRef) =>
        normaliseRef(imageRef) === normaliseRef(assetId) ? '' : imageRef,
      ),
    }
  })

export const resizeGalleryBlock = (block, nextCount) => {
  const count = normaliseGalleryCount(nextCount)
  const imageRefs = Array.isArray(block?.imageRefs) ? [...block.imageRefs] : []

  return {
    ...block,
    imageRefs: Array.from({ length: count }, (_, index) => imageRefs[index] || ''),
  }
}

export const getAssetPreviewSrc = (imageRef = '', assets = []) =>
  resolveAssetByRef(imageRef, assets)?.src || normaliseRef(imageRef)
