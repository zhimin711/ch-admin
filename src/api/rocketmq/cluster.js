import request from '@/utils/request2'

const namespace = '/devops/rocketmq/cluster'

export function listRocketMQ() {
  return request({
    url: `${namespace}`,
    method: 'get'
  })
}

export function getRocketMQ(params) {
  return request({
    url: `${namespace}/brokerConfig`,
    method: 'get',
    params: params
  })
}

