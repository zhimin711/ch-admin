import request from '@/utils/request2'

const baseUrl = '/wiki/admin/article'

export function fetchTree(pid) {
  return request({
    url: `${baseUrl}/tree/${pid}`,
    method: 'get'
  })
}
export function listArticle(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getArticle(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addArticle(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editArticle(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delArticle(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function getArticleRecommends() {
  return request({
    url: `${baseUrl}/recommend`,
    method: 'get'
  })
}

export function editArticleRecommends(data) {
  return request({
    url: `${baseUrl}/recommend`,
    method: 'post',
    data
  })
}
