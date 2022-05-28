import request from '@/utils/request2'
const namespace = '/devops/nacos/projects'

export function pageProjects(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getProject(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function getProjectNamespaces(id, clusterId) {
  return request({
    url: `${namespace}/${id}/${clusterId}/namespaces`,
    method: 'get'
  })
}

export function editProjectNamespaces(id, clusterId, data) {
  return request({
    url: `${namespace}/${id}/${clusterId}/namespaces`,
    method: 'post',
    data
  })
}

export function listNacosProjects(params) {
  return request({
    url: `${namespace}/list`,
    method: 'get',
    params: params
  })
}

export function listNacosProjectClusters(id) {
  return request({
    url: `${namespace}/${id}/clusters`,
    method: 'get'
  })
}
