import request from '@/utils/request2'
const namespace = '/devops/kafka/content'

export function searchKafkaContent(query) {
  return request({
    url: `${namespace}/search`,
    method: 'get',
    params: query.params
  })
}

export function sendKafkaContent(data) {
  return request({
    url: `${namespace}/send`,
    method: 'post',
    data
  })
}

