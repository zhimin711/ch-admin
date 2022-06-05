import request from '@/utils/request2'

const namespace = '/devops/kafka/cluster'

export function pageKafkaCluster(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getKafkaCluster(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function addKafkaCluster(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editKafkaCluster(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delKafkaCluster(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getKafkaClusterBrokers(id) {
  return request({
    url: `${namespace}/${id}/brokers`,
    method: 'get'
  })
}

