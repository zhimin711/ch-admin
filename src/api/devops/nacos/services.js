import request from '@/utils/request3'

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

export function rollbackNacosConfig(data) {
  return request({
    url: `${namespace}?opType=${data.opType}`,
    method: 'put',
    data
  })
}
