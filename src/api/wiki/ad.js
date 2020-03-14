import request from '@/utils/request2'

const baseUrl = '/wiki/admin/ad'
const uploadImg = '/wiki/admin/upload/img'

export function getAdList(query) {
  return request({
    url: `${baseUrl}/${query.page}/${query.limit}`,
    method: 'get',
    params: query.params
  })
}

export function getAd(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addAd(data) {
  return request({
    url: `${baseUrl}`,
    method: 'post',
    data
  })
}

export function editAd(id, data) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'put',
    data
  })
}

export function delAd(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function uploadAd(data, blob) {
  const formData = new FormData()
  for (const i in data) {
    formData.append(i, data[i])
  }
  formData.append('type', 'image')
  // formData.append('action', 'ad')
  formData.append('srcType', 'ad')
  formData.append('files[]', blob, data.fileName)
  return request({
    url: `${uploadImg}`,
    method: 'post',
    formData
  })
}
