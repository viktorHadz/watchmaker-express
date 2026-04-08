import fs from 'node:fs'
import { distIndexPath } from './paths.js'
import { getAllPostsForSeo, getPostById } from './services/postRepository.js'
import {
  galleryPageContent,
  getServicePage,
  getServicePageLinks,
  homePageContent,
  repairsPageContent,
  servicePageKeys,
  servicePages,
} from '../watchmaker/src/seo/content.js'
import {
  buildGalleryHead,
  buildHomeHead,
  buildNotFoundHead,
  buildPostHead,
  buildRepairsHead,
  buildServiceHead,
} from '../watchmaker/src/seo/head.js'
import { siteProfile } from '../watchmaker/src/seo/siteProfile.js'
import {
  formatDisplayDate,
  getPostSeoDescription,
  stripHtml,
  toAbsoluteUrl,
  truncateText,
} from '../watchmaker/src/seo/utils.js'

const STATIC_PAGE_LASTMOD = new Date().toISOString()

function escapeHtml(value = '') {
  return `${value}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ')
}

function renderMetaTags(meta = []) {
  return meta
    .map((tag) => `<meta ${renderAttributes(tag)} />`)
    .join('\n    ')
}

function renderLinkTags(links = []) {
  return links
    .map((tag) => `<link ${renderAttributes(tag)} />`)
    .join('\n    ')
}

function renderScriptTags(scripts = [], nonce = '') {
  return scripts
    .map((script) => {
      const { children = '', nonce: existingNonce, ...attributes } = script
      const safeJson = `${children}`.replace(/<\/script/gi, '<\\/script')
      return `<script ${renderAttributes({
        ...attributes,
        nonce: existingNonce || nonce,
      })}>${safeJson}</script>`
    })
    .join('\n    ')
}

function renderHeadMarkup(head, nonce = '') {
  const parts = [
    head?.title ? `<title>${escapeHtml(head.title)}</title>` : '',
    renderMetaTags(head?.meta),
    renderLinkTags(head?.link),
    renderScriptTags(head?.script, nonce),
  ].filter(Boolean)

  return parts.join('\n    ')
}

function getTemplate() {
  return fs.readFileSync(distIndexPath, 'utf8')
}

function applyTemplate({ head, snapshotHtml, nonce }) {
  let template = getTemplate()
  const renderedHead = renderHeadMarkup(head, nonce)

  template = template.includes('<!-- SEO_HEAD -->')
    ? template.replace('<!-- SEO_HEAD -->', renderedHead)
    : template.replace('</head>', `    ${renderedHead}\n  </head>`)

  template = template.includes('__CSP_NONCE__')
    ? template.replace(/__CSP_NONCE__/g, nonce)
    : template.replace(
      '</head>',
      `    <meta name="csp-nonce" content="${escapeHtml(nonce)}" />\n  </head>`,
    )

  return template.includes('<!-- SEO_APP_HTML -->')
    ? template.replace('<!-- SEO_APP_HTML -->', snapshotHtml)
    : template.replace('<div id="app"></div>', `<div id="app">${snapshotHtml}</div>`)
}

function renderHighlights(items = []) {
  if (!items.length) {
    return ''
  }

  const entries = items.map((item) =>
    typeof item === 'string'
      ? { title: item, body: '' }
      : {
          title: item.title || '',
          body: item.body || '',
        },
  )

  return `
    <section aria-label="Workshop highlights">
      <ul>
        ${entries
          .map(
            (item) => `
              <li>
                ${item.title ? `<strong>${escapeHtml(item.title)}</strong>` : ''}
                ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}
              </li>
            `,
          )
          .join('')}
      </ul>
    </section>
  `
}

function renderSections(sections = []) {
  if (!sections.length) {
    return ''
  }

  return `
    <section aria-label="Page details">
      ${sections
      .map(
        (section) => `
            <article>
              <h2>${escapeHtml(section.heading)}</h2>
              <p>${escapeHtml(section.body)}</p>
            </article>
          `,
      )
      .join('')}
    </section>
  `
}

function renderFaqs(items = []) {
  if (!items.length) {
    return ''
  }

  return `
    <section aria-label="Frequently asked questions">
      <h2>Frequently Asked Questions</h2>
      ${items
      .map(
        (item) => `
            <article>
              <h3>${escapeHtml(item.question)}</h3>
              <p>${escapeHtml(item.answer)}</p>
            </article>
          `,
      )
      .join('')}
    </section>
  `
}

function renderServiceLinks(title, links = []) {
  if (!links.length) {
    return ''
  }

  return `
    <nav aria-label="${escapeHtml(title)}">
      <h2>${escapeHtml(title)}</h2>
      <ul>
        ${links
      .map(
        (item) => `
              <li>
                <a href="${escapeHtml(item.path)}">${escapeHtml(item.label)}</a>
                <p>${escapeHtml(item.description)}</p>
              </li>
            `,
      )
      .join('')}
      </ul>
    </nav>
  `
}

function renderContactBlock() {
  const details = [
    siteProfile.email
      ? `<p>Email: <a href="mailto:${escapeHtml(siteProfile.email)}">${escapeHtml(siteProfile.email)}</a></p>`
      : '',
    siteProfile.phone
      ? `<p>Phone: <a href="tel:${escapeHtml(siteProfile.phone.replace(/\s+/g, ''))}">${escapeHtml(siteProfile.phone)}</a></p>`
      : '',
    siteProfile.address.mapUrl
      ? `<p>Workshop: <a href="${escapeHtml(siteProfile.address.mapUrl)}">${escapeHtml(siteProfile.address.publicLabel)}</a></p>`
      : `<p>Workshop: ${escapeHtml(siteProfile.address.publicLabel)}</p>`,
    `<p>Hours: ${escapeHtml(siteProfile.openingHours.join(' · '))}</p>`,
    `<p>Coverage: ${escapeHtml(siteProfile.serviceLabel)}</p>`,
  ].filter(Boolean)

  return `
    <section aria-label="Contact and service area">
      <h2>Contact And Service Area</h2>
      <p>${escapeHtml(siteProfile.estimates)}. ${escapeHtml(siteProfile.warranty)}. ${escapeHtml(siteProfile.postalService)}</p>
      ${details.join('')}
    </section>
  `
}

function buildShareUrls(post) {
  const canonicalUrl = `${siteProfile.siteOrigin}${post.canonicalPath || ''}`
  const shareTitle = post.postTitle || 'Recent work from The Watchmaker'
  const shareDescription = truncateText(
    getPostSeoDescription(post) || stripHtml(post.postBody || ''),
    100,
  )

  return [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}&quote=${encodeURIComponent(shareTitle)}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(`${shareTitle} #WatchRepair #VintageWatches #TheWatchmaker`)}`,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`Take a look at this recent repair from The Watchmaker: "${shareTitle}" ${canonicalUrl}`)}`,
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(`The Watchmaker: ${shareTitle}`)}&body=${encodeURIComponent(`Hi!\n\nI wanted to share this recent repair story with you:\n\n"${shareTitle}"\n\n${shareDescription}\n\nTake a look here:\n\n${canonicalUrl}`)}`,
    },
  ]
}

function renderShareLinks(post) {
  return `
    <section aria-label="Share this repair story">
      <h2>Share This Repair Story</h2>
      <p>If this piece is useful, you can send it directly to someone else.</p>
      <p>${buildShareUrls(post)
        .map(
          (link) =>
            `<a href="${escapeHtml(link.href)}" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`,
        )
        .join(' · ')}</p>
    </section>
  `
}

function renderStoryList(posts = [], title = 'Recent Workshop Stories', limit = 4) {
  const entries = posts.slice(0, limit)

  if (!entries.length) {
    return ''
  }

  return `
    <section aria-label="${escapeHtml(title)}">
      <h2>${escapeHtml(title)}</h2>
      ${entries
      .map((post) => {
        const displayDate = formatDisplayDate(post.publishedAt || post.updatedAt || '') || post.date || ''
          const excerpt = truncateText(
            getPostSeoDescription(post) || stripHtml(post.postBody || ''),
            180,
          )

        return `
            <article>
              <h3><a href="${escapeHtml(post.canonicalPath)}">${escapeHtml(post.postTitle)}</a></h3>
              ${displayDate ? `<p>${escapeHtml(displayDate)}</p>` : ''}
              <p>${escapeHtml(excerpt)}</p>
            </article>
          `
      })
      .join('')}
    </section>
  `
}

function renderHomeSnapshot(posts = []) {
  return `
    <main data-seo-static="true">
      <header>
        <p>${escapeHtml(homePageContent.eyebrow)}</p>
        <h1>${escapeHtml(homePageContent.title)}</h1>
        <p>${escapeHtml(homePageContent.intro)}</p>
        <p><a href="/repairs">Start Repair Enquiry</a> <a href="/my-work">See Recent Work</a></p>
      </header>
      ${renderHighlights(homePageContent.highlights)}
      ${renderSections(homePageContent.sections)}
      ${renderServiceLinks('Specialist Services', getServicePageLinks())}
      ${renderStoryList(posts, 'Recent Workshop Stories')}
      ${renderContactBlock()}
    </main>
  `
}

function renderRepairsSnapshot(posts = []) {
  return `
    <main data-seo-static="true">
      <header>
        <p>${escapeHtml(repairsPageContent.eyebrow)}</p>
        <h1>${escapeHtml(repairsPageContent.title)}</h1>
        <p>${escapeHtml(repairsPageContent.intro)}</p>
      </header>
      ${renderHighlights(siteProfile.trustHighlights)}
      ${renderSections(repairsPageContent.sections)}
      ${renderFaqs(repairsPageContent.faqs)}
      ${renderServiceLinks('Service Pages To Explore', getServicePageLinks())}
      ${renderStoryList(posts, 'Recent Workshop Stories', 3)}
      ${renderContactBlock()}
    </main>
  `
}

function renderGallerySnapshot(posts = []) {
  return `
    <main data-seo-static="true">
      <header>
        <p>${escapeHtml(galleryPageContent.eyebrow)}</p>
        <h1>${escapeHtml(galleryPageContent.title)}</h1>
        <p>${escapeHtml(galleryPageContent.intro)}</p>
      </header>
      <section aria-label="Workshop stories">
        ${posts
      .slice(0, 12)
      .map((post) => {
        const description = truncateText(
          getPostSeoDescription(post) || stripHtml(post.postBody || ''),
          190,
        )
        const displayDate = formatDisplayDate(post.publishedAt || post.updatedAt || '') || post.date || ''

        return `
              <article>
                <h2><a href="${escapeHtml(post.canonicalPath)}">${escapeHtml(post.postTitle)}</a></h2>
                ${displayDate ? `<p>${escapeHtml(displayDate)}</p>` : ''}
                <p>${escapeHtml(description)}</p>
              </article>
            `
      })
      .join('')}
      </section>
      ${renderServiceLinks('Explore More Services', getServicePageLinks())}
    </main>
  `
}

function renderServiceSnapshot(page, posts = []) {
  const relatedLinks = getServicePageLinks(servicePageKeys.filter((key) => key !== page.key))

  return `
    <main data-seo-static="true">
      <header>
        <p>${escapeHtml(page.title)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.hero)}</p>
        <p><a href="/repairs">Start Repair Enquiry</a> <a href="/my-work">See Recent Work</a></p>
      </header>
      ${renderHighlights(siteProfile.trustHighlights)}
      ${renderSections(page.sections)}
      ${renderFaqs(page.faqs)}
      ${renderStoryList(posts, 'Workshop Examples', 3)}
      ${renderServiceLinks('Related Services', relatedLinks)}
      ${renderContactBlock()}
    </main>
  `
}

function renderPostSnapshot(post) {
  const details = [
    post.brand ? `Brand: ${post.brand}` : '',
    post.model ? `Model: ${post.model}` : '',
    `Location: ${siteProfile.locationLabel}`,
  ].filter(Boolean)

  const displayDate = formatDisplayDate(post.publishedAt || post.updatedAt || '') || post.date || ''

  return `
    <main data-seo-static="true">
      <article>
        <p>Workshop Journal</p>
        <h1>${escapeHtml(post.postTitle || 'Workshop Article')}</h1>
        ${displayDate ? `<p>${escapeHtml(displayDate)}</p>` : ''}
        ${details.length ? `<p>${escapeHtml(details.join(' · '))}</p>` : ''}
        <p>${escapeHtml(getPostSeoDescription(post))}</p>
        <div>${post.postBody || ''}</div>
      </article>
      ${renderShareLinks(post)}
      ${renderServiceLinks('Related Services', getServicePageLinks())}
      ${renderContactBlock()}
    </main>
  `
}

function renderNotFoundSnapshot() {
  return `
    <main data-seo-static="true">
      <header>
        <h1>Page Not Found</h1>
        <p>The page you requested could not be found.</p>
        <p><a href="/">Return Home</a> <a href="/repairs">Go To Repairs</a></p>
      </header>
    </main>
  `
}

export function getCanonicalPost(postId) {
  const post = getPostById(postId)
  return post ? post.canonicalPath : ''
}

export function renderStaticSeoPage(pathname, nonce) {
  const posts = getAllPostsForSeo()
  const servicePage = Object.values(servicePages).find((page) => page.path === pathname)

  if (pathname === '/') {
    return applyTemplate({
      head: buildHomeHead({ nonce }),
      snapshotHtml: renderHomeSnapshot(posts),
      nonce,
    })
  }

  if (pathname === repairsPageContent.path) {
    return applyTemplate({
      head: buildRepairsHead({ nonce }),
      snapshotHtml: renderRepairsSnapshot(posts),
      nonce,
    })
  }

  if (pathname === galleryPageContent.path) {
    return applyTemplate({
      head: buildGalleryHead({ nonce }),
      snapshotHtml: renderGallerySnapshot(posts),
      nonce,
    })
  }

  if (servicePage) {
    return applyTemplate({
      head: buildServiceHead(servicePage.key, { nonce }),
      snapshotHtml: renderServiceSnapshot(servicePage, posts),
      nonce,
    })
  }

  return applyTemplate({
    head: buildNotFoundHead({ nonce }),
    snapshotHtml: renderNotFoundSnapshot(),
    nonce,
  })
}

export function renderAppShell(nonce) {
  return applyTemplate({
    head: {
      title: `${siteProfile.businessName} Admin`,
      meta: [{ name: 'robots', content: 'noindex, nofollow' }],
      link: [],
      script: [],
    },
    snapshotHtml: '',
    nonce,
  })
}

export function renderPostSeoPage(postId, nonce) {
  const post = getPostById(postId)

  if (!post) {
    return null
  }

  return {
    canonicalPath: post.canonicalPath,
    html: applyTemplate({
      head: buildPostHead(post, { nonce }),
      snapshotHtml: renderPostSnapshot(post),
      nonce,
    }),
  }
}

function renderUrlSet(entries = []) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
      .map(
        (entry) => `  <url>
    <loc>${escapeHtml(entry.loc)}</loc>
    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>
  </url>`,
      )
      .join('\n')}
</urlset>
`
}

export function renderPagesSitemap() {
  const entries = [
    homePageContent.path,
    repairsPageContent.path,
    galleryPageContent.path,
    ...Object.values(servicePages).map((page) => page.path),
  ].map((path) => ({
    loc: toAbsoluteUrl(path),
    lastmod: STATIC_PAGE_LASTMOD,
  }))

  return renderUrlSet(entries)
}

export function renderPostsSitemap() {
  const entries = getAllPostsForSeo().map((post) => ({
    loc: toAbsoluteUrl(post.canonicalPath),
    lastmod: post.updatedAt || post.publishedAt || STATIC_PAGE_LASTMOD,
  }))

  return renderUrlSet(entries)
}

export function renderSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeHtml(toAbsoluteUrl('/sitemap-pages.xml'))}</loc>
    <lastmod>${escapeHtml(STATIC_PAGE_LASTMOD)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${escapeHtml(toAbsoluteUrl('/sitemap-posts.xml'))}</loc>
    <lastmod>${escapeHtml(STATIC_PAGE_LASTMOD)}</lastmod>
  </sitemap>
</sitemapindex>
`
}

export function renderRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${toAbsoluteUrl('/sitemap.xml')}
`
}
