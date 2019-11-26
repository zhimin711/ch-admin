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
    }
  ]
}
export default kafkaRouter
