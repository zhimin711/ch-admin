import request from '@/utils/request2'
const namespace = '/upms/project'

export function pageUpmsProject(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getUpmsProject(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function addUpmsProject(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editUpmsProject(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delUpmsProject(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getUpmsProjectParents(type) {
  return request({
    url: `${namespace}/tree/${type}`,
    method: 'get'
  })
}

export function getUpmsProjectUsers(projectId) {
  return request({
    url: `${namespace}/${projectId}/users`,
    method: 'get'
  })
}

export function editUpmsProjectUsers(id, data) {
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
