import request from '@/utils/request2'

const baseUrl = '/canal/v1/alarm'

export function getCanalAlarms(params) {
  return request({
    url: `${baseUrl}s`,
    method: 'get',
    params: params
  })
}
