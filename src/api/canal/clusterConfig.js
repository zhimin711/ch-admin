import request from '@/utils/request2'

const baseUrl = '/canal/v1/config/template'

export function getCanalConfigTemplate(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function saveCanalConfigTemplate(data) {
  return request({
    url: `${baseUrl}`,
    method: 'put',
    data
  })
}
