import request from '@/utils/request2'
const baseUrl = '/sys/iaas/database'
export function listDatabase(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getDatabase(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addDatabase(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editDatabase(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delDatabase(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
