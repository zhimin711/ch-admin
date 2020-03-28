import request from '@/utils/request2'

const uploadImg = '/wiki/admin/upload/img'

export function uploadCropImage(data, blob) {
  const formData = new FormData()
  for (const i in data) {
    formData.append(i, data[i])
  }
  // formData.append('type', 'image')
  // formData.append('action', 'ad')
  // formData.append('srcType', 'ad')
  formData.append('files[]', blob, data.fileName)
  return request({
    url: `${uploadImg}`,
    method: 'post',
    data: formData
  })
}

