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
        <el-tabs v-model="tenant" type="card" @tab-click="selectNamespace2">
          <el-tab-pane v-for="item in namespaces" :key="item.value" :label="item.label" :name="item.value">
            <el-alert
              :title="item.key"
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
            <el-form v-if="projectNamespaces.length>0" label-width="180px" :model="record">
              <el-form-item label="可申请空间">
                <el-checkbox-group v-model="applyList">
                  <el-checkbox v-for="item in projectNamespaces" :key="item.key" :label="item.value">
                    {{ item.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSubmitApply('ruleForm')">提交申请</el-button>
                <!--                <el-button @click="resetForm('ruleForm')">重置</el-button>-->
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="applyDialogVisible" :append-to-body="true" :title="'申请项目空间'" width="635px" center>
      <div style="text-align:left;margin-bottom: 20px">
        <el-checkbox-group v-model="applyList">
          <el-checkbox v-for="item in projectNamespaces" :key="item.key" :label="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitApply">申请</el-button>
        <el-button type="danger" @click="applyDialogVisible=false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getNacosNamespaces } from '@/api/nacos/namespace'
import {
  applyNacosUserNamespaces,
  getNacosUserApplyNamespaces,
  listNacosUserNamespaces
} from '@/api/devops/nacos/userApp'
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
      applyDialogVisible: false,
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
            this.$emit('input', this.namespaces[0].value)
            this.$emit('change', this.namespaces[0].value)
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
          const values = this.namespaces.map(item => item.value)
          this.projectNamespaces = resp.rows.filter(e => !values.includes(e.value))
          if (this.projectNamespaces.length > 0) {
            // this.applyDialogVisible = true
          } else {
            // this.$message.warning('该项目没有空间或已申请所有的空间...')
          }
        }
      })
    },
    handleSubmitApply() {
      if (this.applyList.length <= 0) {
        this.$message.warning('请选择要申请的空间!')
        return
      }
      applyNacosUserNamespaces(this.projectId, this.applyList).then(resp => {
        if (resp.success) {
          this.applyDialogVisible = false
          this.$message.success('申请成功，请等待管理员审核...')
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
</style>
