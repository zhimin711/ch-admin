import request from '@/utils/request2'

const namespace = '/devops/nacos/user'

export function listNacosUserNamespaces(projectId, clusterId) {
  return request({
    url: `${namespace}/${projectId}/${clusterId}/namespaces`,
    method: 'get'
  })
}

export function getNacosUserApplyNamespaces(projectId, clusterId) {
  return request({
    url: `${namespace}/apply/${projectId}/${clusterId}/namespaces`,
    method: 'get'
  })
}

export function applyNacosUserNamespaces(id, clusterId, data) {
  return request({
    url: `${namespace}/apply/${id}/${clusterId}/namespaces`,
    method: 'post',
    data
  })
}

export function getNacosUserProjectInstances(projectId, params) {
  return request({
    url: `${namespace}/${projectId}/instances`,
    method: 'get',
    params: params
  })
}

export function getNacosUserProjectHistory(projectId, params) {
  return request({
    url: `${namespace}/${projectId}/history`,
    method: 'get',
    params: params
  })
}

export function getNacosUserProjectHistoryDetail(projectId, params) {
  return request({
    url: `${namespace}/${projectId}/history/detail`,
    method: 'get',
    params: params
  })
}
