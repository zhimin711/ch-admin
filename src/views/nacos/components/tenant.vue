<template>
  <el-row>
    <el-col style="min-width: 200px"><el-tag>空间</el-tag></el-col>
    <el-col>
      <el-menu :default-active="tenant" class="el-menu-namespace" mode="horizontal" @select="selectNamespace">
        <el-menu-item v-for="item in namespaces" :key="item.namespace" :index="item.namespace">{{ item.namespaceShowName }}</el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
import { getNacosNamespaces } from '@/api/devops/nacos/namespaces'
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
    loadData() {
      if (this.namespaces.length > 0) {
        return
      }
      getNacosNamespaces().then((resp) => {
        this.namespaces = resp.data
        this.$emit('finish', this.namespaces)
        // this.$store.dispatch('user/setTenants', this.namespaces)
      })
    },
    selectNamespace(val) {
      this.$emit('input', val)
      this.$emit('change', val)
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
</style>
