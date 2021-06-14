import request from '@/utils/request2'

const namespace = '/upms/dict'

export function pageDict(query) {
  return request({
    url: `${namespace}/${query.num}/${query.size}`,
    method: 'get',
    params: query.params
  })
}

export function getDict(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get'
  })
}

export function addDict(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function editDict(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function delDict(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function searchDict(code, name) {
  return request({
    url: `${namespace}/data/${code}`,
    method: 'get',
    name
  })
}
export function searchDictList(name) {
  return request({
    url: `${namespace}/list`,
    method: 'get',
    name
  })
}
