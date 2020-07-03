import request from '@/utils/request2'
const baseUrl = '/upms/user'
export function pageUser(query) {
  return request({
    url: `${baseUrl}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getUser(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addUser(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editUser(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delUser(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function initPwd(id) {
  return request({
    url: `${baseUrl}/${id}/initPwd`,
    method: 'post'
  })
}

export function changePwd(data) {
  return request({
    url: `${baseUrl}/changePwd`,
    method: 'post',
    data
  })
}

export function getEnableRoles() {
  return request({
    url: `${baseUrl}/roles`,
    method: 'get'
  })
}

export function getRoles(id) {
  return request({
    url: `${baseUrl}/${id}/roles`,
    method: 'get'
  })
}

export function editRoles(id, data) {
  return request({
    url: `${baseUrl}/${id}/roles`,
    method: 'post',
    data
  })
}
