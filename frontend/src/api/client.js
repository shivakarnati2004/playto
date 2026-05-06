import axios from 'axios'

// Determine API base URL:
// 1. Build-time env var (VITE_API_BASE) takes priority
// 2. In production (Render), use the backend service URL
// 3. Locally, use relative path (Vite proxy handles it)
function getBaseURL() {
  // Build-time env var from Render
  if (import.meta.env.VITE_API_BASE) {
    return `${import.meta.env.VITE_API_BASE.replace(/\/+$/, '')}/api/v1`
  }
  // Production detection: if not on localhost, use the Render backend URL
  const host = window.location.hostname
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return 'https://playto-kyc.onrender.com/api/v1'
  }
  // Local development: Vite proxy forwards /api to localhost:8000
  return '/api/v1'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
