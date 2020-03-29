import request from '@/utils/request2'

const baseUrl = '/wiki/admin/user'

export function searchUser(name) {
  return request({
    url: `${baseUrl}/_search/${name}`,
    method: 'get'
  })
}
