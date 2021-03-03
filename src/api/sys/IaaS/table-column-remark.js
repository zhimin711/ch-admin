import request from '@/utils/request2'

const namespace = '/sys/table/column'

// 分页查询业务-数据库列备注列表
export function pageTableColumnRemark(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

// 查询业务-数据库列备注详细
export function getTableColumnRemark(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

// 新增业务-数据库列备注
export function addTableColumnRemark(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

// 修改业务-数据库列备注
export function editTableColumnRemark(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

// 删除业务-数据库列备注
export function delTableColumnRemark(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}
