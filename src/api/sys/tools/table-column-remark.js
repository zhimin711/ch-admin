import request from '@/utils/request2'

const namespace = '/sys/tools/table/column'

// 分页查询表字段备注列表
export function pageTableColumnRemark(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

// 查询表字段备注详细
export function getTableColumnRemark(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

// 新增表字段备注
export function addTableColumnRemark(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

// 修改表字段备注
export function editTableColumnRemark(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

// 删除表字段备注
export function delTableColumnRemark(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}
