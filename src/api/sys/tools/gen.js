import request from '@/utils/request2'

const namespace = '/sys/tools/codegen'

// 查询生成表数据
export function listTable(query) {
  return request({
    url: `${namespace}/${query.dsId}/${query.page}/${query.size}`,
    method: 'get',
    params: query.params
  })
}
// 查询db数据库列表
export function listDbTable(params) {
  return request({
    url: `${namespace}/db/list`,
    method: 'get',
    params: params
  })
}

// 查询表详细信息
export function getGenTable(dsId, params) {
  return request({
    url: `${namespace}/${dsId}`,
    method: 'get',
    params: params
  })
}

// 修改代码生成信息
export function updateGenTable(data) {
  return request({
    url: '/tool/gen',
    method: 'put',
    data: data
  })
}

// 导入表
export function importTable(data) {
  return request({
    url: '/tool/gen/importTable',
    method: 'post',
    params: data
  })
}

// 删除表数据
export function delTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'delete'
  })
}

// 同步数据库
export function synchDb(tableName) {
  return request({
    url: '/tool/gen/synchDb/' + tableName,
    method: 'get'
  })
}
// 预览生成代码
export function previewTable2(dsId, data) {
  return request({
    url: `${namespace}/preview/${dsId}`,
    method: 'post',
    data
  })
}

// 生成代码（自定义路径）
export function codegen(dsId, data) {
  return request({
    url: `${namespace}/mybatis/${dsId}`,
    method: 'post',
    data
  })
}

// 生成代码（自定义路径）
export function codegen3(dsId, data) {
  return request({
    url: `${namespace}/mybatis3/${dsId}`,
    method: 'post',
    data
  })
}

