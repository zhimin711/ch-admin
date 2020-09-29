import request from '@/utils/request3'

const namespace = '/nacos/v1/cs/configs'

export function pageNacosConfigs(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function releaseNacosConfig(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function getNacosConfig(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function updateNacosConfigs(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

export function deleteNacosConfigs(params) {
  return request({
    url: `${namespace}?dataId=${params.dataId}&group=${params.group}`,
    method: 'delete'
  })
}

export function rollbackNacosConfig(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function exportNacosConfigs(params) {
  window.open(
    [
      namespace,
      Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
    ].join('?')
  )
}

