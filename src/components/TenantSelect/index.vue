<template>
  <el-dropdown split-button trigger="click" class="international" @command="handleSetTenant">
    <div>
      租户： {{ tenant.name || '无' }}
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="item in tenants" :key="item.id" :disabled="tenant.id===item.id" :command="item.id">
        {{ item.name }}
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
    }
  }
}
</script>
