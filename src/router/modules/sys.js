/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const sysRouter = {
  path: '/sys',
  component: Layout,
  redirect: '/sys/project/code',
  alwaysShow: true, // will always show the root menu
  name: 'Platform Manager',
  meta: {
    title: '系统管理',
    icon: 'lock',
    roles: ['admin', 'editor'] // you can set roles in root nav
  },
  children: [
    {
      path: 'code',
      component: () => import('@/views/sys/project/code'),
      name: 'User',
      meta: {
        title: '项目代码',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'version',
      component: () => import('@/views/sys/project/version'),
      name: 'Version',
      meta: {
        title: '项目版本',
        roles: ['admin']
      }
    },
    {
      path: 'instance',
      component: () => import('@/views/sys/app/instance'),
      name: 'Instance',
      meta: {
        title: '应用实例',
        roles: ['admin']
      }
    },
    {
      path: 'logs',
      component: () => import('@/views/sys/app/logs'),
      name: 'Logs',
      meta: {
        title: '应用日志',
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
export default sysRouter
