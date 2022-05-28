import request from '@/utils/request2'

const namespace = '/devops/nacos/instances'

export function pageNacosInstances(params) {
  return request({
    url: `${namespace}/${params.pageNo}/${params.pageSize}`,
    method: 'get',
    params: params
  })
}

export function updateNacosInstance(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

