/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'
import Blank from '@/layout/index2'

const sysRouter = {
  path: '/cloud',
  component: Layout,
  redirect: '/cloud/project/code',
  alwaysShow: true, // will always show the root menu
  name: 'CloudPlatform',
  meta: {
    title: 'Cloud Platform',
    icon: 'lock'
  },
  children: [
    {
      path: 'IaaS',
      redirect: '/cloud/IaaS/machine',
      component: Blank,
      alwaysShow: true,
      name: 'IaaS Management',
      meta: {
        title: 'IaaS管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'host',
          component: () => import('@/views/sys/IaaS/host'),
          name: 'IaaSHost',
          meta: {
            title: '主机管理'
          }
        },
        {
          path: 'database',
          component: () => import('@/views/sys/IaaS/database'),
          name: 'IaaSDatabase',
          meta: {
            title: 'Database'
          }
        }
      ]
    }, {
      path: 'project',
      redirect: '/cloud/project/code',
      component: Blank,
      alwaysShow: true,
      name: 'WikiBase',
      meta: {
        title: '项目管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'user',
          component: () => import('@/views/sys/project/code'),
          name: 'WikiUser',
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
        }
      ]
    }
    /* {
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
    },
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
