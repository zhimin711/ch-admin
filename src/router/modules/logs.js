/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const logsRouter = {
  path: '/logs',
  component: Layout,
  redirect: '/logs/login',
  alwaysShow: true, // will always show the root menu
  name: 'Logs',
  meta: {
    title: '日志管理',
    icon: 'lock'
  },
  children: [
    {
      path: 'login',
      component: () => import('@/views/logs/login'),
      name: 'Login',
      meta: {
        title: '登录日志'
      }
    },
    {
      path: 'operate',
      component: () => import('@/views/logs/operate'),
      name: 'Operate',
      meta: {
        title: '操作日志'
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
    name: 'Logs',
    meta: {
      title: '日志管理',
      icon: 'lock'
    }
  },
  LogsLogin: {
    path: 'login',
    component: () => import('@/views/logs/login'),
    name: 'Login',
    meta: {
      title: '登录日志'
    }
  },
  LogsOperate: {
    path: 'operate',
    component: () => import('@/views/logs/operate'),
    name: 'Operate',
    meta: {
      title: '操作日志'
    }
  }
}

export function getLogsRouter(code) {
  return routerMap[code]
}

export default logsRouter
