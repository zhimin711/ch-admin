/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const canalRouter = {
  path: '/canal',
  component: Layout,
  redirect: '/canal/user',
  alwaysShow: true, // will always show the root menu
  name: 'User Permission Manager',
  meta: {
    title: '系统管理',
    icon: 'lock'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/upms/user'),
      name: 'User',
      meta: {
        title: '用户管理',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'role',
      component: () => import('@/views/upms/role'),
      name: 'Role',
      meta: {
        title: '角色管理',
        roles: ['admin']
      }
    },
    {
      path: 'permission',
      component: () => import('@/views/upms/permission'),
      name: 'Permission',
      meta: {
        title: '权限管理',
        roles: ['admin']
      }
    }/*,
    {
      path: 'directive',
      component: () => import('@/views/permission/directive'),
      name: 'DirectivePermission',
      meta: {
        title: 'Directive Permission'
        // if do not set roles, means: this page does not require permission
      }
    }*/
  ]
}

const routerMap = {
  Canal: {
    path: '/canal',
    component: Layout,
    redirect: '/canal/cluster',
    alwaysShow: true, // will always show the root menu
    name: 'User Permission Manager',
    meta: {
      title: '系统管理',
      icon: 'lock'
    }
  },
  CanalCluster: {
    path: 'cluster',
    component: () => import('@/views/canal/cluster/index'),
    name: 'CanalCluster',
    meta: {
      title: '用户管理'
    }
  },
  CanalServer: {
    path: 'server',
    component: () => import('@/views/canal/server/index'),
    name: 'CanalServer',
    meta: {
      title: '角色管理'
    }
  },
  CanalInstance: {
    path: 'instance',
    component: () => import('@/views/canal/instance/index'),
    name: 'CanalInstance',
    meta: {
      title: '权限管理'
    }
  },
  CanalAlarm: {
    path: 'alarm',
    component: () => import('@/views/canal/alarm'),
    name: 'CanalAlarm',
    meta: {
      title: '权限管理'
    }
  }
}

export function getCanalRouter(code) {
  return routerMap[code]
}

export default canalRouter
