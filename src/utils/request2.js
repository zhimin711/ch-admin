import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { refreshToken } from '@/utils/request-token'

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
      if (!await refreshToken()) {
        return Promise.reject({ success: false, code: '307' })
      }
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = store.getters.token
      if (process.env.VUE_APP_MOCK_BASE === 'true') config.headers['X-AUTH-USER'] = store.getters.name
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
      // 200: Illegal token; 50012: Other clients logged in; 307: Token expired;
      if (res.code === '200' || res.code === '307') {
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
    } else if (error.code === '307' || error.code === '304' || (error.data && (error.data.code === '307' || error.data.code === '304'))) {
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

/**
 * 跳转登录：0 未登录 1登录过期
 * @param type
 */
export function toLogin(type, to) {
  type = type || 1
  if (!isOpen) {
    // to re-login
    isOpen = true
    if (type === 1) {
      MessageBox.confirm('登录已失效, 取消停留在当前页面， 或重新登录', '登录过期', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/removeToken').then(() => {
          router.push('/login')
        })
      }).finally(() => { isOpen = false })
    } else {
      // to re-login
      MessageBox.alert('登录已失效,请重新登录', '登录过期', {
        confirmButtonText: '重新登录',
        callback: () => {
          store.dispatch('user/removeToken').then(() => {
            if (to) { router.push(`/login?redirect=${to}`) } else { router.push('/login') }
          })
        }
      })
    }
  }
}

export default service2
