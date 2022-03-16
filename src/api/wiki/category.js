import request from '@/utils/request2'

const baseUrl = '/wiki/admin/classify'

export function fetchClassifyTree(pid) {
  return request({
    url: `${baseUrl}/tree/${pid}`,
    method: 'get'
  })
}
export function fetchClassifyList(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getClassify(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addClassify(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editClassify(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delClassify(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
