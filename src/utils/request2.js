import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { isExpired } from '@/utils/auth'

// create an axios instance
const service2 = axios.create({
  baseURL: process.env.VUE_APP_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

// request interceptor
service2.interceptors.request.use(
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
    console.log('request2 request err: ' + JSON.stringify(error)) // for debug
    if (error.code === '307') {
      toLogin()
    } else {
      return Promise.reject(error)
    }
  }
)

// response interceptor
service2.interceptors.response.use(
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
    const res = response.data

    // if the custom code is not 000, it is judged as an error.
    if (res.success || res.code === 20000) {
      return res
    } else {
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === '304' || res.code === '307') {
        toLogin()
      } else if (res.code && res.code !== 50000) {
        Message({
          message: res.message || `Unknown Error: ${res.code}`,
          type: 'error',
          duration: 5 * 1000
        })
        // return Promise.reject(res)
      }
      return res
    }
  },
  error => {
    // console.log('request2 response err: ' + JSON.stringify(error)) // for debug
    if (error.code === 'ECONNABORTED') {
      Message({
        message: '请求超时，请重试...',
        type: 'error',
        duration: 5 * 1000
      })
    } else if (error.code === '307' || (error.data && error.data.code === '307')) {
      toLogin()
    } else if (error.message) {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)
let isOpen = false
function toLogin() {
  if (!isOpen) {
    // to re-login
    isOpen = true
    MessageBox.confirm('登录已失效, 取消停留在当前页面， 或重新登录', '登录过期', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.dispatch('user/removeToken').then(() => {
        router.push('/login')
      })
    }).finally(() => { isOpen = false })
  }
}

export default service2
