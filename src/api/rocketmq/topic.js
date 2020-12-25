import request from '@/utils/request2'

const namespace = '/kafka/rocketmq/topic'

export function listRocketMQTopic() {
  return request({
    url: `${namespace}`,
    method: 'get'
  })
}

export function getRocketMQTopic(params) {
  return request({
    url: `${namespace}/stats`,
    method: 'get',
    params: params
  })
}

