import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Home(){
  const [books, setBooks] = useState([])

  useEffect(() => {
    api.get('/api/books')
      .then(r => setBooks(r.data))
      .catch(() => setBooks([]))
  }, [])

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="section-label">Digital library dashboard</p>
          <h2>Discover, manage, and grow your book collection.</h2>
          <p>Browse featured titles, manage the catalog, and keep your library organized in one clean interface.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/books">Browse Books</a>
            <a className="btn btn-ghost" href="/register">Create Account</a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="stat-card">
            <strong>{books.length}</strong>
            <span>Featured titles loaded</span>
          </div>
          <div className="stat-card stat-card-accent">
            <strong>Live API</strong>
            <span>Data comes from the backend</span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="section-label">Featured books</p>
            <h3>Popular titles already available in the catalog</h3>
          </div>
          <a className="text-link" href="/books">View all</a>
        </div>
        <div className="book-grid">
          {books.slice(0, 6).map(book => (
            <article className="book-card" key={book.id}>
              <p className="book-tag">Available</p>
              <h4>{book.title}</h4>
              <p>{book.author}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
