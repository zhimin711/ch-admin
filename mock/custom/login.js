
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    username: 'admin',
    roleList: [{ name: 'admin', code: 'admin', id: 0 }],
    menuList: [],
    btnList: [],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

module.exports = [
  // user login
  {
    url: '/vue-element-admin/login/token/access',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: '304',
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 20000,
        success: true,
        rows: [ { token: token.token, refreshToken: token.token} ]
      }
    }
  },

  // get user info
  {
    url: '/vue-element-admin/login/token/user\.*',
    type: 'get',
    response: config => {
      const token = config.headers['x-token']
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.' + token
        }
      }

      return {
        success: true,
        code: 20000,
        rows: [info]
      }
    }
  },

  // user logout
  {
    url: '/vue-element-admin/logout/token',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
