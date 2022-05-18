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

export function addNacosService(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}
