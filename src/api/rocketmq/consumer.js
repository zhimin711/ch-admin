import request from '@/utils/request2'

const namespace = '/devops/rocketmq/consumer'

export function listRocketMQConsumerGroups(page, pageSize, params) {
  return request({
    url: `${namespace}/groups`,
    method: 'get',
    params: {
      page,
      pageSize,
      ...params
    }
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

export function getRocketMQConsumerConfig(params) {
  return request({
    url: `${namespace}/examineSubscriptionGroupConfig`,
    method: 'get',
    params: params
  })
}

export function getRocketMQConsumerClient(params) {
  return request({
    url: `${namespace}/runningInfo`,
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

export function addRocketMQConsumer(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editRocketMQConsumer(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function fetchRocketMQConsumerBrokerNameList(params) {
  return request({
    url: `${namespace}/fetchBrokerNameList`,
    method: 'get',
    params
  })
}

export function deleteRocketMQConsumer(data) {
  return request({
    url: `${namespace}/deleteSubGroup`,
    method: 'post',
    data
  })
}

export function resetRocketMQConsumerOffset(data) {
  return request({
    url: `${namespace}/resetOffset`,
    method: 'post',
    data
  })
}

