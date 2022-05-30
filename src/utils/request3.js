import axios from 'axios'
import { refreshToken } from '@/utils/request-token'
import { getRefreshToken, getToken } from '@/utils/auth'

// create an axios instance
const service3 = axios.create({
  baseURL: process.env.VUE_APP_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

// request interceptor
service3.interceptors.request.use(
  async config => {
    // do something before request is sent
    if (getRefreshToken()) {
      if (!await refreshToken()) {
        return Promise.reject({ success: false, code: '307' })
      }
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    // console.log(error) // for debug
    // console.log('request3 request err: ' + JSON.stringify(error)) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service3.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    return response.data
  },
  error => {
    console.log('request3 response err: ' + JSON.stringify(error)) // for debug
    if (error.code) return Promise.reject(error)
    return Promise.reject(error.data || error.response)
  }
)

export default service3
