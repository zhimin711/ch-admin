<template>
  <div class="container">
    <el-row>
      <el-col>
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="loadNamespaces">
          <el-menu-item index="0" disabled><el-tag>集群</el-tag></el-menu-item>
          <el-menu-item v-for="item in clusters" :key="item.value" :index="item.value">{{ item.label }}</el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-tabs v-model="tenant" @tab-click="selectNamespace()">
          <el-tab-pane label="命名空间" name="first" disabled />
          <el-tab-pane v-for="item in namespaces" :key="item.value" :label="item.label" :name="item.value" />
        </el-tabs>
        <!--        <el-menu :default-active="tenant" class="el-menu-namespace" mode="horizontal" @select="selectNamespace">
          <el-menu-item index="0" disabled>空间</el-menu-item>
          <el-menu-item v-for="item in namespaces" :key="item.value" :index="item.label">{{ item.label }}</el-menu-item>
        </el-menu>-->
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listNacosCluster, listNacosClusterNamespaces } from '@/api/devops/nacos/cluster'
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeIndex: '',
      clusters: [],
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
      if (this.clusters.length > 0) {
        return
      }
      listNacosCluster().then(resp => {
        if (resp.success) {
          this.clusters = resp.rows
          // this.activeIndex = this.clusters[0].value
          this.loadNamespaces(this.clusters[0].value)
        }
      })
    },
    loadNamespaces(id) {
      this.activeIndex = id
      listNacosClusterNamespaces(this.activeIndex).then((resp) => {
        if (resp.success) {
          this.namespaces = resp.rows
          this.$emit('finish', this.namespaces)
        }
        // this.$store.dispatch('user/setTenants', this.namespaces)
      })
    },
    handleSelect(val) {
      this.$emit('input', val)
      // this.$emit('change', val)
      // this.$store.dispatch('user/setTenant', val).then(() => {
      // })
    },
    selectNamespace() {
      // this.$emit('input', this.value)
      this.$emit('change', this.tenant)
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
