<template>
  <el-row>
    <div class="head-container">
      <el-input
        v-model="projectName"
        :placeholder="$t('input.tips.projectName')"
        clearable
        size="small"
        prefix-icon="el-icon-search"
        style="margin-bottom: 20px"
      />
    </div>
    <div class="head-container">
      <el-tree
        ref="tree"
        :data="projects"
        :expand-on-click-node="false"
        :filter-node-method="filterProjects"
        default-expand-all
        @node-click="handleProjectClick"
      />
    </div>
  </el-row>
</template>

<script>
import { getUserTenantProjects } from '@/api/upms/user'
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      projectName: '',
      projects: []
    }
  },
  computed: {
    tenant: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    filterProjects(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleProjectClick(data) {
      // this.projects = data.value
      // this.fetchData()
    },
    loadData() {
      const tenant = this.$store.getters.tenant
      getUserTenantProjects(tenant.value).then((resp) => {
        if (resp.success) {
          this.projects = resp.rows
        }
        // this.$store.dispatch('user/setTenants', this.namespaces)
      })
    },
    selectNamespace(val) {
      // this.$store.dispatch('user/setTenant', val).then(() => {
      //   this.$emit('change', val)
      // })
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-menu-namespace .el-menu-item {
    padding: 0 10px;
    height: 50px;
    line-height: 50px;
  }
  .tenant-space {
    margin-bottom: 10px;
  }
</style>
