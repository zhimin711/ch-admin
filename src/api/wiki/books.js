import request from '@/utils/request2'

const namespace = '/wiki/admin/books'

export function fetchTree(pid) {
  return request({
    url: `${namespace}/tree/${pid}`,
    method: 'get'
  })
}
export function fetchBookList(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.param
  })
}

export function getBook(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function getBookImages(id) {
  return request({
    url: `${namespace}/${id}/images`,
    method: 'get'
  })
}

export function addBook(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editBook(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delBook(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getBookCatalogs(bookId, params) {
  return request({
    url: `${namespace}/${bookId}/chapters`,
    method: 'get',
    params: params
  })
}

export function fixBook(bookId) {
  return request({
    url: `${namespace}/${bookId}/fix`,
    method: 'post'
  })
}

export function syncBook(bookId) {
  return request({
    url: `${namespace}/${bookId}/sync`,
    method: 'post'
  })
}

export function syncBooks(data) {
  return request({
    url: `${namespace}/fetch`,
    method: 'post',
    data
  })
}

export function batchSyncBooks(data) {
  return request({
    url: `${namespace}/batch/sync`,
    method: 'post',
    data
  })
}

export function favorBook(bookId) {
  return request({
    url: `${namespace}/${bookId}/favor`,
    method: 'post'
  })
}
