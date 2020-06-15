import request from '@/utils/request2'

const baseUrl = '/wiki/admin/report'

export function getNewVisits() {
  return request({
    url: `${baseUrl}/newVisits`,
    method: 'get'
  })
}

export function getWeekVisits() {
  return request({
    url: `${baseUrl}/weekVisits`,
    method: 'get'
  })
}
