import request from '@/utils/request2'

const namespace = '/nacos/v1/cs/configs'

export function pageNacosConfigs(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function addNacosConfigs(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function getNacosConfigs(params) {
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

export function deleteNacosConfigs(id) {
  return request({
    url: `${namespace}/` + id,
    method: 'delete'
  })
}

export function rollbackNacosConfigs(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

