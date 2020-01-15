import request from '@/utils/request2'

const baseUrl = '/wiki/admin/books/chapter'

export function get(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
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
