import request from '@/utils/request2'
const baseUrl = '/kafka/content'
export function search(query) {
  return request({
    url: `${baseUrl}/search`,
    method: 'get',
    params: query.params
  })
}

export function get(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function send(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
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
