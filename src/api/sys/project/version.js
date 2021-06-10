import request from '@/utils/request2'
const namespace = '/sys/project/version'

const projectCodeUrl = '/sys/project/code'

export function list(query) {
  return request({
    url: `${namespace}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function get(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'get',
    params: { id }
  })
}

export function add(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function edit(id, data) {
  return request({
    url: `${namespace}/${id}`,
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: `${namespace}/${id}`,
    method: 'delete'
  })
}

export function getProjects(type) {
  return request({
    url: `${projectCodeUrl}/tree/${type}`,
    method: 'get'
  })
}
