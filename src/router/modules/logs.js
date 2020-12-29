/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const logsRouter = {
  path: '/logs',
  component: Layout,
  redirect: '/logs/login',
  alwaysShow: true, // will always show the root menu
  name: 'LogManagement',
  meta: {
    code: 'logManagement',
    icon: 'lock'
  },
  children: [
    {
      path: 'login',
      component: () => import('@/views/logs/login'),
      name: 'LoginLog',
      meta: {
        code: 'loginLog'
      }
    },
    {
      path: 'operate',
      component: () => import('@/views/logs/operate'),
      name: 'OperateLog',
      meta: {
        code: 'operateLog'
      }
    }
  ]
}

const routerMap = {
  Logs: {
    path: '/logs',
    component: Layout,
    redirect: '/logs/login',
    alwaysShow: true, // will always show the root menu
    name: 'LogManagement',
    meta: {
      code: 'logManagement'
    }
  },
  LogsLogin: {
    path: 'login',
    component: () => import('@/views/logs/login'),
    name: 'LoginLog',
    meta: {
      code: 'loginLog'
    }
  },
  LogsOperate: {
    path: 'operate',
    component: () => import('@/views/logs/operate'),
    name: 'OperateLog',
    meta: {
      code: 'operateLog'
    }
  }
}

export function getLogsRouter(code) {
  return routerMap[code]
}

export default logsRouter
