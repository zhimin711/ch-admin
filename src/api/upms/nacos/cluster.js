import request from '@/utils/request2'

const namespace = '/upms/nacos/cluster'

// 分页查询nacos集群列表
export function pageNacosCluster(query) {
  return request({
    url: `${namespace}/${query.page}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

// 查询nacos集群详细
export function getNacosCluster(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}
// 新增nacos集群
export function addNacosCluster(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

// 修改nacos集群
export function editNacosCluster(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

// 删除nacos集群
export function delNacosCluster(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}
