import request from '@/utils/request2'
const baseUrl = '/wiki/admin/resources'

export function listResourceInfo(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getResourceInfo(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function batchApproveResource(data) {
  return request({
    url: `${baseUrl}/batchApprove`,
    method: 'post',
    data
  })
}

export function editResourceInfo(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delResourceInfo(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

