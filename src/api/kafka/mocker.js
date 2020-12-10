import request from '@/utils/request2'

const namespace = '/kafka/topic/ext'
const namespace2 = '/kafka/gps'

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

export function doMockGPS(data) {
  return request({
    url: `${namespace2}/mock`,
    method: 'post',
    data
  })
}

