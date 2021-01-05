import request from '@/utils/request2'

const namespace = '/kafka/rocketmq/message'

export function listRocketMQMessage(params) {
  return request({
    url: `${namespace}/queryByTopic`,
    method: 'get',
    params: params
  })
}
export function listRocketMQMessage2(params) {
  return request({
    url: `${namespace}/queryByTopicAndKey`,
    method: 'get',
    params: params
  })
}
export function detailRocketMQMessage(params) {
  return request({
    url: `${namespace}/view`,
    method: 'get',
    params: params
  })
}
export function resendRocketMQMessage(data) {
  return request({
    url: `${namespace}/consumeMessageDirectly`,
    method: 'post',
    data
  })
}

