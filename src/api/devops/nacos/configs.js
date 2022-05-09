import request from '@/utils/request2'

const namespace = '/devops/nacos/configs'

export function pageNacosConfigs(query) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: query
  })
}

export function getNacosConfig(params) {
  return request({
    url: `${namespace}/${params.namespaceId}`,
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
    url: `${namespace}/${data.id}`,
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
