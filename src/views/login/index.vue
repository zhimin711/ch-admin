<template>
  <div class="login-bg-simple">
    <div class="login-illustration-bg">
      <!-- 免费SVG插画，unDraw风格，可替换 -->
      <svg width="340" height="220" viewBox="0 0 800 520" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="650" cy="480" rx="120" ry="40" fill="#a5b4fc" opacity="0.18" />
        <rect x="540" y="320" width="180" height="120" rx="24" fill="#fff" />
        <rect x="570" y="350" width="120" height="20" rx="8" fill="#a5b4fc" />
        <rect x="570" y="380" width="80" height="16" rx="8" fill="#c7d2fe" />
        <rect x="570" y="410" width="100" height="16" rx="8" fill="#c7d2fe" />
        <circle cx="660" cy="450" r="12" fill="#6366f1" />
        <circle cx="700" cy="450" r="12" fill="#6366f1" opacity="0.5" />
        <path d="M600 420c0-30 60-30 60 0s60 30 60 0" stroke="#6366f1" stroke-width="6" fill="none" />
      </svg>
    </div>
    <div class="login-card-simple">
      <div class="login-logo-simple">
        <!-- <img v-if="logoExists" src="@/assets/logo.jpg" alt="logo" class="logo-img-simple"> -->
        <span>{{ defaultSettings.title }}</span>
      </div>
      <!-- <h3 class="login-title-simple">欢迎登录 {{ defaultSettings.title }}</h3> -->
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form-simple" autocomplete="on" label-position="left">
        <el-form-item prop="username">
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="用户名"
            name="username"
            type="text"
            tabindex="1"
            autocomplete="on"
            clearable
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
          <el-form-item prop="password">
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="密码"
              name="password"
              tabindex="2"
              autocomplete="on"
              prefix-icon="el-icon-lock"
              @keyup.native="checkCapslock"
              @blur="capsTooltip = false"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd-simple" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
        </el-tooltip>
        <Verify
          ref="verify"
          :mode="'pop'"
          :captcha-type="'blockPuzzle'"
          :img-size="{ width: '330px', height: '155px' }"
          @success="success"
        />
        <el-button :loading="loading" type="primary" class="login-btn-simple" @click.native.prevent="handleLogin">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import defaultSettings from '@/settings'
import Verify from '@/components/Verification/Verify'
import { getRefreshToken } from '@/utils/auth'
import { isEmpty } from '@/utils/validate'

export default {
  name: 'Login',
  components: { Verify },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    const validateCaptchaCode = (rule, value, callback) => {
      if (value.length !== 4) {
        callback(new Error('The verify code must be equals 4 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        captchaCode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        captchaCode: [{ required: true, trigger: 'blur', validator: validateCaptchaCode }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  computed: {
    defaultSettings() {
      return defaultSettings
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
    this.try2Dashboard()
    window.addEventListener('keyup', this.enterKey)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
    // 得到验证码图片
    // this.changeCode()
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
    window.removeEventListener('keyup', this.enterKey)
  },
  methods: {
    try2Dashboard() {
      const refreshToken = getRefreshToken()
      if (!isEmpty(refreshToken)) {
        // this.$router.push({ path: '/dashboard' })
        this.$nextTick(() => {
          this.$router.push({
            path: '/dashboard'
          })
        })
      }
    },
    login({ captchaVerification }) {
      this.loading = true
      this.loginForm.captchaCode = captchaVerification
      // this.loginForm.captchaVerification = captchaVerification
      this.$store.dispatch('user/login', this.loginForm)
        .then(() => {
          this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
          this.loading = false
        })
        .catch(error => {
          // 添加 shake 动画
          const formEl = this.$refs.loginForm && this.$refs.loginForm.$el
          if (formEl) {
            formEl.classList.remove('shake') // 防止多次叠加
            // 触发重绘，保证动画能重复触发
            void formEl.offsetWidth
            formEl.classList.add('shake')
            setTimeout(() => {
              formEl.classList.remove('shake')
            }, 500)
          }
          this.$message.error(`${error.message}!`)
          this.loading = false
          if (this.$refs.verify.mode === 'fixed') {
            setTimeout(() => {
              this.$refs.verify.refresh()
            }, 1000)
          }
        })
    },
    success(params) {
      // params 返回的二次验证参数
      this.login(params)
    },
    enterKey(event) {
      const code = event.keyCode || event.which || event.charCode
      if (code === 13) {
        this.handleLogin()
      }
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$refs.verify.show()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    getCaptchaKey() {
      // let random = Math.random()
      return Math.random().toString(36).substring(2)
      // return ''
    },
    changeCode() {
      const captchaKey = this.getCaptchaKey()
      this.loginForm.captchaKey = captchaKey
      this.$refs.code.setAttribute('src', process.env.VUE_APP_API + '/auth/login/captcha?captchaKey=' + captchaKey)
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
.login-bg-simple {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #a5b4fc 100%);
  position: relative;
  overflow: hidden;
}
.login-illustration-bg {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.95;
}
.login-card-simple {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(31, 38, 135, 0.06);
  padding: 48px 36px 36px 36px;
  min-width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.login-logo-simple {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  .logo-img-simple {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    margin-right: 8px;
  }
  span {
    font-size: 22px;
    font-weight: bold;
    color: #222;
  }
}
.login-title-simple {
  font-size: 20px;
  color: #222;
  margin-bottom: 32px;
  text-align: center;
  font-weight: 500;
}
.login-form-simple {
  width: 100%;
  .el-form-item {
    margin-bottom: 24px;
    position: relative;
  }
  .el-input__inner {
    border-radius: 8px;
    height: 44px;
    font-size: 16px;
  }
  .show-pwd-simple {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: #b0b3b8;
    cursor: pointer;
    user-select: none;
    z-index: 3;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    &:hover {
      color: #6366f1;
    }
  }
}
.login-btn-simple {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 8px;
  letter-spacing: 2px;
}
@media (max-width: 600px) {
  .login-card-simple {
    padding: 24px 4vw 16px 4vw;
    min-width: unset;
  }
  .login-title-simple {
    font-size: 18px;
  }
}
@media (max-width: 900px) {
  .login-illustration-bg {
    display: none;
  }
}
</style>
