import { Database } from 'bun:sqlite'

const DB_PATH = process.env.DB_PATH || './data/app.db'

import { mkdir } from 'node:fs/promises'
try { await mkdir('./data', { recursive: true }) } catch {}

const db = new Database(DB_PATH)
db.run('PRAGMA journal_mode=WAL')
db.run('PRAGMA foreign_keys=ON')

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

// Add columns if they don't exist (migration for existing DBs)
try { db.run('ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT \'\'') } catch {}
try { db.run('ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT \'\'') } catch {}

db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    domain TEXT NOT NULL,
    reason TEXT,
    tld TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, domain)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`)

export const users = {
  create(email: string, passwordHash: string) {
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    return stmt.run(email, passwordHash)
  },
  findByEmail(email: string) {
    return db.query('SELECT * FROM users WHERE email = ?').get(email) as {
      id: number; email: string; password_hash: string; nickname: string; avatar: string; created_at: string
    } | null
  },
  findById(id: number) {
    return db.query('SELECT id, email, nickname, avatar, created_at FROM users WHERE id = ?').get(id) as {
      id: number; email: string; nickname: string; avatar: string; created_at: string
    } | null
  },
  updateProfile(id: number, data: { nickname?: string; avatar?: string }) {
    if (data.nickname !== undefined) {
      db.run('UPDATE users SET nickname = ? WHERE id = ?', [data.nickname, id])
    }
    if (data.avatar !== undefined) {
      db.run('UPDATE users SET avatar = ? WHERE id = ?', [data.avatar, id])
    }
    return users.findById(id)
  },
}

export const favorites = {
  add(userId: number, domain: string, reason: string, tld: string) {
    const stmt = db.prepare('INSERT OR IGNORE INTO favorites (user_id, domain, reason, tld) VALUES (?, ?, ?, ?)')
    return stmt.run(userId, domain, reason, tld)
  },
  remove(userId: number, domain: string) {
    const stmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND domain = ?')
    return stmt.run(userId, domain)
  },
  listByUser(userId: number) {
    return db.query('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Array<{
      id: number; user_id: number; domain: string; reason: string; tld: string; created_at: string
    }>
  },
  countByUser(userId: number): number {
    const row = db.query('SELECT COUNT(*) as c FROM favorites WHERE user_id = ?').get(userId) as { c: number }
    return row.c
  },
  isFavorited(userId: number, domain: string): boolean {
    const row = db.query('SELECT 1 FROM favorites WHERE user_id = ? AND domain = ?').get(userId, domain)
    return !!row
  },
  getFavoritedDomains(userId: number): Set<string> {
    const rows = db.query('SELECT domain FROM favorites WHERE user_id = ?').all(userId) as Array<{ domain: string }>
    return new Set(rows.map(r => r.domain))
  },
}

export const news = {
  create(title: string, slug: string, content: string, summary: string) {
    const stmt = db.prepare('INSERT INTO news (title, slug, content, summary) VALUES (?, ?, ?, ?)')
    return stmt.run(title, slug, content, summary)
  },
  update(id: number, title: string, content: string, summary: string) {
    const stmt = db.prepare(`UPDATE news SET title = ?, content = ?, summary = ?, updated_at = datetime('now') WHERE id = ?`)
    return stmt.run(title, content, summary, id)
  },
  delete(id: number) {
    return db.run('DELETE FROM news WHERE id = ?', [id])
  },
  list(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit
    const items = db.query('SELECT id, title, slug, summary, created_at FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as Array<{
      id: number; title: string; slug: string; summary: string; created_at: string
    }>
    const total = db.query('SELECT COUNT(*) as count FROM news').get() as { count: number }
    return { items, total: total.count, page, limit }
  },
  findBySlug(slug: string) {
    return db.query('SELECT * FROM news WHERE slug = ?').get(slug) as {
      id: number; title: string; slug: string; content: string; summary: string; created_at: string; updated_at: string
    } | null
  },
}

export default db
