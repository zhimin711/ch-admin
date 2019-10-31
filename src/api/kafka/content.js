import request from '@/utils/request2'
const baseUrl = '/kafka/content'

export function search(query) {
  return request({
    url: `${baseUrl}/search`,
    method: 'get',
    params: query.params
  })
}

export function getStatus(sid) {
  return request({
    url: `${baseUrl}/search/${sid}/status`,
    method: 'get'
  })
}

export function list(sid) {
  return request({
    url: `${baseUrl}/search/${sid}/records`,
    method: 'get'
  })
}

export function send(data) {
  return request({
    url: `${baseUrl}/send`,
    method: 'post',
    data
  })
}

export function resend(id, data) {
  return request({
    url: `${baseUrl}/resend/${id}`,
    method: 'put',
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
