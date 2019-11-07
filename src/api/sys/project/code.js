import request from '@/utils/request2'
const baseUrl = '/sys/project/code'
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

export function getParents(type) {
  return request({
    url: `${baseUrl}/tree/${type}`,
    method: 'get'
  })
}

export function getUsers() {
  return request({
    url: `${baseUrl}/users`,
    method: 'get'
  })
}
export function getProjectUsers(projectId) {
  return request({
    url: `${baseUrl}/${projectId}/users`,
    method: 'get'
  })
}
