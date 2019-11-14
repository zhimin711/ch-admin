import request from '@/utils/request2'
const baseUrl = '/sys/app/logs'

export function search(data) {
  return request({
    url: `${baseUrl}/search`,
    method: 'post',
    data
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
