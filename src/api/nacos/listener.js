import request from '@/utils/request3'

const namespace = '/nacos/v1/cs/configs/listener'
const namespace2 = '/nacos/v1/cs/listener'

export function getNacosConfigsListener(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function getNacosListener(params) {
  return request({
    url: `${namespace2}`,
    method: 'get',
    params: params
  })
}
