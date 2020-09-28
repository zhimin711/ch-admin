import request from '@/utils/request3'

const namespace = '/nacos/v1/ns/catalog/services'

export function pageNacosServices(params) {
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

export function getNacosNamespaces(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
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
