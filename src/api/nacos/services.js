import request from '@/utils/request3'

const namespace = '/nacos/v1/ns/catalog/services'
const namespace2 = '/nacos/v1/ns/service/subscribers'

export function pageNacosServices(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function addNacosServices(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function getNacosServices(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function updateNacosServices(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function deleteNacosServices(id) {
  return request({
    url: `${namespace}`,
    method: 'delete',
    params: { namespaceId: id }
  })
}

export function getNacosSubscribers(params) {
  return request({
    url: `${namespace2}`,
    method: 'get',
    params: params
  })
}
