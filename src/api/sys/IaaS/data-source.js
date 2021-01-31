import request from '@/utils/request2'
const baseUrl = '/sys/app/datasource'
export function listDataSource(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getDataSource(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addDataSource(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editDataSource(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delDataSource(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
