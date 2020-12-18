import request from '@/utils/request2'

const namespace = '/kafka/topic/ext'
const namespace2 = '/kafka/mock'

export function searchMock(params) {
  return request({
    url: `${namespace}`,
    method: 'get',
    params: params
  })
}

export function loadMock(params) {
  return request({
    url: `${namespace}/${params.id}`,
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
    url: `${namespace2}`,
    method: 'post',
    data
  })
}

export function doMockGPS(data) {
  return request({
    url: `${namespace2}/gps`,
    method: 'post',
    data
  })
}

export function deleteMock(params) {
  return request({
    url: `${namespace}/${params.id}`,
    method: 'delete'
  })
}
