/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const kafkaRouter = {
  path: '/kafka',
  component: Layout,
  redirect: '/kafka/cluster',
  alwaysShow: true, // will always show the root menu
  name: 'Kafka Management',
  meta: {
    code: 'kafkaManagement',
    title: 'Kafka管理',
    icon: 'lock'
  },
  children: [
    {
      path: 'cluster',
      component: () => import('@/views/kafka/cluster'),
      name: 'KafkaCluster',
      meta: {
        code: 'clusterManagement',
        title: '集群管理'
      }
    },
    {
      path: 'topic',
      component: () => import('@/views/kafka/topic'),
      name: 'KafkaTopic',
      meta: {
        code: 'topicManagement',
        title: '主题管理'
      }
    },
    {
      path: 'content',
      component: () => import('@/views/devops/kafka/content'),
      name: 'KafkaContent',
      meta: {
        code: 'messageSearch'
      }
    },
    {
      path: 'mock',
      component: () => import('@/views/kafka/mocker'),
      name: 'KafkaMock',
      meta: {
        code: 'mockData'
      }
    },
    {
      path: 'mockGPS',
      component: () => import('@/views/kafka/mockGPS'),
      name: 'KafkaGPSMock',
      meta: {
        title: 'Mock GPS'
      }
    },
    {
      path: 'dubbo',
      component: () => import('@/views/kafka/dubboCall'),
      name: 'DubboCall',
      meta: {
        code: 'dubboCall'
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
    name: 'KafkaManagement',
    meta: {
      code: 'kafkaManagement',
      icon: 'lock'
    }
  },
  KafkaCluster: {
    path: 'cluster',
    component: () => import('@/views/devops/kafka/cluster'),
    name: 'KafkaCluster',
    meta: {
      code: 'clusterManagement'
    }
  },
  KafkaClusterMGR: {
    path: '/kafka/cluster/mgr/:id(\\d+)',
    component: () => import('@/views/devops/kafka/mgr'),
    name: 'KafkaClusterMgr',
    hidden: true,
    meta: {
      title: 'Kafka集群配置',
      noCache: true,
      activeMenu: '/kafka/cluster'
    }
  },
  KafkaContent: {
    path: 'content',
    component: () => import('@/views/devops/kafka/content'),
    name: 'KafkaContent',
    meta: {
      code: 'messageSearch'
    }
  },
  /*  KafkaTopic: {
    path: 'topic',
    component: () => import('@/views/kafka/topic'),
    name: 'KafkaTopic',
    meta: {
      code: 'topicManagement'
    }
  },*/
  KafkaMocker: {
    path: 'mock',
    component: () => import('@/views/kafka/mocker'),
    name: 'KafkaMocker',
    meta: {
      code: 'mockData'
    }
  },
  DubboCall: {
    path: 'dubbo',
    component: () => import('@/views/kafka/dubboCall'),
    name: 'DubboCall',
    meta: {
      code: 'dubboCall'
    }
  },
  MockGPS: {
    path: 'MockGPS',
    component: () => import('@/views/kafka/mockGPS'),
    name: 'MockGPS',
    meta: {
      title: 'MockGPS'
    }
  }
}

export function getKafkaRouter(code) {
  return routerMap[code]
}

export default kafkaRouter
