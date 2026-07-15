import React, { createContext, useContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if(token){
      api.get('/api/me')
        .then(res => setUser(res.data))
        .catch(() => { setAuthToken(null); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const logout = () => { setAuthToken(null); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
