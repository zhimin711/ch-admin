import request from '@/utils/request2'
const baseUrl = '/wiki/admin/images'

export function listImage(query) {
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

export function batchEditImage(data) {
  return request({
    url: `${baseUrl}/batchEdit`,
    method: 'post',
    data
  })
}

export function editImage(id, data) {
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

