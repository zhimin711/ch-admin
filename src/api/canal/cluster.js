import request from '@/utils/request2'

const baseUrl = '/canal/v1/cluster'

export function getCanalClusters(params) {
  return request({
    url: `${baseUrl}s`,
    method: 'get',
    params: params
  })
}

export function addCanalCluster(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function canalClusterDetail(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function updateCanalCluster(data) {
  return request({
    url: `${baseUrl}`,
    method: 'put',
    data
  })
}

export function deleteCanalCluster(id) {
  return request({
    url: `${baseUrl}/` + id,
    method: 'delete'
  })
}

export function getClustersAndServers() {
  return request({
    url: '/canal/clustersAndServers',
    method: 'get'
  })
}
