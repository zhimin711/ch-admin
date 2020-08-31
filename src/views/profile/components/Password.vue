<template>
  <el-form ref="recordForm" :model="record" label-width="100px" label-position="left" :rules="rules">
    <el-form-item label="原密码" prop="pwd1">
      <el-input v-model="record.pwd1" type="password" placeholder="请输入原密码" autocomplete="off" />
    </el-form-item>
    <el-form-item label="新密码" prop="pwd2">
      <el-input v-model="record.pwd2" type="password" placeholder="请输入新密码" autocomplete="off" />
    </el-form-item>
    <el-form-item label="确认新密码" prop="pwd3">
      <el-input v-model="record.pwd3" type="password" placeholder="请再次输入新密码" autocomplete="off" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loadingSubmit" @click="submit('recordForm')">修改</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { changePwd } from '@/api/upms/user'
export default {
  data() {
    // const checkAge = (rule, value, callback) => {
    //   if (!value) {
    //     return callback(new Error('年龄不能为空'))
    //   }
    //   setTimeout(() => {
    //     if (!Number.isInteger(value)) {
    //       callback(new Error('请输入数字值'))
    //     } else {
    //       if (value < 18) {
    //         callback(new Error('必须年满18岁'))
    //       } else {
    //         callback()
    //       }
    //     }
    //   }, 1000)
    // }
    const validatePass3 = (rule, value, callback) => {
      if (typeof value === 'undefined' || value === '') {
        callback(new Error('请输入当前密码'))
      } else {
        if (this.record.pwd2 !== '') {
          this.$refs.recordForm.validateField('pwd2')
        }
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (typeof value === 'undefined' || value === '') {
        callback(new Error('请输入新密码'))
      } else if (value.length < 6) {
        callback(new Error('新密码长度不成小于6位'))
      } else {
        if (value === this.record.pwd1) {
          callback(new Error('新密码不能与原密码相同'))
        } else if (this.record.pwd3 !== '') {
          this.$refs.recordForm.validateField('pwd3')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (typeof value === 'undefined' || value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.record.pwd2) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      loadingSubmit: false,
      record: {
        pwd1: '',
        pwd2: '',
        pwd3: ''
      },
      rules: {
        pwd1: [
          // { required: true, message: '请输入当前密码', trigger: 'blur' }
          { required: true, validator: validatePass3, trigger: 'blur' }
        ],
        pwd2: [
          { validator: validatePass, trigger: 'blur' }
        ],
        pwd3: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit(formName) {
      const _this = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          _this.loadingSubmit = true
          changePwd({ key: _this.record.pwd1, value: _this.record.pwd2 }).then(resp => {
            _this.loadingSubmit = false
            if (resp.success) {
              _this.record = {}
              this.$message({
                message: '修改密码成功！',
                type: 'success',
                duration: 5 * 1000
              })
            }
          }).catch(() => { _this.loadingSubmit = false })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
