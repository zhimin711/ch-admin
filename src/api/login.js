import request from '@/utils/request3'
import authRequest from '@/utils/request2'

// const namespace = '/vue-element-admin'
const namespace = '/auth'

export function login(data) {
  return request({
    url: `${namespace}/login/token/access`,
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: `${namespace}/user/info`,
    method: 'get'
  })
}

export function getPermissions(data) {
  return authRequest({
    url: `${namespace}/user/permissions`,
    method: 'post',
    data
  })
}

export function logout(refreshToken) {
  return request({
    url: `${namespace}/logout/token`,
    method: 'post',
    data: { refreshToken: refreshToken }
  })
}

// 获取授权码
export function getAuthCode(url) {
  return authRequest({
    url: `${namespace}/login/access/code`,
    method: 'get',
    params: { url }
  })
}
