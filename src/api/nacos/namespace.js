import request from '@/utils/request3'

const namespace = '/nacos/v1/console/namespaces'

export function pageNacosNamespaces(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function getNacosNamespace(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function getNacosNamespaces(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function addNacosNamespaces(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function updateNacosNamespaces(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function deleteNacosNamespaces(id) {
  return request({
    url: `${namespace}`,
    method: 'delete',
    params: { namespaceId: id }
  })
}
