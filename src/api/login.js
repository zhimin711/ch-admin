import request from '@/utils/request2'

export function login(data) {
  return request({
    url: '/auth/login/token/access',
    method: 'post',
    data
  })
}

export function getInfo(token, role) {
  return request({
    url: 'auth/login/token',
    method: 'get',
    params: { token, role }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
