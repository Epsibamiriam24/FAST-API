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

app.get('/api/books', (req, res) => {
  res.json(books)
})

// In-memory books store
const books = [
  { id: 1, title: 'Python Programming', author: 'John Smith', available: true },
  { id: 2, title: 'Java Fundamentals', author: 'David Lee', available: true },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', available: true },
  { id: 4, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', available: true },
  { id: 5, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', available: true },
  { id: 6, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', available: true },
  { id: 7, title: 'Refactoring', author: 'Martin Fowler', available: true },
  { id: 8, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', available: true }
]

// Create book
app.post('/api/books', authMiddleware, (req, res) => {
  const { title, author } = req.body || {}
  if (!title || !author) return res.status(400).json({ error: 'title and author required' })
  const id = books.length ? Math.max(...books.map(b=>b.id)) + 1 : 1
  const book = { id, title, author, available: true }
  books.push(book)
  res.status(201).json(book)
})

// Update book
app.put('/api/books/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id,10)
  const book = books.find(b => b.id === id)
  if (!book) return res.status(404).json({ error: 'book not found' })
  const { title, author, available } = req.body || {}
  if (title !== undefined) book.title = title
  if (author !== undefined) book.author = author
  if (available !== undefined) book.available = !!available
  res.json(book)
})

// Delete book
app.delete('/api/books/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id,10)
  const idx = books.findIndex(b => b.id === id)
  if (idx === -1) return res.status(404).json({ error: 'book not found' })
  const [deleted] = books.splice(idx,1)
  res.json(deleted)
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
app.listen(port, () => console.log('Node API listening on', port))
