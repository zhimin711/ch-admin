import axios from 'axios'

const serviceAuth = axios.create({
  baseURL: process.env.VUE_APP_AUTH_API,
  timeout: 40000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=UTF-8'
  }
})
serviceAuth.interceptors.request.use(
  config => {
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// response interceptor
serviceAuth.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    console.log(error)
  }
)
export default serviceAuth
