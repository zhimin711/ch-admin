/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'
import Blank from '@/layout/index2'

const router = {
  path: '/nacos',
  component: Layout,
  redirect: '/nacos/cluster/nodes',
  alwaysShow: true, // will always show the root menu
  name: 'Nacos Manager',
  meta: {
    title: 'Nacos管理',
    icon: 'lock',
    roles: ['admin', 'editor'] // you can set roles in root nav
  },
  children: [
    {
      path: 'cluster',
      redirect: '/nacos/cluster/nodes',
      component: Blank,
      name: 'Cluster Manager',
      alwaysShow: true,
      meta: {
        title: '集群管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'nodes',
          component: () => import('@/views/nacos/cluster/index'),
          name: 'Node List',
          meta: { title: '节点列表' }
        }
      ]
    },
    {
      path: 'namespace',
      component: () => import('@/views/nacos/namespace/index'),
      name: 'Namespace Manager',
      meta: {
        title: '命名空间'
      }
    }
  ]
}
export default router
