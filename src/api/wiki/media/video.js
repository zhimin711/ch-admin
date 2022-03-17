import request from '@/utils/request2'

const namespace = '/wiki/admin/video/info'

// 分页查询视频库列表
export function pageVideoInfo(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

// 查询视频库详细
export function getVideoInfo(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

// 新增视频库
export function addVideoInfo(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

// 修改视频库
export function editVideoInfo(data) {
  return request({
    url: `${namespace}`,
    method: 'put',
    data
  })
}

// 删除视频库
export function delVideoInfo(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}
