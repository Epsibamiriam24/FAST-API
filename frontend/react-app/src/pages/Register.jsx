import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import api, {setAuthToken} from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Register(){
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const submit = async () => {
    setError('')
    try{
      const r = await api.post('/api/auth/register',{ username, password })
      const { token } = r.data
      setAuthToken(token)
      try{
        const me = await api.get('/api/me')
        setUser(me.data)
      }catch(_){ }
      navigate('/')
    }catch(e){
      setError(e.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel auth-panel-accent">
        <p className="section-label">Join the system</p>
        <h2>Create an account for book management.</h2>
        <p className="muted">Register once and use the app to explore, add, and organize titles.</p>
      </section>
      <form className="auth-card" onSubmit={e=>{e.preventDefault(); submit()}}>
        <h3>Register</h3>
        <label>Username</label>
        <input className="text-input" value={username} onChange={e=>setUsername(e.target.value)} />
        <label>Password</label>
        <input className="text-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary" type="submit">Register</button>
        {error && <p className="error-banner">{error}</p>}
      </form>
    </div>
  )
}
