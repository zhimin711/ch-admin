/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'
import Blank from '@/layout/index2'

const sysRouter = {
  path: '/cloud',
  component: Layout,
  redirect: '/cloud/IaaS/database',
  alwaysShow: true, // will always show the root menu
  name: 'CloudPlatform',
  meta: {
    title: 'Cloud Platform',
    icon: 'lock'
  },
  children: [
    {
      path: 'IaaS',
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
        },
        {
          path: 'database/:id(\\d+)',
          component: () => import('@/views/sys/IaaS/datasource'),
          name: 'IaaSDatabaseEdit',
          hidden: true,
          meta: {
            title: '数据库管理',
            noCache: true,
            activeMenu: '/cloud/IaaS/database'
          }
        },
        {
          path: 'TableColumnRemark',
          component: () => import('@/views/sys/IaaS/TableColumnRemark/index'),
          name: 'SysTableColumnRemark',
          meta: {
            title: '业务-数据库列备注'
          }
        }
      ]
    },
    {
      path: 'project',
      redirect: '/cloud/project/order',
      component: Blank,
      alwaysShow: true,
      name: 'ProjectManagement',
      meta: {
        title: '项目管理',
        icon: 'lock'
      },
      children: [
        {
          path: 'order',
          component: () => import('@/views/sys/project/code'),
          name: 'ProjectOrder',
          meta: {
            title: 'Project Order'
          }
        },
        {
          path: 'version',
          component: () => import('@/views/sys/project/version'),
          name: 'ProjectVersion',
          meta: {
            title: '项目版本'
          }
        }
      ]
    },
    {
      path: 'tools',
      redirect: '/cloud/tools/gen',
      component: Blank,
      alwaysShow: true,
      name: 'CloudTools',
      meta: {
        title: '平台工具',
        icon: 'lock'
      },
      children: [
        {
          path: 'gen',
          component: () => import('@/views/sys/tools/gen'),
          name: 'CodeGen',
          meta: {
            title: '代码生成'
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

const routerMap = {
  Cloud: {
    path: '/cloud',
    component: Layout,
    redirect: '/cloud/project/code',
    alwaysShow: true, // will always show the root menu
    name: 'Cloud',
    meta: {
      title: 'Cloud Platform'
    }
  },
  IaaSManagement: {
    path: 'IaaS',
    redirect: '/cloud/IaaS/machine',
    component: Blank,
    alwaysShow: true,
    name: 'IaaSManagement',
    meta: {
      title: 'IaaS管理',
      icon: 'lock'
    }
  },
  IaaSHost: {
    path: 'host',
    component: () => import('@/views/sys/IaaS/host'),
    name: 'IaaSHost',
    meta: {
      title: '主机管理'
    }
  },
  IaaSDatabase: {
    path: 'database',
    component: () => import('@/views/sys/IaaS/database'),
    name: 'IaaSDatabase',
    meta: {
      title: 'Database'
    }
  },
  IaaSDataSource: {
    path: 'dataSource',
    component: () => import('@/views/sys/IaaS/datasource'),
    name: 'IaaSDatabase',
    meta: {
      title: 'DataSource'
    }
  }
}

export function getCloudRouter(code) {
  return routerMap[code]
}

export default sysRouter
