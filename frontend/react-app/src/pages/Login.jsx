import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import api, {setAuthToken} from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Login(){
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const submit = async () => {
    setError('')
    try{
      const r = await api.post('/api/auth/login',{ username, password })
      const { token } = r.data
      setAuthToken(token)
      // fetch current user and update context
      try{
        const me = await api.get('/api/me')
        setUser(me.data)
      }catch(_){ }
      navigate('/')
    }catch(e){
      setError(e.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <p className="section-label">Welcome back</p>
        <h2>Sign in to manage your library.</h2>
        <p className="muted">Access your catalog, add new books, and manage users with a secure account.</p>
      </section>
      <form className="auth-card" onSubmit={e=>{e.preventDefault(); submit()}}>
        <h3>Login</h3>
        <label>Username</label>
        <input className="text-input" value={username} onChange={e=>setUsername(e.target.value)} />
        <label>Password</label>
        <input className="text-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary" type="submit">Login</button>
        {error && <p className="error-banner">{error}</p>}
      </form>
    </div>
  )
}
