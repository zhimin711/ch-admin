import request from '@/utils/request2'

const baseUrl = '/canal/v1/instance'

export function getCanalInstances(params) {
  return request({
    url: `${baseUrl}s`,
    method: 'get',
    params: params
  })
}

export function canalInstanceDetail(id) {
  return request({
    url: `${baseUrl}/` + id,
    method: 'get'
  })
}

export function startInstance(id, nodeId) {
  return request({
    url: `${baseUrl}/start/` + id + '/' + nodeId,
    method: 'put'
  })
}

export function stopInstance(id, nodeId) {
  return request({
    url: `${baseUrl}/stop/` + id + '/' + nodeId,
    method: 'put'
  })
}

export function instanceLog(id, nodeId) {
  return request({
    url: `${baseUrl}/log/` + id + '/' + nodeId,
    method: 'get'
  })
}

export function instanceStatus(id, option) {
  return request({
    url: `${baseUrl}/status/` + id + '?option=' + option,
    method: 'put'
  })
}

export function getActiveInstances(serverId) {
  return request({
    url: `/canal/v1/active/instances/` + serverId,
    method: 'get'
  })
}

export function getCanalInstanceTemplate(id) {
  return request({
    url: `${baseUrl}/template/${id}`,
    method: 'get'
  })
}

export function addCanalInstanceTemplate(data) {
  return request({
    url: `${baseUrl}/template`,
    method: 'post',
    data
  })
}

export function updateCanalInstanceTemplate(data) {
  return request({
    url: `${baseUrl}/template`,
    method: 'put',
    data
  })
}

export function deleteCanalInstanceTemplate(id) {
  return request({
    url: `${baseUrl}/template/` + id,
    method: 'delete'
  })
}

export function getRedisPosition(id) {
  return request({
    url: `${baseUrl}/meta/position/` + id,
    method: 'get'
  })
}

export function updateRedisPosition(data) {
  return request({
    url: `${baseUrl}/meta/position/` + data.instanceId,
    method: 'put',
    data
  })
}
