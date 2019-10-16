/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const sysRouter = {
  path: '/permission',
  component: Layout,
  redirect: '/permission/page',
  alwaysShow: true, // will always show the root menu
  name: 'Permission',
  meta: {
    title: '系统管理',
    icon: 'lock',
    roles: ['admin', 'editor'] // you can set roles in root nav
  },
  children: [
    {
      path: 'page',
      component: () => import('@/views/permission/page'),
      name: 'PagePermission',
      meta: {
        title: '用户管理',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'role',
      component: () => import('@/views/permission/role'),
      name: 'RolePermission',
      meta: {
        title: '角色管理',
        roles: ['admin']
      }
    },
    {
      path: 'role',
      component: () => import('@/views/permission/page'),
      name: 'RolePermission',
      meta: {
        title: '权限管理',
        roles: ['admin']
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
    }
  ]
}
export default sysRouter
