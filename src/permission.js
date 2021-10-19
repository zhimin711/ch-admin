import router from './router'
import store from './store'
import { MessageBox } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        if (to.matched.length === 0) {
          next('/404') // 判断此跳转路由的来源路由是否存在，存在的情况跳转到来源路由，否则跳转到404页面
        } else {
          convertRoute(to)
          next()
        }
      } else {
        try {
          // get user info
          const menuList = await store.dispatch('user/getInfo')

          // const accessRoutes = await store.dispatch('permission/generateRoutes', roleList)
          const accessRoutes = await store.dispatch('permission/assemblyRouters', menuList)
          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          convertRoute(to)
          next({ ...to, replace: true })
        } catch (error) {
          NProgress.done()
          console.log('src/permission.js router.beforeEach error ==> ' + JSON.stringify(error))
          if (error.code === 'ECONNABORTED') {
            MessageBox.alert('连接超时，请刷新重试...', '超时', {
              confirmButtonText: '刷新',
              callback: () => {
                location.reload()
              }
            })
          } else if (error.code === '307' || error.code === '304' || error.data && error.data.code === '307') {
            // to re-login
            MessageBox.alert('登录已失效,请重新登录', '登录过期', {
              confirmButtonText: '重新登录',
              callback: () => {
                store.dispatch('user/removeToken').then(() => {
                  next(`/login?redirect=${to.path}`)
                })
              }
            })
          } else if (error.response && error.response.data && error.response.data.status === 500) {
            // MessageBox.alert(error.response.data.message || '服务错误，请联系管理员')
            MessageBox.alert(error.response.data.message || '服务内部错误，请联系管理员', '服务错误', {
              confirmButtonText: '重新登录',
              callback: () => {
                store.dispatch('user/removeToken').then(() => {
                  next(`/login?redirect=${to.path}`)
                })
              }
            })
          }
          // remove token and go to login page to re-login
          // await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          // next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

function convertRoute(to) {
  if (to.meta && to.meta.noCache) {
    return
  }
  if (to.matched && to.matched.length > 2) {
    for (let i = 0; i < to.matched.length; i++) {
      const element = to.matched[i]
      if (element.components.default.name === 'Blank') {
        to.matched.splice(i, 1)
      }
    }
  }
}

router.afterEach(() => {
  const hasToken = getToken()
  if (hasToken) store.dispatch('user/getTenants')
  // finish progress bar
  NProgress.done()
})
