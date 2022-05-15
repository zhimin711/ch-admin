import request from '@/utils/request2'

const namespace = '/devops/nacos/namespaces'

export function pageNacosNamespaces(query) {
  return request({
    url: `${namespace}/${query.page}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getNacosNamespace(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function addNacosNamespace(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function updateNacosNamespace(data) {
  return request({
    url: `${namespace}/${data.id}`,
    method: 'put',
    data
  })
}

export function deleteNacosNamespace(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function syncNacosNamespaces(clusterId) {
  return request({
    url: `${namespace}/sync/${clusterId}`,
    method: 'post'
  })
}

export function getNamespaceProjects(id, name) {
  return request({
    url: `${namespace}/${id}/projects?s=${name}`,
    method: 'get'
  })
}
