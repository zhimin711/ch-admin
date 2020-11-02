import request from '@/utils/request2'

const baseUrl = '/wiki/admin/books'

export function fetchTree(pid) {
  return request({
    url: `${baseUrl}/tree/${pid}`,
    method: 'get'
  })
}
export function fetchBookList(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getBook(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addBook(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editBook(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delBook(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function getBookCatalogs(bookId, params) {
  return request({
    url: `${baseUrl}/${bookId}/chapters`,
    method: 'get',
    params: params
  })
}

export function fixBook(bookId) {
  return request({
    url: `${baseUrl}/${bookId}/fix`,
    method: 'post'
  })
}

export function syncBook(bookId) {
  return request({
    url: `${baseUrl}/${bookId}/sync`,
    method: 'post'
  })
}
