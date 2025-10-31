import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // đổi tùy backend bạn
  headers: {
    'Content-Type': 'application/json',
  },
})

// interceptor thêm JWT token vào header khi có
api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
