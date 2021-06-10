import request from '@/utils/request2'
const namespace = '/sys/project'

export function list(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function get(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function add(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function edit(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getParents(type) {
  return request({
    url: `${namespace}/tree/${type}`,
    method: 'get'
  })
}

export function getUsers() {
  return request({
    url: `${namespace}/users`,
    method: 'get'
  })
}
export function getProjectUsers(projectId) {
  return request({
    url: `${namespace}/${projectId}/users`,
    method: 'get'
  })
}

export function editProjectUsers(id, data) {
  return request({
    url: `${namespace}/${id}/users`,
    method: 'post',
    data
  })
}

export function getCurrentUserTree() {
  return request({
    url: `${namespace}/user/tree`,
    method: 'get'
  })
}

export function getProjectDb(id) {
  return request({
    url: `${namespace}/${id}/db`,
    method: 'get'
  })
}
