<template>
  <el-dropdown split-button trigger="click" class="international" @command="handleSetTenant">
    <div>
      [租户] {{ tenant.name || '无' }}
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="item in tenants" :key="item.id" :disabled="tenant.id===item.id" :command="item.id">
        {{ item.name }}<span v-if="tenant.id===item.id" style="color: #03A9F4">  [当前]</span>
      </el-dropdown-item>
      <el-dropdown-item divided command="0">设置当前为默认租户</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>

import { changeTenant } from '@/api/upms/user'

export default {
  computed: {
    tenant() {
      return this.$store.getters.tenant
    },
    tenants() {
      return this.$store.getters.tenants
    }
  },
  methods: {
    handleSetTenant(val) {
      if (val === '0' || val === 0) {
        this.setDefaultTenant()
        return
      }
      this.$confirm('切换租户将当前关闭所有标签页?', '' + this.$t('label.tip'), {
        confirmButtonText: this.$t('btn._confirm'),
        cancelButtonText: this.$t('btn._cancel'),
        type: 'warning'
      })
        .then(async() => {
          await this.$store.dispatch('user/setTenant', val)
          this.$message({
            message: this.$t('message.switchTenant'),
            type: 'success'
          })
          this.$router.push({ path: '/' })
        })
        .catch(err => { console.error(err) })
    },
    setDefaultTenant() {
      this.$confirm('是否确认将当前租户设置为默认租户?', '' + this.$t('label.tip'), {
        confirmButtonText: this.$t('btn._confirm'),
        cancelButtonText: this.$t('btn._cancel'),
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.setDefault = true
          params.id = this.tenant.id
          changeTenant(params).then(resp => {
            if (resp.success) {
              this.$message({
                message: '设置默认租户成功',
                type: 'success'
              })
            }
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>
