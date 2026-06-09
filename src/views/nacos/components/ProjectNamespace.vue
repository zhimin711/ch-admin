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
        <custom-tabs
          v-model="tenant"
          :tabs="namespaceTabs"
          @input="selectNamespace2Custom"
        />
        <div v-if="tenant !== 'apply'">
          <el-alert
            v-for="item in currentNamespace"
            :key="item.namespaceId"
            :title="item.nacosNamespaceId"
            type="info"
            style="margin: 10px"
            description="Nacos空间ID(配置文件使用)"
            :closable="false"
            show-icon
          />
        </div>
        <div v-else>
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
                style="width: 100%; margin: 10px;"
              >
                <el-table-column
                  prop="namespaceName"
                  label="空间名称"
                />
                <el-table-column
                  prop="permission"
                  label="列表（配置文件列表）"
                  align="center"
                >
                  <template slot-scope="{row}">
                    <el-checkbox :checked="row.list" :disabled="row.listOnly" @change="onListChange(row)" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="permission"
                  label="只读（详情、变更历史、比较配置）"
                  align="center"
                >
                  <template slot-scope="{row}">
                    <el-checkbox :checked="row.read" :disabled="row.readOnly" @change="onReadChange(row)" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="permission"
                  label="编辑（新增、修改、删除）"
                  align="center"
                >
                  <template slot-scope="{row}">
                    <el-checkbox :checked="row.write" :disabled="row.writeOnly" @change="onWriteChange(row)" />
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :span="24" style="margin-top: 10px">
              <el-button :loading="loadingApprove" type="primary" @click="handleSubmitApply('ruleForm')">提交申请</el-button>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CustomTabs from './CustomTabs.vue'
import { getNacosNamespaces } from '@/api/nacos/namespace'
import {
  applyNacosUserNamespaces,
  getNacosUserApplyNamespaces,
  listNacosUserNamespaces
} from '@/api/devops/nacos/user-app-configs'
import { listNacosProjectClusters } from '@/api/devops/nacos/projects'
export default {
  components: { CustomTabs },
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
        return String(this.value)
      },
      set(val) {
        this.$emit('input', String(val))
      }
    },
    namespaceTabs() {
      // 普通空间tab + 申请tab
      const tabs = this.namespaces.map(item => ({ label: item.namespaceName, value: String(item.namespaceId) }))
      tabs.push({ label: '申请空间', value: 'apply' })
      return tabs
    },
    currentNamespace() {
      return this.namespaces.filter(item => String(item.namespaceId) === String(this.tenant))
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
      this.$emit('cluster-change', clusterId)
      listNacosUserNamespaces(this.projectId, clusterId).then((resp) => {
        if (resp.success) {
          this.namespaces = resp.rows
          if (this.namespaces.length > 0) {
            const namespaceId = String(this.namespaces[0].namespaceId)
            this.$emit('input', namespaceId)
            this.$emit('change', namespaceId)
          } else {
            this.$emit('input', this.tenant)
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
          this.projectNamespaces = resp.rows.filter(e => e.permission !== 'lrw')
          this.projectNamespaces.forEach(row => {
            if (row.permission && row.permission.includes('l')) {
              row.list = true
              row.listOnly = true
            } else {
              row.list = false
            }
            if (row.permission && row.permission.includes('r')) {
              row.read = true
              row.readOnly = true
            } else {
              row.read = false
            }
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
      const applyList = this.projectNamespaces.filter(e => (e.list && !e.listOnly) || (e.read && !e.readOnly) || (e.write && !e.writeOnly)).map(row => {
        var permission = ''
        if (row.list && !row.listOnly) {
          permission = 'L'
        }
        if (row.read && !row.readOnly) {
          permission += 'R'
        }
        if (row.write && !row.writeOnly) {
          permission += 'W'
        }
        return { namespaceId: row.namespaceId, permission: permission }
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
    onListChange(row) {
      row.list = !row.list
      if (row.list) {
        // row.read = false
        // row.write = false
      }
    },
    onReadChange(row) {
      row.read = !row.read
      if (row.read) {
        // row.list = false
      }
    },
    onWriteChange(row) {
      row.write = !row.write
      if (row.write) {
        // row.list = false
        // row.read = true
      }
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
      // 确保发送的是字符串类型
      this.$emit('change', String(val))
      sessionStorage.setItem('projectNamespace', String(val))
    },
    selectNamespace2Custom(val) {
      // 兼容原el-tabs的tab对象
      if (val === '') {
        return
      } else if (val === 'apply') {
        this.applyNamespace(this.activeCluster)
      }
      // 确保发送的是字符串类型
      this.$emit('change', String(val))
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
    position: relative;
    padding: 0 24px;
    ::v-deep .el-tabs__header {
      padding: 0 24px !important;
      position: relative;
    }
    ::v-deep .el-tabs__nav-next,
    ::v-deep .el-tabs__nav-prev {
      position: absolute !important;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      font-size: 28px !important;
      width: 36px !important;
      height: 36px !important;
      line-height: 36px !important;
      color: #409EFF !important;
      background: #f5f7fa !important;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    ::v-deep .el-tabs__nav-prev {
      left: 0;
    }
    ::v-deep .el-tabs__nav-next {
      right: 0;
    }
    ::v-deep .el-tabs__nav-next:hover,
    ::v-deep .el-tabs__nav-prev:hover {
      background: #e0f0ff !important;
      color: #1976d2 !important;
    }
  }
</style>
