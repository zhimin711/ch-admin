import request from '@/utils/request2'

const baseUrl = '/upms/role'

export function pageRole(query) {
  return request({
    url: `${baseUrl}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getRole(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addRole(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editRole(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delRole(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function getRolePermissions(id, data) {
  return request({
    url: `${baseUrl}/${id}/permissions`,
    method: 'get',
    params: data
  })
}

export function editRolePermissions(id, data) {
  return request({
    url: `${baseUrl}/${id}/permissions`,
    method: 'post',
    data
  })
}

export function editRolePermissionsInterface(id, data) {
  return request({
    url: `${baseUrl}/${id}/permissions`,
    method: 'put',
    data
  })
}

