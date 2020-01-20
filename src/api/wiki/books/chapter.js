import request from '@/utils/request2'

const baseUrl = '/wiki/admin/books/chapter'

export function getBookChapter(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addBookChapter(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editBookChapter(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delBookChapter(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}
