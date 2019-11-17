import request from '@/utils/request2'

export function login(data) {
  return request({
    url: '/auth/login/token/access',
    method: 'post',
    data
  })
}

export function getInfo(role) {
  return request({
    url: '/auth/login/token/user',
    method: 'get',
    params: { role }
  })
}

export function logout(refreshToken) {
  return request({
    url: '/auth/logout/token',
    method: 'post',
    params: { refreshToken }
  })
}
