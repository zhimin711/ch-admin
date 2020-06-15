import request from '@/utils/request2'

const baseUrl = '/wiki/admin/report'

export function getNewArticles() {
  return request({
    url: `${baseUrl}/newArticles`,
    method: 'get'
  })
}

export function getWeekArticles() {
  return request({
    url: `${baseUrl}/weekArticles`,
    method: 'get'
  })
}
