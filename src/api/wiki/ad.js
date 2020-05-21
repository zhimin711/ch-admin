import request from '@/utils/request2'

const baseUrl = '/wiki/admin/ad'

export function getAdList(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getAd(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addAd(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editAd(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delAd(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
