import request from '@/utils/request3'

const namespace = '/devops/nacos/history'

export function pageNacosConfigsHistory(params) {
  return request({
    url: `${namespace}/${params.pageNo}/${params.pageSize}`,
    method: 'get',
    params: params
  })
}
