import request from '@/utils/request2'
const baseUrl = '/kafka/topic'
export function list(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
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

export function add(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function edit(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function del(id) {
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
