import axios from 'axios'
import store from '@/store'
import { isExpired } from '@/utils/auth'

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
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = store.getters.token
      if (isExpired()) {
        await axios.get(process.env.VUE_APP_API + '/auth/login/token/refresh?token=' + store.getters.token + '&refreshToken=' + store.getters.refreshToken)
          .then(resp => {
            if (resp.data.success) {
              store.dispatch('user/refreshToken', resp.data.rows[0])
              config.headers['X-Token'] = resp.data.rows[0].token
            } else {
              return Promise.reject(resp)
            }
          })
      }
      // if (config.url === '/upms/user/1/10') return Promise.reject({ 'code': '307', success: false })
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
    return Promise.reject(error.data || error.response)
  }
)

export default service3
