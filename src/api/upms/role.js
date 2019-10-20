import request from '@/utils/request2'

export function getRoutes() {
  return request({
    url: '/upms/permission/tree/1',
    method: 'get'
  })
}

export function getRoles(pageNum, pageSize, query) {
  return request({
    url: `upms/role/${pageNum}/${pageSize}`,
    method: 'get',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/role/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/role/${id}`,
    method: 'delete'
  })
}
