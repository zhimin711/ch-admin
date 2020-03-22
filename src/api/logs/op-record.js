import request from '@/utils/request2'
const baseUrl = '/upms/op/record'

export function listOPRecord(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

