import request from '@/utils/request2'

const baseUrl = '/wiki/admin/report'

export function getNewResources() {
  return request({
    url: `${baseUrl}/newResources`,
    method: 'get'
  })
}

export function getWeekResources() {
  return request({
    url: `${baseUrl}/weekResources`,
    method: 'get'
  })
}
