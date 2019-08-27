/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const txRouter = {
  path: '/tx',
  component: Layout,
  redirect: '/tx/cluster',
  name: 'Table',
  meta: {
    title: '事务管理',
    icon: 'table'
  },
  children: [
    {
      path: 'cluster',
      component: () => import('@/views/tx/index'),
      name: 'cluster',
      meta: { title: '集群信息' }
    },
    {
      path: 'service-list',
      component: () => import('@/views/tx/service-list'),
      name: 'serviceList',
      meta: { title: '服务列表' }
    },
    {
      path: 'compensate-list',
      component: () => import('@/views/tx/compensate-list'),
      name: 'compensateList',
      meta: { title: '事务补偿' }
    },
    {
      path: 'compensate-strategy',
      component: () => import('@/views/tx/compensate-strategy'),
      name: 'compensateStrategy',
      meta: { title: '事务策略' }
    }
  ]
}
export default txRouter
