import request from '@/utils/request2'

const baseUrl = '/canal/v1/config'

export function getCanalConfig(clusterId, serverId) {
  return request({
    url: `${baseUrl}/` + clusterId + '/' + serverId,
    method: 'get'
  })
}

export function updateCanalConfig(data) {
  return request({
    url: `${baseUrl}`,
    method: 'put',
    data
  })
}

export function getTemplateConfig() {
  return request({
    url: `${baseUrl}/template`,
    method: 'get'
  })
}
