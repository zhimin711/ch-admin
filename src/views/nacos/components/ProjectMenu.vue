<template>
  <el-row class="project-tree">
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
  watch: {
    tenant(nv, ov) {
      console.log(nv, ov)
    },
    projectName(val) {
      this.$refs.tree.filter(val)
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
      this.$emit('change', data.value)
      // this.projects = data.value
      // this.fetchData()
    },
    loadData() {
      const tenant = this.$store.getters.tenant
      if (tenant && tenant.id) {
        getUserTenantProjects(tenant.id).then((resp) => {
          if (resp.success) {
            this.projects = resp.rows
          }
        })
      }
    },
    selectNamespace(val) {
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
  .el-tree {
    .el-tree-node {
      padding: 5px 5px !important;
    }
  }
</style>
<style>
  .project-tree .el-tree-node {
    padding: 5px 5px;
  }
  .project-tree .el-tree-node__content {
    padding: 5px 5px;
  }
  .project-tree .is-current {
    color: #409eff;
  }
</style>
