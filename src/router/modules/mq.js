/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'
import Blank from '@/layout/index2'

const mqRouter = {
  path: '/mq',
  component: Layout,
  redirect: '/mq/kafka/cluster',
  alwaysShow: true, // will always show the root menu
  name: 'MessageQueue',
  meta: {
    title: 'Message Queue',
    icon: 'lock'
  },
  children: [
    {
      path: 'kafka',
      component: Blank,
      alwaysShow: true,
      name: 'kafka Cluster',
      meta: {
        title: 'kafka管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'cluster',
          component: () => import('@/views/mq/kafka/cluster'),
          name: 'KafkaCluster',
          meta: {
            title: '主机管理'
          }
        },
        {
          path: 'topic',
          component: () => import('@/views/mq/kafka/topic'),
          name: 'KafkaClusterTopic',
          meta: {
            title: 'Topic'
          }
        },
        {
          path: 'topic/:id(\\d+)',
          component: () => import('@/views/mq/kafka/topic'),
          name: 'KafkaClusterTopicDetail',
          hidden: true,
          meta: {
            title: '数据库管理',
            noCache: true,
            activeMenu: '/mq/kafka/topic'
          }
        }
      ]
    }
  ]
}

const routerMap = {
  MQ: {
    path: '/mq',
    component: Layout,
    redirect: '/mq/kafka/cluster',
    alwaysShow: true, // will always show the root menu
    name: 'MQ',
    meta: {
      title: 'Message Queue'
    }
  },
  Kafka: {
    path: '/mq/kafka',
    component: Blank,
    redirect: '/mq/kafka/cluster',
    alwaysShow: true, // will always show the root menu
    name: 'KafkaManagement',
    meta: {
      code: 'kafkaManagement',
      icon: 'lock'
    }
  },
  KafkaCluster: {
    path: 'cluster',
    component: () => import('@/views/mq/kafka/cluster'),
    name: 'KafkaCluster',
    meta: {
      code: 'KafkaClusterManagement'
    }
  },
  KafkaTopic: {
    path: 'topic',
    component: () => import('@/views/mq/kafka/topic'),
    name: 'KafkaTopic',
    meta: {
      code: 'KafkaTopicManagement'
    }
  }
}

export function getMQRouter(code) {
  return routerMap[code]
}

export default mqRouter
