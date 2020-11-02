/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const sysRouter = {
  path: '/project',
  component: Layout,
  redirect: '/project/project/code',
  alwaysShow: true, // will always show the root menu
  name: 'Platform Manager',
  meta: {
    title: '项目管理',
    icon: 'lock'
  },
  children: [
    {
      path: 'code',
      component: () => import('@/views/sys/project/code'),
      name: 'project code',
      meta: {
        title: '项目代码'
      }
    },
    {
      path: 'version',
      component: () => import('@/views/sys/project/version'),
      name: 'Version',
      meta: {
        title: '项目版本'
      }
    },
    {
      path: 'instance',
      component: () => import('@/views/sys/app/instance'),
      name: 'Instance',
      meta: {
        title: '应用实例'
      }
    },
    {
      path: 'logs',
      component: () => import('@/views/sys/app/logs'),
      name: 'App Logs',
      meta: {
        title: '应用日志'
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
