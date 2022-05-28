import request from '@/utils/request2'

const namespace = '/devops/nacos/services'

export function pageNacosServices(params) {
  return request({
    url: `${namespace}/${params.pageNo}/${params.pageSize}`,
    method: 'get',
    params: params
  })
}

export function getNacosService(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function addNacosService(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function updateNacosService(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

export function deleteNacosService(params) {
  return request({
    url: `${namespace}`,
    method: 'delete',
    params: params
  })
}

export function updateNacosServiceCluster(data) {
  return request({
    url: `${namespace}/cluster`,
    method: 'put',
    data
  })
}
