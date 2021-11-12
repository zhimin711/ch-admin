<template>
  <el-row>
    <el-col :span="5" class="title" align="center">
      <span>空间（环境）</span>
      <el-button size="mini" icon="el-icon-plus">申请</el-button>
    </el-col>
    <el-col :span="18" class="tenant-space">
      <el-menu v-if="namespaces.length>0" :default-active="tenant" class="el-menu-namespace" mode="horizontal" @select="selectNamespace">
        <el-menu-item v-for="item in namespaces" :key="item.key" :index="item.key">{{ item.label }}</el-menu-item>
      </el-menu>
      <el-tag v-if="projectId===''" type="warning">请先从左侧列表选择项目</el-tag>
    </el-col>
  </el-row>
</template>

<script>
import { getNacosNamespaces } from '@/api/nacos/namespace'
import { getUserProjectNamespaces } from '@/api/upms/user'
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    projectId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      namespaces: []
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
    projectId(nv, ov) {
      this.fetchData(nv)
    }
  },
  mounted() {
    // this.loadData()
  },
  methods: {
    fetchData(projectId) {
      // this.namespaces = []
      getUserProjectNamespaces(projectId).then((resp) => {
        if (resp.success) {
          this.namespaces = resp.rows
        }
      })
    },
    loadData() {
      const data = this.$store.getters.tenants
      if (data && data.length > 0) {
        this.namespaces = data
        return
      }
      getNacosNamespaces().then((res) => {
        this.namespaces = res.data
        // this.$store.dispatch('user/setTenants', this.namespaces)
      })
    },
    selectNamespace(val) {
      this.$emit('change', val)
      sessionStorage.setItem('projectNamespace', val)
      // this.$store.dispatch('user/setTenant', val).then(() => {
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
  .title {
    min-width: 100px;
    background-color: #FFFFFF;
    border-bottom: solid 1px #e6e6e6;
  }
</style>
