import request from '@/utils/request2'

const namespace = '/upms/namespace'

// 分页查询业务-租户列表
export function pageNamespace(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

// 查询业务-租户详细
export function getNamespace(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

// 新增业务-租户
export function addNamespace(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

// 修改业务-租户
export function editNamespace(data) {
  return request({
    url: `${namespace}/${data.id}`,
    method: 'put',
    data
  })
}

// 删除业务-租户
export function delNamespace(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

// 查询业务-租户详细
export function syncNacosNamespaces() {
  return request({
    url: `${namespace}/syncNacos`,
    method: 'get'
  })
}

export function getAvailableList(name) {
  return request({
    url: `${namespace}/available?s=${name}`,
    method: 'get'
  })
}
