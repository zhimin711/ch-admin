import request from '@/utils/request2'
const baseUrl = '/kafka/dubbo'

export function call(data) {
  return request({
    url: `${baseUrl}/call`,
    method: 'post',
    data
  })
}

