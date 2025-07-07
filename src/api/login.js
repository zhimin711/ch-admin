import request from '@/utils/request3'
import authRequest from '@/utils/request2'

// const namespace = '/vue-element-admin'
const namespace = '/auth'

export function login(data) {
  return request({
    url: `${namespace}/login/access`,
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

export async function genAuthCode(url) {
  return request({
    url: `${namespace}/user/auth-code`,
    method: 'get',
    params: { url }
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
