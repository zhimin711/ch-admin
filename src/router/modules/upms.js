/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const umpsRouter = {
  path: '/upms',
  component: Layout,
  redirect: '/upms/user',
  alwaysShow: true, // will always show the root menu
  name: 'UPMSManagement',
  meta: {
    code: 'systemManagement',
    icon: 'lock'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/upms/user'),
      name: 'UserManagement',
      meta: {
        code: 'userManagement'
      }
    },
    {
      path: 'role',
      component: () => import('@/views/upms/role'),
      name: 'RoleManagement',
      meta: {
        code: 'roleManagement'
      }
    },
    {
      path: 'permission',
      component: () => import('@/views/upms/permission'),
      name: 'PermissionManagement',
      meta: {
        code: 'permissionManagement'
      }
    },
    {
      path: 'swagger',
      component: () => import('@/views/swagger/index'),
      name: 'Swagger',
      meta: {
        title: 'Swagger'
      }
    },
    {
      path: 'tenant',
      component: () => import('@/views/upms/tenant'),
      name: 'Tenant',
      meta: {
        title: '租户管理'
      }
    }
  ]
}

const routerMap = {
  Upms: {
    path: '/upms',
    component: Layout,
    redirect: '/upms/user',
    alwaysShow: true, // will always show the root menu
    name: 'UPMSManagement',
    meta: {
      code: 'systemManagement'
    }
  },
  UpmsUser: {
    path: 'user',
    component: () => import('@/views/upms/user'),
    name: 'UpmsUserManagement',
    meta: {
      code: 'userManagement'
    }
  },
  UpmsRole: {
    path: 'role',
    component: () => import('@/views/upms/role'),
    name: 'UpmsRoleManagement',
    meta: {
      code: 'roleManagement'
    }
  },
  UpmsPermission: {
    path: 'permission',
    component: () => import('@/views/upms/permission'),
    name: 'UpmsPermissionManagement',
    meta: {
      code: 'permissionManagement'
    }
  },
  UpmsDepartment: {
    path: 'department',
    component: () => import('@/views/upms/department'),
    name: 'UpmsDepartmentManagement',
    meta: {
      code: 'departmentManagement'
    }
  },
  UpmsPosition: {
    path: 'position',
    component: () => import('@/views/upms/position'),
    name: 'UpmsPositionManagement',
    meta: {
      code: 'positionManagement'
    }
  },
  UpmsDict: {
    path: 'dict',
    component: () => import('@/views/upms/dict'),
    name: 'UpmsDictManagement',
    meta: {
      code: 'dictManagement'
    }
  },
  UpmsProject: {
    path: 'project',
    component: () => import('@/views/upms/project'),
    name: 'UpmsProjectManagement',
    meta: {
      code: 'projectManagement'
    }
  },
  UpmsTenant: {
    path: 'tenant',
    component: () => import('@/views/upms/tenant'),
    name: 'UpmsTenantManagement',
    meta: {
      code: 'tenantManagement'
    }
  }
}

export function getUpmsRouter(code) {
  return routerMap[code]
}

export default umpsRouter
