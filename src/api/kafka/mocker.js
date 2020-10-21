import request from '@/utils/request2'

const namespace = '/kafka/topic/ext'

export function search(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

