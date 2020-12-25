import request from '@/utils/request2'

const namespace = '/kafka/rocketmq/cluster'

export function listRocketMQ() {
  return request({
    url: `${namespace}`,
    method: 'get'
  })
}

export function getRocketMQ(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get',
    params: { id }
  })
}

