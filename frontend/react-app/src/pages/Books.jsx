import React, {useEffect, useState} from 'react'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Books(){
  const [books,setBooks] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [title,setTitle] = useState('')
  const [author,setAuthor] = useState('')
  const [query,setQuery] = useState('')
  const [editingId,setEditingId] = useState(null)
  const [editTitle,setEditTitle] = useState('')
  const [editAuthor,setEditAuthor] = useState('')
  const { user } = useAuth()

  useEffect(()=>{
    const loadBooks = async () => {
      setLoading(true)
      setError('')
      try{
        const r = await api.get('/api/books')
        setBooks(r.data)
      }catch(e){
        setError(e.response?.data?.error || e.message || 'Failed to load books')
      }finally{
        setLoading(false)
      }
    }

    loadBooks()
  },[])

  const createBook = async () => {
    const nextTitle = title.trim()
    const nextAuthor = author.trim()
    if(!nextTitle || !nextAuthor) {
      setError('Title and author are required')
      return
    }
    try{
      setError('')
      const r = await api.post('/api/books',{ title: nextTitle, author: nextAuthor })
      setBooks(prev=>[...prev, r.data])
      setTitle('')
      setAuthor('')
    }catch(e){ alert('Create failed: '+(e.response?.data?.error||e.message)) }
  }

  const deleteBook = async (id) => {
    if(!confirm('Delete book?')) return
    try{
      await api.delete(`/api/books/${id}`)
      setBooks(prev=>prev.filter(b=>b.id!==id))
    }catch(e){ alert('Delete failed') }
  }

  const beginEdit = (book) => {
    setEditingId(book.id)
    setEditTitle(book.title)
    setEditAuthor(book.author)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditAuthor('')
  }

  const saveEdit = async (id) => {
    const nextTitle = editTitle.trim()
    const nextAuthor = editAuthor.trim()
    if(!nextTitle || !nextAuthor) {
      setError('Title and author are required')
      return
    }

    try{
      setError('')
      const r = await api.put(`/api/books/${id}`, { title: nextTitle, author: nextAuthor })
      setBooks(prev => prev.map(book => (book.id === id ? r.data : book)))
      cancelEdit()
    }catch(e){
      alert('Update failed: ' + (e.response?.data?.error || e.message))
    }
  }

  return (
    <div className="page-stack">
      <section className="section-heading">
        <div>
          <p className="section-label">Catalog</p>
          <h2>Browse and manage books</h2>
        </div>
        <div className="search-wrap">
          <input
            className="search-input"
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search by title or author"
          />
        </div>
      </section>
      {loading && <p className="muted">Loading books...</p>}
      {error && <p className="error-banner">{error}</p>}
      <div className="book-grid">
        {books
          .filter(b => {
            const needle = query.toLowerCase().trim()
            if(!needle) return true
            return `${b.title} ${b.author}`.toLowerCase().includes(needle)
          })
          .map(b=> (
          <article className="book-card book-card-large" key={b.id}>
            <p className="book-tag">{b.available ? 'Available' : 'Borrowed'}</p>
            {editingId === b.id ? (
              <div className="form-grid">
                <input className="text-input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
                <input className="text-input" value={editAuthor} onChange={e=>setEditAuthor(e.target.value)} />
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={()=>saveEdit(b.id)}>Save</button>
                  <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{b.title}</h3>
                <p>{b.author}</p>
                {user && (
                  <div className="card-actions">
                    <button className="btn btn-secondary" onClick={()=>beginEdit(b)}>Edit</button>
                    <button className="btn btn-danger" onClick={()=>deleteBook(b.id)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </article>
        ))}
      </div>
      {user && (
        <div className="form-card">
          <div>
            <p className="section-label">Add new title</p>
            <h3>Extend the library</h3>
          </div>
          <div className="form-grid">
            <input
              className="text-input"
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="Book title"
            />
            <input
              className="text-input"
              value={author}
              onChange={e=>setAuthor(e.target.value)}
              placeholder="Author"
            />
            <button className="btn btn-primary" onClick={createBook}>Add Book</button>
          </div>
        </div>
      )}
    </div>
  )
}
