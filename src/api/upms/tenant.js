import request from '@/utils/request2'

const namespace = '/upms/tenant'

// 分页查询业务-租户列表
export function pageTenant(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

// 查询业务-租户详细
export function getTenant(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

// 新增业务-租户
export function addTenant(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

// 修改业务-租户
export function editTenant(data) {
  return request({
    url: `${namespace}/${data.id}`,
    method: 'put',
    data
  })
}

// 删除业务-租户
export function delTenant(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}
