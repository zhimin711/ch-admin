import request from '@/utils/request2'

const baseUrl = '/wiki/admin/user'

export function listUser(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function get(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function edit(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function initPwd(id) {
  return request({
    url: `${baseUrl}/${id}/initPwd`,
    method: 'post'
  })
}

export function changePwd(data) {
  return request({
    url: `${baseUrl}/changePwd`,
    method: 'post',
    data
  })
}

