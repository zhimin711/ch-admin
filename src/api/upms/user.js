import request from '@/utils/request2'
const baseUrl = '/upms/user'
export function list(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function get(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function add(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function edit(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
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
