import request from '@/utils/request2'

const baseUrl = '/wiki/admin/report'

export function getNewRecommends() {
  return request({
    url: `${baseUrl}/newRecommends`,
    method: 'get'
  })
}

export function getWeekRecommends() {
  return request({
    url: `${baseUrl}/weekRecommends`,
    method: 'get'
  })
}
