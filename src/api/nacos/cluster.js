import request from '@/utils/request3'

const namespace = '/nacos/v1/core/cluster/nodes'

export function getClusterNodes(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}
