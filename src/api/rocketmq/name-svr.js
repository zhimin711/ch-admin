import request from '@/utils/request2'

const namespace = '/devops/rocketmq/name-svr'

export function listRocketMQNameSvr() {
  return request({
    url: `${namespace}/list`,
    method: 'get'
  })
}

export function getRocketMQNameSvrAddr(params) {
  return request({
    url: `${namespace}/addr`,
    method: 'get',
    params: params
  })
}

