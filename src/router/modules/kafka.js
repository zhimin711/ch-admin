/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const kafkaRouter = {
  path: '/kafka',
  component: Layout,
  redirect: '/kafka/cluster',
  alwaysShow: true, // will always show the root menu
  name: 'Kafka Manager',
  meta: {
    title: 'Kafka管理',
    icon: 'lock'
  },
  children: [
    {
      path: 'cluster',
      component: () => import('@/views/kafka/cluster'),
      name: 'Cluster',
      meta: {
        title: '集群管理'
      }
    },
    {
      path: 'topic',
      component: () => import('@/views/kafka/topic'),
      name: 'Topic',
      meta: {
        title: '主题管理'
      }
    },
    {
      path: 'content',
      component: () => import('@/views/kafka/content'),
      name: 'Content',
      meta: {
        title: '消息搜索'
      }
    },
    {
      path: 'mock',
      component: () => import('@/views/kafka/mocker'),
      name: 'Mocker',
      meta: {
        title: 'Mock数据'
      }
    },
    {
      path: 'dubbo',
      component: () => import('@/views/kafka/dubboCall'),
      name: 'DubboCall',
      meta: {
        title: 'Dubbo接口测试'
      }
    }
  ]
}

const routerMap = {
  Kafka: {
    path: '/kafka',
    component: Layout,
    redirect: '/kafka/cluster',
    alwaysShow: true, // will always show the root menu
    name: 'Kafka Manager',
    meta: {
      title: '系统管理',
      icon: 'lock'
    }
  },
  KafkaCluster: {
    path: 'cluster',
    component: () => import('@/views/kafka/cluster'),
    name: 'CanalCluster',
    meta: {
      title: '用户管理'
    }
  },
  KafkaContent: {
    path: 'content',
    component: () => import('@/views/kafka/content'),
    name: 'KafkaContent',
    meta: {
      title: '角色管理'
    }
  },
  KafkaTopic: {
    path: 'topic',
    component: () => import('@/views/kafka/topic'),
    name: 'KafkaTopic',
    meta: {
      title: '权限管理'
    }
  },
  KafkaMocker: {
    path: 'mock',
    component: () => import('@/views/kafka/mocker'),
    name: 'Mocker',
    meta: {
      title: 'Mock数据'
    }
  },
  DubboCall: {
    path: 'dubbo',
    component: () => import('@/views/kafka/content'),
    name: 'DubboCall',
    meta: {
      title: 'Dubbo接口测试'
    }
  }
}

export function getKafkaRouter(code) {
  return routerMap[code]
}

export default kafkaRouter
