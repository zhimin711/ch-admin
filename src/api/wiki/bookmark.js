import request from '@/utils/request2'

const baseUrl = '/wiki/admin/bookmark'

export function listBookmark(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getBookmark(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function addBookmark(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editBookmark(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delBookmark(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

