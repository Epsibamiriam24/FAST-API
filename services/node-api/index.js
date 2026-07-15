const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const { pool } = require('./db')

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      available TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM books')
  if (rows[0].total === 0) {
    const seedBooks = [
      ['Python Programming', 'John Smith'],
      ['Java Fundamentals', 'David Lee'],
      ['Clean Code', 'Robert C. Martin'],
      ['The Pragmatic Programmer', 'Andrew Hunt'],
      ['JavaScript: The Good Parts', 'Douglas Crockford'],
      ['Designing Data-Intensive Applications', 'Martin Kleppmann'],
      ['Refactoring', 'Martin Fowler'],
      ['Introduction to Algorithms', 'Thomas H. Cormen']
    ]

    for (const [title, author] of seedBooks) {
      await pool.query('INSERT INTO books (title, author, available) VALUES (?, ?, 1)', [title, author])
    }
  }
}

function toBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    available: !!row.available,
  }
}

app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, author, available FROM books ORDER BY id DESC')
    res.json(rows.map(toBook))
  } catch (err) {
    console.error('/api/books error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Create book
app.post('/api/books', authMiddleware, async (req, res) => {
  const { title, author } = req.body || {}
  if (!title || !author) return res.status(400).json({ error: 'title and author required' })
  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, available) VALUES (?, ?, 1)',
      [title.trim(), author.trim()]
    )
    const [rows] = await pool.query('SELECT id, title, author, available FROM books WHERE id = ? LIMIT 1', [result.insertId])
    res.status(201).json(toBook(rows[0]))
  } catch (err) {
    console.error('create book error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Update book
app.put('/api/books/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id,10)
  const { title, author, available } = req.body || {}
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid book id' })
  try {
    const [existing] = await pool.query('SELECT id FROM books WHERE id = ? LIMIT 1', [id])
    if (!existing.length) return res.status(404).json({ error: 'book not found' })

    const fields = []
    const values = []

    if (title !== undefined) {
      fields.push('title = ?')
      values.push(title.trim())
    }
    if (author !== undefined) {
      fields.push('author = ?')
      values.push(author.trim())
    }
    if (available !== undefined) {
      fields.push('available = ?')
      values.push(available ? 1 : 0)
    }

    if (!fields.length) return res.status(400).json({ error: 'no fields to update' })

    values.push(id)
    await pool.query(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values)
    const [rows] = await pool.query('SELECT id, title, author, available FROM books WHERE id = ? LIMIT 1', [id])
    res.json(toBook(rows[0]))
  } catch (err) {
    console.error('update book error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Delete book
app.delete('/api/books/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id,10)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid book id' })
  try {
    const [existing] = await pool.query('SELECT id, title, author, available FROM books WHERE id = ? LIMIT 1', [id])
    if (!existing.length) return res.status(404).json({ error: 'book not found' })
    await pool.query('DELETE FROM books WHERE id = ?', [id])
    res.json(toBook(existing[0]))
  } catch (err) {
    console.error('delete book error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Register - persist user to MySQL and return JWT
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })
  try{
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username])
    if (rows.length) return res.status(409).json({ error: 'username taken' })

    const passwordHash = bcrypt.hashSync(password, 8)
    const [result] = await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash])
    const userId = result.insertId
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: userId, username } })
  }catch(err){
    console.error('register error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Login - verify credentials against MySQL users table
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })
  try{
    const [rows] = await pool.query('SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1', [username])
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' })
    const user = rows[0]
    const ok = bcrypt.compareSync(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, username: user.username } })
  }catch(err){
    console.error('login error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const match = authHeader.match(/^Bearer (.+)$/)
  if (!match) return res.status(401).json({ error: 'missing token' })
  const token = match[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

app.get('/api/me', authMiddleware, async (req, res) => {
  try{
    const [rows] = await pool.query('SELECT id, username FROM users WHERE id = ? LIMIT 1', [req.user.id])
    if (!rows.length) return res.status(404).json({ error: 'user not found' })
    const user = rows[0]
    res.json({ id: user.id, username: user.username })
  }catch(err){
    console.error('/api/me error', err)
    res.status(500).json({ error: 'internal error' })
  }
})

// Dev-only: list users for debugging (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/users', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, username, created_at FROM users ORDER BY id')
      res.json(rows)
    } catch (err) {
      console.error('/api/debug/users error', err)
      res.status(500).json({ error: 'internal error' })
    }
  })
}

const port = process.env.PORT || 5000
initDatabase()
  .then(() => {
    app.listen(port, () => console.log('Node API listening on', port))
  })
  .catch(err => {
    console.error('database init error', err)
    process.exit(1)
  })
