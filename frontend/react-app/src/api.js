import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

export function setAuthToken(token){
  if(token){
    localStorage.setItem('jwt', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('jwt')
    delete api.defaults.headers.common.Authorization
  }
}

// initialize from storage if present
const existing = localStorage.getItem('jwt')
if(existing){
  api.defaults.headers.common.Authorization = `Bearer ${existing}`
}

export default api
