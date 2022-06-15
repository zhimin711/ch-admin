import request from '@/utils/request2'
const namespace = '/devops/kafka/topic'

export function pageKafkaTopics(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function addKafkaTopic(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editKafkaTopic(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delKafkaTopic(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getKafkaTopic(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function getKafkaTopicBrokers(id) {
  return request({
    url: `${namespace}/${id}/brokers`,
    method: 'get',
    params: { id }
  })
}

export function getKafkaTopicPartitions(id) {
  return request({
    url: `${namespace}/${id}/partitions`,
    method: 'get',
    params: { id }
  })
}

export function getKafkaTopicConsumerGroups(id) {
  return request({
    url: `${namespace}/${id}/consumerGroups`,
    method: 'get',
    params: { id }
  })
}

export function getKafkaTopicConfigs(id) {
  return request({
    url: `${namespace}/${id}/configs`,
    method: 'get',
    params: { id }
  })
}

export function getClusters() {
  return request({
    url: `${namespace}/clusters`,
    method: 'get'
  })
}

export function getTopics(clusterName, topicName) {
  return request({
    url: `${namespace}/topics`,
    method: 'get',
    params: { clusterName, topicName }
  })
}

export function syncKafkaClusterTopics(data) {
  return request({
    url: `${namespace}/sync`,
    method: 'post',
    timeout: 300000,
    data
  })
}

export function refresh2(data) {
  return request({
    url: `${namespace}/refresh`,
    method: 'post',
    data
  })
}
