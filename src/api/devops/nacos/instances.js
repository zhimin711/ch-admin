import request from '@/utils/request3'

const namespace = '/devops/nacos/instances'

export function pageNacosInstances(params) {
  return request({
    url: `${namespace}/${params.pageNo}/${params.pageSize}`,
    method: 'get',
    params: params
  })
}
