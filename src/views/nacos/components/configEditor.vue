<template>
  <div>
    <Sticky :z-index="10" :class-name="'sub-navbar published'">
      <el-button type="success" :loading="releaseLoading" @click="submit">发布</el-button>
      <el-button type="warning" @click="refreshLoading">重新加载</el-button>
      <el-button type="info" @click="onBack">返回</el-button>
    </Sticky>
    <el-card>
      <el-form ref="form" :model="record" label-width="120px" :rules="rules">
        <div style="padding: 0 10px 20px 10px">
          <el-form-item label="归属应用" prop="appName">
            <el-select v-model="record.appName" placeholder="请选择" :disabled="isApp">
              <el-option
                v-for="item in projects"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Data ID" prop="dataId">
            <el-input v-model="record.dataId" placeholder="请输入Data ID" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="分组" prop="group">
            <el-input v-model="record.group" placeholder="分组名称" :disabled="true" />
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="record.configTags" placeholder="标签" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="record.desc" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <CodeMirror v-model="record.content" :mode="record.type" @change-mode="changeCodeMode" />
        </div>
      </el-form>
      <el-dialog
        title="配置内容比较"
        :visible.sync="dialogCompareVisible"
        :width="'80%'"
      >
        <div>
          <el-form :inline="true" label-width="120px" label-position="left">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="原配置内容：" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="新配置内容：" />
              </el-col>
            </el-row>
          </el-form>
          <code-diff :old-string="content" :new-string="record.content" :context="10" output-format="side-by-side" />
          <!--<div id="view" />-->
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" :loading="releaseLoading" @click="handleSubmit">确定发布</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import CodeMirror from '@/components/CodeMirror/ConfigFile'
import Sticky from '@/components/Sticky' // 粘性header组件
import { addNacosConfig, getNacosConfig, updateNacosConfig } from '@/api/devops/nacos/configs'
import { getNacosProjectConfig, addNacosProjectConfig, updateNacosProjectConfig } from '@/api/devops/nacos/user-configs'
import { getNamespaceProjects } from '@/api/devops/nacos/namespaces'
import CodeDiff from 'vue-code-diff'

import CodeMirror2 from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/merge/merge.js'
import 'codemirror/addon/merge/merge.css'
import DiffMatchPatch from 'diff-match-patch'
window.diff_match_patch = DiffMatchPatch
window.DIFF_DELETE = -1
window.DIFF_INSERT = 1
window.DIFF_EQUAL = 0

const defaultRecord = {
  dataId: null,
  group: 'DEFAULT_GROUP',
  type: 'text',
  content: '',
  appName: null
}
export default {
  components: { CodeMirror, CodeDiff, Sticky },
  props: {
    mode: {
      type: String,
      default: 'ADD'
    }
  },
  data() {
    return {
      tempRoute: {},
      record: {},
      content: '',
      namespaceId: '',
      projects: [],
      isEdit: false,
      isApp: false,
      dialogCompareVisible: false,
      releaseLoading: false,
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.isEdit = this.mode === 'EDIT' || this.mode === 'APP_EDIT'
    this.isApp = this.mode === 'APP_ADD' || this.mode === 'APP_EDIT'
    this.namespaceId = this.$route.query.namespaceId
    if (!this.isEdit) {
      this.record = Object.assign({}, defaultRecord)
      if (this.isApp) this.record.appName = this.$route.query.appName
    } else {
      this.loadConfig(this.$route.query)
    }
    this.tempRoute = Object.assign({}, this.$route)
    this.searchNamespaceProjects()
  },
  methods: {
    searchNamespaceProjects(val = '') {
      if (this.namespaceId === '') return
      getNamespaceProjects(this.namespaceId, val).then(resp => {
        if (resp.success) {
          this.projects = resp.rows
          if (this.projects.length > 0 && this.isApp) {
            this.projects.forEach(item => {
              if (this.record.appName === item.value) {
                this.record.group = item.key
              }
            })
          }
        }
      }).catch(() => {})
    },
    refreshLoading() {
      if (this.isEdit) this.loadConfig(this.$route.query)
    },
    initCompare(value, orig2) {
      if (value == null) return
      const target = document.getElementById('view')
      target.innerHTML = ''
      CodeMirror2.MergeView(target, {
        value: value, // 上次内容
        origLeft: null,
        orig: orig2, // 本次内容
        lineNumbers: true, // 显示行号
        mode: 'text/html',
        highlightDifferences: true,
        connect: 'align',
        readOnly: true// 只读 不可修改
      })
    },
    changeCodeMode(val) {
      this.record.type = val
    },
    async loadConfig(params) {
      params.show = 'all'
      this.namespaceId = params.namespaceId
      params.tenant = this.namespaceId
      const resp = this.isApp ? await getNacosProjectConfig(params.appName, params) : await getNacosConfig(params)
      if (resp && resp.success) {
        this.record = Object.assign({}, resp.rows[0])
        this.content = this.record.content
      }
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.record.content === null || this.record.content === '') {
            this.$message({
              message: '配置内容不能为空',
              type: 'error'
            })
            return
          }
          this.releaseLoading = true
          this.onSubmit().finally(() => {
            this.releaseLoading = false
          })
        }
      })
    },
    async onSubmit() {
      this.record.namespaceId = this.namespaceId
      if (!this.isEdit) {
        const params = {}
        params.show = 'all'
        params.dataId = this.record.dataId
        params.group = this.record.group
        params.namespaceId = this.namespaceId
        const resp = this.isApp ? await getNacosProjectConfig(this.record.appName, params) : await getNacosConfig(params)

        if (resp.success && resp.rows.length > 0) {
          this.$message({
            message: `配置 Data Id: [${this.record.dataId}] Group: [${this.record.group}] 已存在！`,
            type: 'error'
          })
        } else {
          await this.handleSubmit()
        }
      } else {
        this.dialogCompareVisible = true
      }
    },
    async handleSubmit() {
      this.releaseLoading = true
      let resp = null
      if (this.isApp && this.isEdit) {
        resp = await updateNacosProjectConfig(this.record.appName, this.record)
      } else if (this.isApp && !this.isEdit) {
        resp = await addNacosProjectConfig(this.record.appName, this.record)
      } else if (!this.isEdit) {
        resp = await addNacosConfig(this.record)
      } else {
        resp = await updateNacosConfig(this.record)
      }
      if (resp && resp.success) {
        this.dialogCompareVisible = false
        this.$message({
          message: '发布成功',
          type: 'success'
        })
        if (!this.isEdit) {
          this.onBack()
          return
        }
        this.$confirm(
          '发布成功，请选择继续编辑或返回列表？',
          '发布成功',
          {
            confirmButtonText: '返回',
            cancelButtonText: '继续',
            type: 'success'
          }
        ).then(() => {
          this.onBack()
        })
      } else {
        this.$message({
          message: '发布失败',
          type: 'error'
        })
      }
      this.releaseLoading = false
    },
    onBack() {
      this.$store.dispatch('tagsView/delView', this.tempRoute).then(() => {
        // this.$router.go(-1)
        this.$router.push(this.isApp ? '/nacos/project/index' : '/nacos/configs/index')
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

