import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
})

api.interceptors.request.use(function(config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

api.interceptors.response.use(
  function(res) {
    return res
  },
  function(err) {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    var msg = 'Something went wrong'
    if (err.response && err.response.data && err.response.data.detail) {
      msg = err.response.data.detail
    } else if (err.message) {
      msg = err.message
    }
    return Promise.reject(msg)
  }
)

export default api