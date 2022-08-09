import request from '@/utils/request3'
import request2 from '@/utils/request2'

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
  return request2({
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
