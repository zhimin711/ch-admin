import request from '@/utils/request2'

const baseUrl = '/canal/v1/nodeServer'

export function getNodeServers(params) {
  return request({
    url: `${baseUrl}s`,
    method: 'get',
    params: params
  })
}

export function addNodeServer(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function nodeServerDetail(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function updateNodeServer(data) {
  return request({
    url: `${baseUrl}`,
    method: 'put',
    data
  })
}

export function deleteNodeServer(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function startNodeServer(id) {
  return request({
    url: `${baseUrl}/start/` + id,
    method: 'put'
  })
}

export function stopNodeServer(id) {
  return request({
    url: `${baseUrl}/stop/` + id,
    method: 'put'
  })
}

export function nodeServerLog(id) {
  return request({
    url: `${baseUrl}/log/` + id,
    method: 'get'
  })
}
