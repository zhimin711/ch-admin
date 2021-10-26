<template>

  <el-dropdown split-button trigger="click" class="international" style="top: -18px; margin: 0 15px" @command="handleSetTenant">
    <div>
      租户： {{ tenant.label || '无' }}
    </div>
    <el-dropdown-menu v-if="tenants.length>0" slot="dropdown">
      <el-dropdown-item v-for="item in tenants" :key="item.value" :disabled="tenant.value===item.value" :command="item.value">
        {{ item.label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
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
      this.$confirm('切换租房将关闭所有标签页?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.$store.dispatch('user/setTenant', val)
          this.$message({
            message: this.$t('message.switchLanguage'),
            type: 'success'
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>
