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
      component: () => import('@/views/nacos/tenant/namespace'),
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
          path: 'detail',
          component: () => import('@/views/nacos/services/serviceDetail'),
          name: 'NacosDerviceDetail',
          hidden: true,
          meta: { title: '服务详情', noCache: true }
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

const routerMap = {
  Nacos: {
    path: '/nacos',
    component: Layout,
    redirect: '/nacos/cluster/nodes',
    alwaysShow: true, // will always show the root menu
    name: 'Nacos',
    meta: {
      title: 'Nacos管理',
      icon: 'lock'
    }
  },
  NacosTetant: {
    path: 'tenant',
    component: Blank,
    alwaysShow: true,
    name: 'NacosTenant',
    meta: {
      icon: 'lock',
      title: '租户管理'
    }
  },
  NacosClusterNamespace: {
    path: 'namespace',
    component: () => import('@/views/nacos/tenant/namespace'),
    name: 'NacosTenantNamespace',
    meta: {
      title: '命名空间'
    }
  },
  NacosProjectNamespaces: {
    path: 'projects',
    component: () => import('@/views/nacos/tenant/project'),
    name: 'NacosProjectNamespaces',
    meta: {
      title: '项目空间'
    }
  },
  NacosProjectApply: {
    path: 'apply',
    component: () => import('@/views/nacos/tenant/apply'),
    name: 'NacosProjectApply',
    meta: {
      title: '申请审核'
    }
  },
  NacosConfigs: {
    path: 'configs',
    redirect: '/nacos/configs/index',
    component: Blank,
    name: 'NacosConfigs',
    alwaysShow: true,
    meta: {
      title: '配置管理',
      icon: 'lock'
    }
  },
  NacosConfigsIndex: {
    path: 'index',
    component: () => import('@/views/nacos/configs/index'),
    name: 'NacosConfigsIndex',
    meta: { title: '配置列表' }
  },
  NacosConfigsHistory: {
    path: 'history',
    component: () => import('@/views/nacos/configs/history'),
    name: 'NacosConfigsHistory',
    meta: { title: '历史版本' }
  },
  NacosConfigAdd: {
    path: 'add',
    component: () => import('@/views/nacos/configs/add'),
    name: 'NacosConfigAdd',
    hidden: true,
    meta: { title: '添加配置', noCache: true }
  },
  NacosConfigDetail: {
    path: 'detail',
    component: () => import('@/views/nacos/configs/detail'),
    name: 'NacosConfigDetail',
    hidden: true,
    meta: { title: '配置详情', noCache: true }
  },
  NacosConfigEdit: {
    path: 'edit',
    component: () => import('@/views/nacos/configs/edit'),
    name: 'NacosConfigEdit',
    hidden: true,
    meta: { title: '修改配置', noCache: true }
  },
  NacosConfigHistory: {
    path: 'historyDetail',
    component: () => import('@/views/nacos/configs/historyDetail'),
    name: 'NacosConfigHistory',
    hidden: true,
    meta: { title: '历史详情', noCache: true }
  },
  NacosConfigRollback: {
    path: 'rollback',
    component: () => import('@/views/nacos/configs/historyRollback'),
    name: 'NacosConfigRollback',
    hidden: true,
    meta: { title: '配置回滚', noCache: true }
  },
  NacosConfigsListener: {
    path: 'listener',
    component: () => import('@/views/nacos/configs/listener'),
    name: 'NacosConfigsListener',
    meta: { title: '监听查询' }
  },
  NacosCluster: {
    path: 'cluster',
    redirect: '/nacos/cluster/nodes',
    component: Blank,
    name: 'NacosCluster',
    alwaysShow: true,
    meta: {
      title: '集群管理',
      icon: 'lock'
    }
  },
  NacosClusterNodes: {
    path: 'nodes',
    component: () => import('@/views/nacos/cluster/index'),
    name: 'NacosClusterNodes',
    meta: { title: '节点列表' }
  },
  NacosServices: {
    path: 'services',
    redirect: '/nacos/services/publish',
    component: Blank,
    name: 'NacosServices',
    alwaysShow: true,
    meta: {
      title: '服务管理',
      icon: 'lock'
    }
  },
  NacosServicesIndex: {
    path: 'publish',
    component: () => import('@/views/nacos/services/publish'),
    name: 'NacosServicesIndex',
    meta: { title: '服务列表' }
  },
  NacosServiceDetail: {
    path: 'detail',
    component: () => import('@/views/nacos/services/serviceDetail'),
    name: 'NacosServiceDetail',
    hidden: true,
    meta: { title: '服务详情', noCache: true }
  },
  NacosServiceSubscribes: {
    path: 'subscribe',
    component: () => import('@/views/nacos/services/subscribe'),
    name: 'NacosServiceSubscribes',
    meta: { title: '订阅者列表' }
  },
  NacosProjectConfigs: {
    path: 'project',
    redirect: '/nacos/project/configs/index',
    component: Blank,
    name: 'NacosProjectConfigs',
    alwaysShow: true,
    meta: {
      title: '应用配置管理',
      icon: 'lock'
    }
  },
  NacosProjectConfigsIndex: {
    path: 'index',
    component: () => import('@/views/nacos/app-configs/index'),
    name: 'NacosProjectConfigsIndex',
    meta: { title: '应用配置列表' }
  },
  NacosProjectConfigAdd: {
    path: 'configAdd',
    component: () => import('@/views/nacos/app-configs/add'),
    name: 'NacosProjectConfigAdd',
    hidden: true,
    meta: { title: '添加应用配置', noCache: true }
  },
  NacosProjectConfigDetail: {
    path: 'configDetail',
    component: () => import('@/views/nacos/app-configs/detail'),
    name: 'NacosProjectConfigDetail',
    hidden: true,
    meta: { title: '应用配置详情', noCache: true }
  },
  NacosProjectConfigEdit: {
    path: 'configEdit',
    component: () => import('@/views/nacos/app-configs/edit'),
    name: 'NacosProjectConfigEdit',
    hidden: true,
    meta: { title: '修改应用配置', noCache: true }
  }
}
export function getNacosRouter(code) {
  return routerMap[code]
}

export default router
