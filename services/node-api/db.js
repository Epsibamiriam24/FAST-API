const mysql = require('mysql2/promise')

const DB_HOST = process.env.DB_HOST || '127.0.0.1'
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT,10) : 3306
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || ''
const DB_NAME = process.env.DB_NAME || 'library_db'

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

module.exports = { pool }
