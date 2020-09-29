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
      path: 'namespace',
      component: () => import('@/views/nacos/namespace/index'),
      name: 'Nacos Namespace Manager',
      meta: {
        title: '命名空间'
      }
    },
    {
      path: 'configs',
      redirect: '/nacos/configs/index',
      component: Blank,
      name: 'Nacos Configs Manager',
      alwaysShow: true,
      meta: {
        title: '配置管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'index',
          component: () => import('@/views/nacos/configs/index'),
          name: 'NacosConfigs',
          meta: { title: '配置列表' }
        },
        {
          path: 'history',
          component: () => import('@/views/nacos/configs/history'),
          name: 'NacosConfigsHistory',
          meta: { title: '历史版本' }
        },
        {
          path: 'add',
          component: () => import('@/views/nacos/configs/add'),
          name: 'NacosConfigAdd',
          hidden: true,
          meta: { title: '添加配置', noCache: true }
        },
        {
          path: 'detail',
          component: () => import('@/views/nacos/configs/detail'),
          name: 'NacosConfigDetail',
          hidden: true,
          meta: { title: '配置详情', noCache: true }
        },
        {
          path: 'edit',
          component: () => import('@/views/nacos/configs/edit'),
          name: 'NacosConfigEdit',
          hidden: true,
          meta: { title: '修改配置', noCache: true }
        },
        {
          path: 'historyDetail',
          component: () => import('@/views/nacos/configs/historyDetail'),
          name: 'NacosConfigsHistoryDetail',
          hidden: true,
          meta: { title: '历史详情', noCache: true }
        },
        {
          path: 'rollback',
          component: () => import('@/views/nacos/configs/historyRollback'),
          name: 'NacosConfigsRollback',
          hidden: true,
          meta: { title: '配置回滚', noCache: true }
        },
        {
          path: 'listener',
          component: () => import('@/views/nacos/configs/listener'),
          name: 'NacosConfigsListener',
          meta: { title: '监听查询' }
        }
      ]
    },
    {
      path: 'services',
      redirect: '/nacos/services/publish',
      component: Blank,
      name: 'Services Manager',
      alwaysShow: true,
      meta: {
        title: '服务管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'publish',
          component: () => import('@/views/nacos/services/publish'),
          name: 'Nacos Publish List',
          meta: { title: '服务列表' }
        },
        {
          path: 'subscribe',
          component: () => import('@/views/nacos/services/subscribe'),
          name: 'Nacos Subscribe List',
          meta: { title: '订阅者列表' }
        }
      ]
    },
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
    }
  ]
}
export default router
