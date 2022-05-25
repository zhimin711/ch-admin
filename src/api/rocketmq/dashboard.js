import request from '@/utils/request2'

const namespace = '/devops/rocketmq/dashboard'

export function listRocketDashboardBroker(params) {
  return request({
    url: `${namespace}/broker`,
    method: 'get',
    params: params
  })
}

export function listRocketDashboardTopic(params) {
  return request({
    url: `${namespace}/topic`,
    method: 'get',
    params: params
  })
}

export function listRocketDashboardTopicCurrent() {
  return request({
    url: `${namespace}/topicCurrent`,
    method: 'get'
  })
}

