import {
  homePageContent,
  repairsPageContent,
  galleryPageContent,
  getServicePage,
} from './content.js'
import { siteProfile } from './siteProfile.js'
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  buildCanonicalPostPath,
  getImageMimeType,
  getPostOgImage,
  getPostSeoDescription,
  getPostSeoTitle,
  toAbsoluteUrl,
} from './utils.js'

export function getClientCspNonce() {
  if (typeof document === 'undefined') {
    return ''
  }

  return document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content') || ''
}

function baseHead({
  title,
  description,
  path,
  image,
  robots = 'index, follow',
  schemas = [],
  type = 'website',
  nonce = '',
  extraMeta = [],
  imageAlt = '',
}) {
  const canonicalUrl = toAbsoluteUrl(path)
  const ogImage = image || toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)
  const defaultOgImage = toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)
  const ogImageType = getImageMimeType(ogImage)
  const usesDefaultOgImage = ogImage === defaultOgImage
  const resolvedNonce = nonce || getClientCspNonce()
  const resolvedImageAlt = imageAlt || `${siteProfile.businessName} social preview`

  return {
    title,
    meta: [
      { name: 'author', content: siteProfile.ownerName },
      { name: 'description', content: description },
      { name: 'robots', content: robots },
      siteProfile.facebookAppId
        ? { property: 'fb:app_id', content: siteProfile.facebookAppId }
        : null,
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteProfile.businessName },
      { property: 'og:locale', content: 'en_GB' },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:url', content: ogImage },
      { property: 'og:image:secure_url', content: ogImage },
      ogImageType ? { property: 'og:image:type', content: ogImageType } : null,
      usesDefaultOgImage
        ? { property: 'og:image:width', content: `${DEFAULT_OG_IMAGE_WIDTH}` }
        : null,
      usesDefaultOgImage
        ? { property: 'og:image:height', content: `${DEFAULT_OG_IMAGE_HEIGHT}` }
        : null,
      { property: 'og:image:alt', content: resolvedImageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:url', content: canonicalUrl },
      { name: 'twitter:image', content: ogImage },
      { name: 'twitter:image:alt', content: resolvedImageAlt },
      ...extraMeta,
    ].filter(Boolean),
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: schemas.filter(Boolean).map((schema) => ({
      type: 'application/ld+json',
      nonce: resolvedNonce,
      children: JSON.stringify(schema),
    })),
  }
}

function buildLocalBusinessSchema() {
  const schemaOpeningHours = siteProfile.openingHours.filter((entry) => /\d/.test(entry))
  const address = {
    '@type': 'PostalAddress',
    addressLocality: siteProfile.address.addressLocality,
    addressRegion: siteProfile.address.addressRegion,
    addressCountry: siteProfile.address.addressCountry,
  }

  if (siteProfile.address.streetAddress) {
    address.streetAddress = siteProfile.address.streetAddress
  }

  if (siteProfile.address.postalCode) {
    address.postalCode = siteProfile.address.postalCode
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteProfile.businessName,
    description: siteProfile.serviceLabel,
    url: siteProfile.siteOrigin,
    image: toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH),
    email: siteProfile.email,
    telephone: siteProfile.phone || undefined,
    areaServed: siteProfile.serviceArea,
    address,
    openingHours: schemaOpeningHours.length ? schemaOpeningHours : undefined,
  }
}

function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}

function buildFaqSchema(faqs = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function buildServiceSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.title,
    description: page.metaDescription,
    areaServed: siteProfile.serviceArea,
    provider: {
      '@type': 'LocalBusiness',
      name: siteProfile.businessName,
      url: siteProfile.siteOrigin,
      email: siteProfile.email,
    },
    url: toAbsoluteUrl(page.path),
  }
}

export function buildHomeHead(options = {}) {
  return baseHead({
    title: homePageContent.metaTitle,
    description: homePageContent.metaDescription,
    path: homePageContent.path,
    nonce: options.nonce,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteProfile.businessName,
        url: siteProfile.siteOrigin,
      },
      buildLocalBusinessSchema(),
      buildBreadcrumbSchema([{ name: 'Home', path: '/' }]),
    ],
  })
}

export function buildRepairsHead(options = {}) {
  return baseHead({
    title: repairsPageContent.metaTitle,
    description: repairsPageContent.metaDescription,
    path: repairsPageContent.path,
    nonce: options.nonce,
    schemas: [
      buildLocalBusinessSchema(),
      buildServiceSchema(repairsPageContent),
      buildFaqSchema(repairsPageContent.faqs),
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Repairs', path: repairsPageContent.path },
      ]),
    ],
  })
}

export function buildGalleryHead(options = {}) {
  return baseHead({
    title: galleryPageContent.metaTitle,
    description: galleryPageContent.metaDescription,
    path: galleryPageContent.path,
    nonce: options.nonce,
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: galleryPageContent.title,
        description: galleryPageContent.metaDescription,
        url: toAbsoluteUrl(galleryPageContent.path),
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Workshop Gallery', path: galleryPageContent.path },
      ]),
    ],
  })
}

export function buildServiceHead(pageKey, options = {}) {
  const page = getServicePage(pageKey)

  if (!page) {
    return buildHomeHead(options)
  }

  return baseHead({
    title: page.metaTitle,
    description: page.metaDescription,
    path: page.path,
    nonce: options.nonce,
    schemas: [
      buildLocalBusinessSchema(),
      buildServiceSchema(page),
      buildFaqSchema(page.faqs),
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Repairs', path: '/repairs' },
        { name: page.title, path: page.path },
      ]),
    ],
  })
}

export function buildPostHead(post, options = {}) {
  const canonicalPath = buildCanonicalPostPath(post)
  const title = getPostSeoTitle(post)
  const description = getPostSeoDescription(post)
  const articleHeadline = post.postTitle || 'Workshop Story'
  const publishedTime = post.publishedAt || post.date || ''
  const modifiedTime = post.updatedAt || post.publishedAt || post.date || ''

  return baseHead({
    title,
    description,
    path: canonicalPath,
    image: getPostOgImage(post),
    imageAlt: post.postTitle || 'Watch repair image',
    type: 'article',
    nonce: options.nonce,
    extraMeta: [
      publishedTime ? { property: 'article:published_time', content: publishedTime } : null,
      modifiedTime ? { property: 'article:modified_time', content: modifiedTime } : null,
    ].filter(Boolean),
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: articleHeadline,
        description,
        image: getPostOgImage(post),
        author: {
          '@type': 'Person',
          name: siteProfile.ownerName,
        },
        publisher: {
          '@type': 'Organization',
          name: siteProfile.businessName,
          url: siteProfile.siteOrigin,
          logo: {
            '@type': 'ImageObject',
            url: toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH),
          },
        },
        mainEntityOfPage: toAbsoluteUrl(canonicalPath),
        datePublished: publishedTime,
        dateModified: modifiedTime,
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Workshop Gallery', path: '/my-work' },
        { name: post.postTitle || 'Workshop Story', path: canonicalPath },
      ]),
    ],
  })
}

export function buildNotFoundHead(options = {}) {
  return baseHead({
    title: 'Page Not Found | The Watchmaker',
    description:
      'The requested page could not be found. Return to the Watchmaker homepage or continue to the repairs page.',
    path: '/404',
    robots: 'noindex, follow',
    nonce: options.nonce,
    schemas: [],
  })
}
