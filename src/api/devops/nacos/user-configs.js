import request from '@/utils/request2'

const namespace = '/devops/nacos/user'

const FULL_NAMESPACE = '/api/devops/nacos/user'

export function pageNacosUserConfigs(projectId, query) {
  return request({
    url: `${namespace}/${projectId}/configs/${query.pageNo}/${query.pageSize}`,
    method: 'get',
    params: query
  })
}

export function getNacosProjectConfig(projectId, params) {
  return request({
    url: `${namespace}/${projectId}/configs`,
    method: 'get',
    params: params
  })
}

export function addNacosProjectConfig(projectId, data) {
  return request({
    url: `${namespace}/${projectId}/configs`,
    method: 'post',
    data
  })
}

export function updateNacosProjectConfig(projectId, data) {
  return request({
    url: `${namespace}//${projectId}/configs`,
    method: 'put',
    data
  })
}

export function deleteNacosProjectConfig(projectId, params) {
  return request({
    url: `${namespace}/${projectId}/configs`,
    method: 'delete',
    params: params
  })
}

export function cloneNacosProjectConfigs(projectId, params, data) {
  return request({
    url: `${namespace}/${projectId}/configs/clone`,
    method: 'post',
    params: params,
    data
  })
}

export function rollbackNacosProjectConfigs(projectId, data) {
  return request({
    url: `${namespace}/${projectId}/configs/rollback?opType=${data.opType}`,
    method: 'put',
    data
  })
}

export function exportNacosProjectConfigs(projectId, params) {
  window.open(
    [
      `${FULL_NAMESPACE}/${projectId}/configs/export`,
      Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
    ].join('?')
  )
}

