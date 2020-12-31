import request from '@/utils/request2'

const namespace = '/kafka/rocketmq/topic'

export function listRocketMQTopic() {
  return request({
    url: `${namespace}`,
    method: 'get'
  })
}

export function getRocketMQTopicStatus(params) {
  return request({
    url: `${namespace}/stats`,
    method: 'get',
    params: params
  })
}

export function getRocketMQTopicRoute(params) {
  return request({
    url: `${namespace}/route`,
    method: 'get',
    params: params
  })
}

export function getRocketMQTopic(params) {
  return request({
    url: `${namespace}/config`,
    method: 'get',
    params: params
  })
}

export function getRocketMQTopicConsumer(params) {
  return request({
    url: `${namespace}/consumer`,
    method: 'get',
    params: params
  })
}

export function getRocketMQTopicConsumerInfo(params) {
  return request({
    url: `${namespace}/consumerInfo`,
    method: 'get',
    params: params
  })
}

export function addRocketMQTopic(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editRocketMQTopic(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

export function deleteRocketMQTopic(params) {
  return request({
    url: `${namespace}`,
    method: 'delete',
    params
  })
}

export function sendRocketMQTopicMessage(data) {
  return request({
    url: `${namespace}/sendMessage`,
    method: 'post',
    data
  })
}

