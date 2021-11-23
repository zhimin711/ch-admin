<template>
  <div class="tenant-container">
    <el-row>
      <!--<el-col :span="5" class="title" align="center">
        <span>空间（环境）</span>
        <el-button size="mini" icon="el-icon-plus" @click="applyNamespace">申请</el-button>
      </el-col>
      <el-col :span="24" class="tenant-space">
        <el-menu v-if="namespaces.length>0" :default-active="tenant" class="el-menu-namespace" mode="horizontal" @select="selectNamespace">
          <el-menu-item v-for="item in namespaces" :key="item.key" :index="item.key">{{ item.label }}</el-menu-item>
        </el-menu>
        <el-tag v-if="projectId===''" type="warning">请先从左侧列表选择项目</el-tag>
      </el-col>-->
      <el-col :span="24">
        <el-tabs v-model="tenant" type="card" @tab-click="selectNamespace2">
          <el-tab-pane v-for="item in namespaces" :key="item.key" :label="item.label" :name="item.key" />
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
import { getUserProjectNamespaces } from '@/api/upms/user'
import { getProjectNamespaces } from '@/api/upms/project'
import { applyNamespaces } from '@/api/upms/namespace'
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
      namespaces: [],
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
      this.namespaces = []
      if (projectId === '') {
        return
      }
      // this.namespaces = []
      getUserProjectNamespaces(projectId).then((resp) => {
        if (resp.success && resp.rows.length > 0) {
          this.namespaces = resp.rows
          this.$emit('input', this.namespaces[0].key)
          this.$emit('change', this.namespaces[0].key)
        }
      })
    },
    applyNamespace() {
      if (this.projectId === '') {
        this.$message.warning('Please choose left list of project!')
        return
      }
      this.applyList = []
      getProjectNamespaces(this.projectId).then(resp => {
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
      applyNamespaces(this.projectId, this.applyList).then(resp => {
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
      // console.log(val)
      this.$emit('change', val)
      sessionStorage.setItem('projectNamespace', val)
      // this.$store.dispatch('user/setTenant', val).then(() => {
      // })
    },
    selectNamespace2(tab) {
      if (tab.name === '') {
        return
      } else if (tab.name === 'apply') {
        this.applyNamespace()
      }
      console.log(tab.name)
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
