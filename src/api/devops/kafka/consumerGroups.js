import request from '@/utils/request2'

const namespace = '/devops/kafka/consumerGroups'

export function getKafkaConsumerGroups(clusterId, groupId) {
  return request({
    url: `${namespace}/${clusterId}`,
    method: 'get',
    params: { groupId: groupId }
  })
}

export function getKafkaConsumerGroupDescribe(clusterId, groupId) {
  return request({
    url: `${namespace}/${clusterId}/${groupId}/describe`,
    method: 'get',
    params: { groupId: groupId }
  })
}

export function delKafkaConsumerGroups(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

