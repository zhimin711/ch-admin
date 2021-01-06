import request from '@/utils/request2'

const namespace = '/kafka/rocketmq/producer'

export function listRocketMQProducer(params) {
  return request({
    url: `${namespace}/connection`,
    method: 'get',
    params: params
  })
}

