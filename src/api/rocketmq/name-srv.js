import request from '@/utils/request2'

const namespace = '/devops/rocketmq/name-srv'

export function listRocketMQNameSrv() {
  return request({
    url: `${namespace}/list`,
    method: 'get'
  })
}

export function getRocketMQNameSrvAddr(params) {
  return request({
    url: `${namespace}/addr`,
    method: 'get',
    params: params
  })
}

