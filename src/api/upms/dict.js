import request from '@/utils/request2'

const baseUrl = '/upms/dict'

export function pageDict(query) {
  return request({
    url: `${baseUrl}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getDict(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addDict(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editDict(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delDict(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function searchDict(name) {
  return request({
    url: `${baseUrl}/search`,
    method: 'get',
    name
  })
}
