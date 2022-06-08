import request from '@/utils/request2'
const namespace = '/devops/kafka/content'

export function searchKafkaContent(query) {
  return request({
    url: `${namespace}/search`,
    method: 'get',
    params: query.params
  })
}

export function list(sid) {
  return request({
    url: `${namespace}/search/${sid}/records`,
    method: 'get'
  })
}

export function send(data) {
  return request({
    url: `${namespace}/send`,
    method: 'post',
    data
  })
}

export function resend(id, data) {
  return request({
    url: `${namespace}/resend/${id}`,
    method: 'put',
    data
  })
}
