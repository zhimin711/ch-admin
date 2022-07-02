import request from '@/utils/request2'

const baseUrl = '/wiki/admin/user/plan'

export function listWikiUserPlan(page) {
  return request({
    url: `${baseUrl}/latest/${page}`,
    method: 'get'
  })
}
