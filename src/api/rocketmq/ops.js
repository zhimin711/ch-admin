import request from '@/utils/request2'

const namespace = '/devops/rocketmq/ops'

export function listRocketMQAddr() {
  return request({
    url: `${namespace}/homePage.query`,
    method: 'get'
  })
}

export function configRocketMQAddr(params) {
  return request({
    url: `${namespace}/updateNameSvrAddr`,
    method: 'post',
    params: params
  })
}

