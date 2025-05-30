<template>
  <div class="tenant-container">
    <el-row style="margin-bottom: 15px">
      <el-col>
        <el-menu :default-active="activeCluster" class="el-menu-demo" mode="horizontal" @select="loadNamespaces">
          <el-menu-item style="opacity: 1" index="0" disabled><el-tag>集群</el-tag></el-menu-item>
          <el-menu-item v-for="item in clusters" :key="item.value" :index="item.value">{{ item.label }}</el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
    <el-row v-show="activeCluster!=='0'">
      <el-col :span="24">
        <el-tabs v-model="tenant" type="card" class="el-tabs-tenant" @tab-click="selectNamespace2">
          <el-tab-pane v-for="item in namespaces" :key="item.namespaceId" :label="item.namespaceName" :name="item.namespaceId">
            <el-alert
              :title="item.nacosNamespaceId"
              type="info"
              style="margin: 10px"
              description="Nacos空间ID(配置文件使用)"
              :closable="false"
              show-icon
            />
          </el-tab-pane>
          <el-tab-pane name="apply">
            <span slot="label">申请空间 <i class="el-icon-plus" /></span>
            <el-alert
              v-if="projectNamespaces.length===0"
              title="该项目没有空间或已申请所有的空间"
              type="info"
              close-text="知道了"
            />
            <el-row v-if="projectNamespaces.length>0">
              <el-col :span="24">
                <el-table
                  :data="projectNamespaces"
                  border
                  style="width: 100%;"
                >
                  <el-table-column
                    prop="namespaceName"
                    label="空间名称"
                  />
                  <el-table-column
                    prop="permission"
                    label="只读"
                  >
                    <template slot-scope="{row}">
                      <el-checkbox :checked="row.read" :disabled="row.readOnly" @change="row.read=!row.read" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="permission"
                    label="修改"
                  >
                    <template slot-scope="{row}">
                      <el-checkbox :checked="row.write" :disabled="row.writeOnly" @change="row.write=!row.write" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :span="24" style="margin-top: 10px">
                <el-button :loading="loadingApprove" type="primary" @click="handleSubmitApply('ruleForm')">提交申请</el-button>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getNacosNamespaces } from '@/api/nacos/namespace'
import {
  applyNacosUserNamespaces,
  getNacosUserApplyNamespaces,
  listNacosUserNamespaces
} from '@/api/devops/nacos/user-app-configs'
import { listNacosProjectClusters } from '@/api/devops/nacos/projects'
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
      clusters: [],
      namespaces: [],
      activeCluster: '',
      loadingApprove: false,
      applyList: [],
      record: {},
      projectNamespaces: []
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
      if (nv !== ov) this.fetchData(nv)
    }
  },
  mounted() {
    this.fetchData(this.projectId)
  },
  methods: {
    fetchData(projectId) {
      this.clusters = []
      this.namespaces = []
      if (projectId === '') {
        return
      }
      // this.namespaces = []
      listNacosProjectClusters(projectId).then((resp) => {
        if (resp.success && resp.rows.length > 0) {
          this.clusters = resp.rows
          if (this.clusters.length > 0) {
            this.activeCluster = this.clusters[0].value
            this.loadNamespaces(this.activeCluster)
          }
        }
      })
    },
    loadNamespaces(clusterId) {
      this.activeCluster = clusterId
      this.tenant = ''
      this.namespaces = []
      if (clusterId === '') {
        return
      }
      // this.namespaces = []
      listNacosUserNamespaces(this.projectId, clusterId).then((resp) => {
        if (resp.success) {
          this.namespaces = resp.rows
          if (this.namespaces.length > 0) {
            this.$emit('input', this.namespaces[0].namespaceId)
            this.$emit('change', this.namespaces[0].namespaceId)
          } else {
            this.$emit('input', this.tenant)
            // this.$emit('change', this.tenant)
          }
          this.$emit('finish', this.namespaces)
        }
      })
    },
    applyNamespace(clusterId) {
      if (this.projectId === '') {
        this.$message.warning('Please choose left list of project!')
        return
      }
      if (clusterId === '') {
        this.$message.warning('Please choose nacos cluster!')
        return
      }
      this.applyList = []
      this.projectNamespaces = []
      getNacosUserApplyNamespaces(this.projectId, clusterId).then(resp => {
        if (resp.success) {
          this.projectNamespaces = resp.rows.filter(e => e.permission !== 'rw')
          this.projectNamespaces.forEach(row => {
            // row.permission 包含R标记为只读
            if (row.permission && row.permission.includes('r')) {
              row.read = true
              row.readOnly = true
            } else {
              row.read = false
            }
            // row.permission 包含W标记为修改
            if (row.permission && row.permission.includes('w')) {
              row.write = true
              row.writeOnly = true
            } else {
              row.write = false
            }
          })
        }
      })
    },
    handleSubmitApply() {
      const applyList = this.projectNamespaces.filter(e => (e.read && !e.readOnly) || (e.write && !e.writeOnly)).map(row => {
        var permission = ''
        if(row.read && !row.readOnly){
          permission = 'R'
        }
        if(row.write && !row.writeOnly){
          permission += 'W'
        }
        return { namespaceId: row.namespaceId, permission: permission}
      })
      if (applyList.length <= 0) {
        this.$message.warning('请选择要申请的空间!')
        return
      }
      this.loadingApprove = true
      applyNacosUserNamespaces(this.projectId, this.activeCluster, applyList).then(resp => {
        if (resp.success) {
          this.$message.success('申请成功，请等待管理员审核...')
        }
      }).finally(() => {
        this.loadingApprove = false
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
      })
    },
    selectNamespace(val) {
      this.$emit('change', val)
      sessionStorage.setItem('projectNamespace', val)
    },
    selectNamespace2(tab) {
      if (tab.name === '') {
        return
      } else if (tab.name === 'apply') {
        this.applyNamespace(this.activeCluster)
      }
      this.$emit('change', tab.name)
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
  /*.tenant-space {*/
  /*  margin-bottom: 10px;*/
  /*}*/
  .title {
    min-width: 100px;
    background-color: #FFFFFF;
    /*border-bottom: solid 1px #e6e6e6;*/
  }
  /*::v-deep .el-tabs__content {*/
  /*  display: none;*/
  /*}*/
  .el-tabs-tenant {
    ::v-deep .el-tabs__nav-next, ::v-deep .el-tabs__nav-prev {
      font-size: 18px;
    }
    ::v-deep .el-tabs__nav-prev {
      margin-right: 15px;
    }
    ::v-deep .el-tabs__nav-next {
      margin-left: 15px;
    }
  }
</style>
