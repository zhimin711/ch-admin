import request from '@/utils/request3'

const namespace = '/devops/nacos/user'

export function listNacosUserNamespaces(projectId) {
  return request({
    url: `${namespace}/${projectId}/namespaces`,
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

