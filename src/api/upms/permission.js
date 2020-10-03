import request from '@/utils/request2'

const baseUrl = '/upms/permission'

export function treePermission(type) {
  return request({
    url: `${baseUrl}/tree/${type}`,
    method: 'get'
  })
}
export function pagePermission(query) {
  return request({
    url: `${baseUrl}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getPermission(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addPermission(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editPermission(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delPermission(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
