/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const orgRouter = {
  path: '/org',
  component: Layout,
  redirect: '/org/department',
  alwaysShow: true, // will always show the root menu
  name: 'OrgManagement',
  meta: {
    code: 'orgManagement',
    icon: 'lock'
  },
  children: [
  ]
}

const routerMap = {
  Org: {
    path: '/org',
    component: Layout,
    redirect: '/org/department',
    alwaysShow: true, // will always show the root menu
    name: 'OrgManagement',
    meta: {
      code: 'orgManagement'
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
  },
  UpmsNamespace: {
    path: 'namespace',
    component: () => import('@/views/upms/namespace'),
    name: 'UpmsNamespaceManagement',
    meta: {
      code: 'namespaceManagement'
    }
  }
}

export function getOrgRouter(code) {
  return routerMap[code]
}

export default orgRouter
