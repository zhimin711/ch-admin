import axios from 'axios'
import store from '@/store'
import { isExpired } from '@/utils/auth'

// create an axios instance
const instance = axios.create({
  baseURL: process.env.VUE_APP_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000 // request timeout
})

export async function refreshToken() {
  if (!isExpired()) return true
  const resp = await instance.get(`/auth/login/token/refresh?token=${store.getters.token}&refreshToken=${store.getters.refreshToken}`)
  const { data } = resp
  if (data.success) {
    store.dispatch('user/refreshToken', data.rows[0])
  }
  // return Promise.reject({ 'code': '307', success: false })
  return data.success
}
// export default instance
