<template>
  <el-row>
    <el-col :span="1" align="right"><el-tag>租户</el-tag></el-col>
    <el-col :span="23">
      <el-menu :default-active="tenant" class="el-menu-namespace" mode="horizontal" @select="selectNamespace">
        <el-menu-item v-for="item in namespaces" :key="item.namespace" :index="item.namespace">{{ item.namespaceShowName }}</el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
import { getNacosNamespaces } from '@/api/nacos/namespace'
export default {
  props: {
    value: {
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
        return this.$store.getters.tenant || this.value
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
    loadData() {
      const data = this.$store.getters.tenants
      if (data && data.length > 0) {
        this.namespaces = data
        return
      }
      getNacosNamespaces().then((res) => {
        this.namespaces = res.data
        this.$store.dispatch('user/setTenants', this.namespaces)
      })
    },
    selectNamespace(val) {
      this.$store.dispatch('user/setTenant', val).then(() => {
        this.$emit('change', val)
      })
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
</style>
