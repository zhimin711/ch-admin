import request from '@/utils/request2'

const namespace = '/kafka/topic/ext'

export function searchMock(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function saveMock(data) {
  return request({
    url: `${namespace}`,
    method: 'post',
    data
  })
}

export function doMock(data) {
  return request({
    url: `${namespace}/mock`,
    method: 'post',
    data
  })
}

