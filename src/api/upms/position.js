import request from '@/utils/request2'

const baseUrl = '/upms/position'

export function pagePosition(query) {
  return request({
    url: `${baseUrl}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getPosition(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addPosition(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editPosition(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delPosition(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function treePosition(pid) {
  return request({
    url: `${baseUrl}/tree/${pid}`,
    method: 'get'
  })
}

export function searchPosition(name) {
  return request({
    url: `${baseUrl}/search`,
    method: 'get',
    name
  })
}
