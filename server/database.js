import Database from 'better-sqlite3'
import { databasePath } from './paths.js'
import { buildPostSlug, parseLegacyDisplayDateToIso } from '../watchmaker/src/seo/utils.js'

export const db = new Database(databasePath, { verbose: console.log })

export function initializeDatabase() {
  // PRAGMAS
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('journal_size_limit = 67108864')
  db.pragma('mmap_size = 134217728')
  db.pragma('cache_size = 10000')
  db.pragma('busy_timeout = 5000')
  db.pragma('foreign_keys = ON')

  // SCHEMA
  const stmtPostsTable = db.prepare(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_title TEXT NOT NULL CHECK (post_title <> ''),
    post_body TEXT,
    date TEXT,
    post_type TEXT,
    slug TEXT,
    seo_title TEXT,
    seo_description TEXT,
    brand TEXT,
    model TEXT,
    service_type TEXT,
    issue_summary TEXT,
    location_focus TEXT,
    published_at TEXT,
    updated_at TEXT
  )`)
  stmtPostsTable.run()

  const stmtImagesTable = db.prepare(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    image_type TEXT NOT NULL,
    folder_url TEXT,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE)`)
  stmtImagesTable.run()

  // Add order_index column if it doesn't exist (for existing databases)
  const columns = db.prepare('PRAGMA table_info(images)').all()
  const hasOrderIndex = columns.some((col) => col.name === 'order_index')

  if (!hasOrderIndex) {
    console.log('Adding order_index column to images table...')
    db.prepare('ALTER TABLE images ADD COLUMN order_index INTEGER DEFAULT 0').run()
  }

  const postColumns = db.prepare('PRAGMA table_info(posts)').all()
  const requiredPostColumns = [
    ['slug', 'TEXT'],
    ['seo_title', 'TEXT'],
    ['seo_description', 'TEXT'],
    ['brand', 'TEXT'],
    ['model', 'TEXT'],
    ['service_type', 'TEXT'],
    ['issue_summary', 'TEXT'],
    ['location_focus', 'TEXT'],
    ['published_at', 'TEXT'],
    ['updated_at', 'TEXT'],
  ]

  requiredPostColumns.forEach(([name, type]) => {
    const exists = postColumns.some((column) => column.name === name)

    if (!exists) {
      console.log(`Adding ${name} column to posts table...`)
      db.prepare(`ALTER TABLE posts ADD COLUMN ${name} ${type}`).run()
    }
  })

  db.prepare('CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)').run()
  db.prepare('CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at)').run()

  const postsNeedingBackfill = db
    .prepare(
      `
        SELECT id, post_title, date, slug, published_at, updated_at
        FROM posts
        WHERE slug IS NULL OR slug = '' OR published_at IS NULL OR published_at = '' OR updated_at IS NULL OR updated_at = ''
      `,
    )
    .all()

  if (postsNeedingBackfill.length > 0) {
    const updatePostMeta = db.prepare(
      `
        UPDATE posts
        SET slug = ?, published_at = ?, updated_at = ?
        WHERE id = ?
      `,
    )

    const backfill = db.transaction((rows) => {
      rows.forEach((row) => {
        const slug = row.slug || buildPostSlug({ postTitle: row.post_title })
        const publishedAt =
          row.published_at || parseLegacyDisplayDateToIso(row.date) || new Date().toISOString()
        const updatedAt = row.updated_at || publishedAt
        updatePostMeta.run(slug, publishedAt, updatedAt, row.id)
      })
    })

    backfill(postsNeedingBackfill)
  }
}
