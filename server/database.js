import Database from 'better-sqlite3'
export const db = new Database('watchmaker-database.db', { verbose: console.log })

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
    post_title TEXT,
    post_body TEXT,
    date TEXT,
    post_type TEXT)`)
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
}
