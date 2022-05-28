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

export function applyNacosUserNamespaces(id, data) {
  return request({
    url: `${namespace}/apply/${id}/namespaces`,
    method: 'post',
    data
  })
}

