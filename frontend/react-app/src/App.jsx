import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Books from './pages/Books'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'

function Nav(){
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const token = localStorage.getItem('jwt')
  const doLogout = () => { logout(); navigate('/') }
  return (
    <nav className="nav">
      <div className="nav-links">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/books">Books</Link>
      </div>
      {token ? (
        <div className="nav-auth">
          <span className="nav-user">{user?.username || 'Signed in'}</span>
          <button className="btn btn-secondary" onClick={doLogout}>Logout</button>
        </div>
      ) : (
        <div className="nav-auth">
          <Link className="btn btn-secondary" to="/login">Login</Link>
          <Link className="btn btn-primary" to="/register">Register</Link>
        </div>
      )}
    </nav>
  )
}

export default function App(){
  return (
    <AuthProvider>
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Library Management System</p>
          <h1 className="app-title">BookFlow</h1>
        </div>
        <Nav />
      </header>
      <main className="app-main">
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/books' element={<ProtectedRoute><Books/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
    </AuthProvider>
  )
}
