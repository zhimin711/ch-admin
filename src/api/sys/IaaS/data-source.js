import request from '@/utils/request2'
const namespace = '/sys/app/datasource'

export function listDataSource(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getDataSource(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addDataSource(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editDataSource(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delDataSource(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getDbDs(dbId) {
  return request({
    url: `${namespace}/${dbId}/ds`,
    method: 'get'
  })
}
