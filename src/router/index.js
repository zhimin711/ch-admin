import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import upmsRouter from './modules/upms'
import sysRouter from './modules/sys'
import kafkaRouter from './modules/kafka'
import wikiRouter from './modules/wiki'

import componentsRouter from './modules/components'
import tableRouter from './modules/table'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人资料', icon: 'user', noCache: true }
      }
    ]
  }
  // 404 page must be placed at the end !!!
  // ,{ path: '*', redirect: '/404', hidden: true }
]

/**
 * exampleRoutes
 * the routes example
 */
export const exampleRoutes = [
  componentsRouter,
  tableRouter,

  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },

  {
    path: '/error-log',
    component: Layout,
    children: [
      {
        path: 'log',
        component: () => import('@/views/error-log/index'),
        name: 'ErrorLog',
        meta: { title: 'Error Log', icon: 'bug' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  upmsRouter,
  sysRouter,
  kafkaRouter,
  wikiRouter
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export function assemblyAsyncRoutes(menus, basePath) {
  const res = []
  // const path = basePath || ''
  const isStart = !basePath
  menus.forEach(menu => {
    let tmp = {}
    let path = menu.url
    let path2 = menu.url
    if (isStart) path = '/' + menu.url
    else path2 = basePath + '/' + menu.url
    if (menu.type === '2') {
      tmp = {
        path: path,
        // component: () => import('@/views' + path + '/' + menu.url),
        // component: resolve => require(['@/views/' + path2], resolve),
        name: menu.code,
        meta: { title: menu.name }
      }
      if (menu.children && menu.children.length > 0) {
        tmp.component = loadViewIndex(path2)
        tmp.children = assemblyAsyncRoutes(menu.children, path2)
      } else {
        tmp.component = loadView(path2)
      }
    } else if (menu.type === '4') {
      tmp = {
        path: menu.redirect || path,
        component: loadView(path2),
        name: menu.code,
        hidden: true,
        meta: { title: menu.name, noCache: true, activeMenu: '/' + basePath }
      }
    } else {
      tmp = {
        path: path,
        alwaysShow: true,
        component: resolve => require(['@/layout/index2'], resolve),
        redirect: menu.redirect || path,
        meta: { title: menu.name, icon: menu.icon || 'nested' }
      }
      if (isStart) {
        tmp.component = Layout
      }
      if (menu.children && menu.children.length > 0) {
        tmp.children = assemblyAsyncRoutes(menu.children, path2)
        let hMenus = []
        tmp.children.forEach(e => {
          if (!e.redirect && e.children && e.children.length > 0) {
            hMenus = hMenus.concat(e.children)
            e.children = undefined
          }
        })
        if (hMenus.length > 0) {
          tmp.children = tmp.children.concat(hMenus)
        }
      }
    }
    res.push(tmp)
  })

  // 404 page must be placed at the end !!!
  return res
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/${view}`], resolve)
}

export const loadViewIndex = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/${view}/index`], resolve)
}

export default router
