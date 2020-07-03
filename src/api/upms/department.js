import request from '@/utils/request2'

const baseUrl = '/upms/department'

export function pageDepartment(query) {
  return request({
    url: `${baseUrl}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getDepartment(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addDepartment(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editDepartment(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delDepartment(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
