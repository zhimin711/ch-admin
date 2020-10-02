import request from '@/utils/request3'

const namespace = '/nacos/v1/cs/history'

export function getNacosConfigsHistory(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}
