import request from '@/utils/request2'

const namespace = '/devops/nacos/history'

export function pageNacosConfigsHistory(params) {
  return request({
    url: `${namespace}/${params.pageNo}/${params.pageSize}`,
    method: 'get',
    params: params
  })
}

export function getNacosConfigHistory(params) {
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
