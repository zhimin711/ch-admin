import { login, logout, getInfo } from '@/api/login'
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
  permissions: []
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
  getInfo({ commit, state }, role) {
    return new Promise((resolve, reject) => {
      getInfo(role || 0).then(response => {
        if (!response.success) {
          return reject(response)
        }
        const { username, token, avatar, introduction, roleList, btnList, menuList } = response.rows[0]

        // roles must be a non-empty array
        if (!roleList || roleList.length <= 0) {
          return reject('未分配用户角色!')
        }
        const currRoles = roleList.filter(item => { return item.id === role })
        let currRole = roleList[0]
        if (currRoles.length > 0) {
          currRole = currRoles[0]
        }
        if (token) {
          commit('SET_TOKEN', token)
        }
        commit('SET_ROLE', currRole)
        commit('SET_ROLES', roleList)
        commit('SET_PERMISSIONS', btnList)

        commit('SET_NAME', username)
        commit('SET_AVATAR', avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
        commit('SET_INTRODUCTION', introduction)
        resolve(menuList)
      }).catch(error => {
        console.log('store/user.js getInfo error: ', error)
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
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      resetRouter()
      let accessRoutes = []
      if (role === -1) {
        const currRoles = state.roles.filter(item => { return item.id === role })
        commit('SET_ROLE', currRoles[0])
        accessRoutes = await dispatch('permission/generateRoutes', [], { root: true })
      } else {
        const { menuList } = await dispatch('getInfo', role)

        setToken(state.token)
        // generate accessible routes map based on roles
        // const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
        accessRoutes = await dispatch('permission/assemblyRouters', menuList, { root: true })
      }
      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

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
