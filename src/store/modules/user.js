import { login, logout, getInfo, getPermissions } from '@/api/login'
import { getUserTenants } from '@/api/upms/user'
import { getToken, setToken, removeToken, setExpired, removeExpired, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  refreshToken: getRefreshToken(),
  name: '',
  avatar: '',
  introduction: '',
  role: {},
  roles: [],
  permissions: [],
  tenant: {},
  tenants: [],
  project: '',
  namespace: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_REFRESH_TOKEN: (state, refreshToken) => {
    state.refreshToken = refreshToken
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_TENANT: (state, tenant) => {
    state.tenant = tenant
  },
  SET_TENANTS: (state, tenants) => {
    state.tenants = tenants
  },
  SET_PROJECT: (state, project) => {
    state.project = project
  },
  SET_NAMESPACE: (state, namespace) => {
    state.namespace = namespace
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, captchaCode } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password, captchaCode: captchaCode }).then(response => {
        if (response.success) {
          const { token, refreshToken, expireAt } = response.rows[0]
          commit('SET_TOKEN', token)
          commit('SET_REFRESH_TOKEN', refreshToken)
          setToken(token)
          setRefreshToken(refreshToken)
          setExpired(expireAt)
          resolve()
        } else {
          reject(response)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        if (!response.success) {
          return reject(response)
        }
        const { username, roleId, avatar, introduction, tenantId, tenantName } = response.rows[0]

        // roles must be a non-empty array
        if (!roleId || roleId <= 0) {
          return reject('未分配用户角色, 请联系管理员!')
        }
        commit('SET_ROLE', { id: roleId, code: '' })

        commit('SET_NAME', username)
        commit('SET_AVATAR', avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
        commit('SET_INTRODUCTION', introduction)
        commit('SET_TENANT', { id: tenantId, name: tenantName })
        resolve({ roleId: roleId })
      }).catch(error => {
        console.log('store/user.js getInfo error: ', error)
        reject(error)
      })
    })
  },

  // get user permissions
  getPermissions({ commit, state }, user) {
    return new Promise((resolve, reject) => {
      getPermissions(user).then(response => {
        if (!response.success) {
          return reject(response)
        }
        const { roleList, btnList, menuList, tenantList } = response.rows[0]

        // roles must be a non-empty array
        if (!roleList || roleList.length <= 0) {
          return reject('未分配用户角色!')
        }
        commit('SET_ROLES', roleList)
        commit('SET_PERMISSIONS', btnList)

        commit('SET_TENANTS', tenantList)
        resolve(menuList)
      }).catch(error => {
        console.log('store/user.js getPermissions error: ', error)
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.refreshToken).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_REFRESH_TOKEN', '')
        commit('SET_ROLE', {})
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
        removeRefreshToken()
        removeExpired()
        resetRouter()
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // refresh token
  refreshToken({ commit }, tokenInfo) {
    return new Promise(resolve => {
      const { token, expireAt } = tokenInfo
      commit('SET_TOKEN', token)
      setToken(token)
      setExpired(expireAt)
      resolve()
    })
  },

  // get user tenants
  getTenants({ commit }) {
    return new Promise(resolve => {
      getUserTenants().then(resp => {
        if (resp.success) {
          commit('SET_TENANT', resp.rows[0])
          commit('SET_TENANTS', resp.rows)
        }
        resolve()
      })
    })
  },

  // remove token
  removeToken({ commit, dispatch }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLE', {})
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      resetRouter()
      removeToken()
      dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    let accessRoutes = []
    if (role === '-1') {
      // const currRoles = state.roles.filter(item => { return item.id === role })
      // commit('SET_ROLE', currRoles[0])
      accessRoutes = await dispatch('permission/generateRoutes', [], { root: true })
    } else {
      const menuList = await dispatch('getPermissions', { roleId: role })

      // setToken(state.token)
      // const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
      accessRoutes = await dispatch('permission/assemblyRouters', menuList, { root: true })
    }

    return new Promise(resolve => {
      resetRouter()
      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },

  // set user tenant
  setTenant({ commit, dispatch }, tenant) {
    return new Promise(resolve => {
      commit('SET_TENANT', tenant)
      resetRouter()

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    })
  },

  // set user tenants
  setTenants({ commit }, tenants) {
    return new Promise(resolve => {
      commit('SET_TENANTS', tenants)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
