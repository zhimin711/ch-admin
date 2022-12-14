import request from '@/utils/request2'

const namespace = '/devops/nacos/configs'

const FULL_NAMESPACE = '/api/devops/nacos/configs/export'

export function pageNacosConfigs(query) {
  return request({
    url: `${namespace}/${query.pageNo}/${query.pageSize}`,
    method: 'get',
    params: query
  })
}

export function getNacosConfig(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params
  })
}

export function addNacosConfig(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function updateNacosConfig(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

export function deleteNacosConfig(params) {
  return request({
    url: `${namespace}`,
    method: 'delete',
    params: params
  })
}

export function cloneNacosConfigs(params, data) {
  return request({
    url: `${namespace}/clone?policy=${params.policy}&namespaceId=${params.namespaceId}`,
    method: 'post',
    data
  })
}

export function exportNacosConfigs(params) {
  window.open(
    [
      FULL_NAMESPACE,
      Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
    ].join('?')
  )
}
