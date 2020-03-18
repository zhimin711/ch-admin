import router from './router'
import store from './store'
import { Message, MessageBox } from 'element-ui'
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
      next({ path: '/dashboard' })
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { menuList } = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles
          // const accessRoutes = await store.dispatch('permission/generateRoutes', roleList)
          const accessRoutes = await store.dispatch('permission/assemblyRouters', menuList)
          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          NProgress.done()
          console.log('router ==> ' + JSON.stringify(error))
          if (error != null) {
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
                  store.dispatch('user/resetToken').then(() => {
                    next(`/login?redirect=${to.path}`)
                  })
                }
              })
            }
          } else {
            Message.error(error || 'Has Error')
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

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
