import request from '@/utils/request2'

const namespace = '/kafka/rocketmq/consumer'

export function listRocketMQConsumerGroups() {
  return request({
    url: `${namespace}/groups`,
    method: 'get'
  })
}

export function getRocketMQConsumerStatus(params) {
  return request({
    url: `${namespace}/connection`,
    method: 'get',
    params: params
  })
}

export function getRocketMQConsumerDetail(params) {
  return request({
    url: `${namespace}/queryTopic`,
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

