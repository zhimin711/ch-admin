/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const rocketMQRouter = {
  path: '/rocketMQ',
  component: Layout,
  redirect: '/rocketMQ/dashboard',
  alwaysShow: true, // will always show the root menu
  name: 'RocketMQ',
  meta: {
    title: 'RocketMQ',
    icon: 'lock'
  },
  children: [
    {
      path: 'dashboard',
      component: () => import('@/views/rocketMQ/dashboard'),
      name: 'RocketMQDashboard',
      meta: {
        title: '驾驶舱'
      }
    },
    {
      path: 'cluster',
      component: () => import('@/views/rocketMQ/cluster'),
      name: 'RocketMQCluster',
      meta: {
        code: 'clusterManagement',
        title: '集群管理'
      }
    },
    {
      path: 'topic',
      component: () => import('@/views/rocketMQ/topic'),
      name: 'RocketMQTopic',
      meta: {
        code: 'topicManagement',
        title: '主题管理'
      }
    },
    {
      path: 'consumer',
      component: () => import('@/views/logs/operate'),
      name: 'RocketMQConsumer',
      meta: {
        title: '消费者管理'
      }
    },
    {
      path: 'producer',
      component: () => import('@/views/logs/operate'),
      name: 'RocketMQProducer',
      meta: {
        title: '生产者管理'
      }
    },
    {
      path: 'message',
      component: () => import('@/views/logs/operate'),
      name: 'RocketMQMessage',
      meta: {
        title: '消息搜索'
      }
    },
    {
      path: 'settings',
      component: () => import('@/views/logs/operate'),
      name: 'RocketMQSettings',
      meta: {
        title: '运维'
      }
    }
  ]
}

const routerMap = {
  RocketMQ: {
    path: '/rocketMQ',
    component: Layout,
    redirect: '/rocketMQ/dashboard',
    alwaysShow: true // will always show the root menu
  },
  RocketMQDashboard: {
    path: 'dashboard',
    component: () => import('@/views/rocketMQ/dashboard')
  },
  RocketMQCluster: {
    path: 'cluster',
    component: () => import('@/views/rocketMQ/cluster')
  }
}

export function getRocketMQRouter(code) {
  return routerMap[code]
}

export default rocketMQRouter
