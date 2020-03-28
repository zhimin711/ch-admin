import request from '@/utils/request2'

const baseUrl = '/wiki/admin/image'

export function listImage(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function searchImage(query) {
  return request({
    url: `${baseUrl}/_search/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}
