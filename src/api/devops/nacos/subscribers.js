import request from '@/utils/request3'

const namespace = '/devops/nacos/subscribers'

export function pageNacosSubscribes(params) {
  return request({
    url: `${namespace}/${params.pageNo}/${params.pageSize}`,
    method: 'get',
    params: params
  })
}
