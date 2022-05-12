import request from '@/utils/request2'

const namespace = '/upms/permission'

export function treePermission(type) {
  return request({
    url: `${namespace}/tree/${type}`,
    method: 'get'
  })
}
export function pagePermission(query) {
  return request({
    url: `${namespace}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getPermission(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addPermission(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editPermission(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delPermission(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getPermissionChildren(params) {
  return request({
    url: `${namespace}/${params.id}/children`,
    method: 'get',
    params: params
  })
}
