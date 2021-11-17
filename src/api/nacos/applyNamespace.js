import request from '@/utils/request2'

const namespace = '/upms/apply/nacos'

// 分页查询业务-租户列表
export function pageApplyNamespaces(query) {
  return request({
    url: `${namespace}/${query.page}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function approveApplyNamespaces(data) {
  return request({
    url: `${namespace}/${data.id}/approve`,
    method: 'post',
    data
  })
}
