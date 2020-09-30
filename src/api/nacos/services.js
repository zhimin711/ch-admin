import request from '@/utils/request3'

const namespace = '/nacos/v1/ns/catalog/services'
const namespace2 = '/nacos/v1/ns/service/subscribers'
const namespace3 = '/nacos/v1/ns/service'

export function pageNacosServices(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function addNacosService(data) {
  return request({
    url: `${namespace3}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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

export function updateNacosService(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function deleteNacosService(params) {
  return request({
    url: `${namespace3}?serviceName=${params.name}&groupName=${params.groupName}`,
    method: 'delete',
    params: { namespaceId: params.namespaceId }
  })
}

export function getNacosSubscribers(params) {
  return request({
    url: `${namespace2}`,
    method: 'get',
    params: params
  })
}
