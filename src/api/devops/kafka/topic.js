import request from '@/utils/request2'
const baseUrl = '/devops/kafka/topic'
export function pageKafkaTopics(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getKafkaTopic(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addKafkaTopic(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editKafkaTopic(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delKafkaTopic(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function getClusters() {
  return request({
    url: `${baseUrl}/clusters`,
    method: 'get'
  })
}

export function getTopics(clusterName, topicName) {
  return request({
    url: `${baseUrl}/topics`,
    method: 'get',
    params: { clusterName, topicName }
  })
}

export function syncAll(data) {
  return request({
    url: `${baseUrl}/sync`,
    method: 'post',
    timeout: 360000,
    data
  })
}

export function refresh2(data) {
  return request({
    url: `${baseUrl}/refresh`,
    method: 'post',
    data
  })
}
