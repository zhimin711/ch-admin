import request from '@/utils/request2'

const namespace = '/sys/iaas/database'

export function listDatabase(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getDatabase(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function addDatabase(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editDatabase(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delDatabase(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getCurrentProjectTree() {
  return request({
    url: `${namespace}/tenant`,
    method: 'get'
  })
}
