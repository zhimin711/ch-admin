import request from '@/utils/request3'

// const namespace = '/vue-element-admin'
const namespace = '/auth'

export function login(data) {
  return request({
    url: `${namespace}/login/token/access`,
    method: 'post',
    data
  })
}

export function getInfo(role) {
  return request({
    url: `${namespace}/login/token/user`,
    method: 'get',
    params: { role }
  })
}

export function logout(refreshToken) {
  return request({
    url: `${namespace}/logout/token`,
    method: 'post',
    params: { refreshToken }
  })
}
