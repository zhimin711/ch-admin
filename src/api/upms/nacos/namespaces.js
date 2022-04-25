import request from '@/utils/request2'

const namespace = '/upms/nacos/namespaces'

export function pageNacosNamespaces(query) {
  return request({
    url: `${namespace}/${query.page}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getNacosNamespace(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
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
    url: `${namespace}`,
    method: 'put',
    data
  })
}

export function deleteNacosNamespace(params) {
  return request({
    url: `${namespace}`,
    method: 'delete',
    params: params
  })
}
