<template>
  <el-card>
    <el-form ref="form" :model="record" label-width="120px" :rules="rules">
      <div style="padding: 0px 10px 20px 10px">
        <el-form-item label="Data ID" prop="dataId">
          <el-input v-model="record.dataId" placeholder="请输入Data ID" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-input v-model="record.group" placeholder="分组名称" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="record.configTags" placeholder="标签" />
        </el-form-item>
        <el-form-item label="归属应用" prop="appName">
          <el-input v-model="record.appName" placeholder="归属应用" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="record.desc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <CodeMirror v-model="record.content" :mode="record.type" @change-mode="changeCodeMode" />
      </div>
      <el-form-item>
        <el-button type="primary" :loading="releaseLoading" @click="submit">发布</el-button>
        <el-button type="info" @click="onBack">返回</el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      title="配置内容比较"
      :visible.sync="dialogCompareVisible"
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
</template>

<script>
import CodeMirror from '@/components/CodeMirror/ConfigFile'
import { getNacosConfig, releaseNacosConfig } from '@/api/nacos/configs'
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
  components: { CodeMirror, CodeDiff },
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
      isEdit: false,
      dialogCompareVisible: false,
      releaseLoading: false,
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.isEdit = this.mode === 'EDIT'
    if (this.mode === 'ADD') {
      this.record = Object.assign({}, defaultRecord)
    } else {
      this.loadConfig(this.$route.query)
    }
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
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
    loadConfig(params) {
      params.show = 'all'
      getNacosConfig(params).then(data => {
        if (data) {
          this.record = Object.assign({}, data)
          this.content = this.record.content
        }
      })
    },
    convertData() {
      const formData = new FormData()
      if (!this.isEdit) {
        formData.append('namespaceId', this.$store.getters.tenant)
        formData.append('tenant', this.$store.getters.tenant)
        formData.append('appName', this.record.appName || '')
        formData.append('dataId', this.record.dataId)
        formData.append('group', this.record.group)
        formData.append('content', this.record.content)
        formData.append('type', this.record.type)
        formData.append('configTags', this.record.configTags || '')
      } else {
        for (const p in this.record) {
          formData.append(p, this.record[p])
        }
      }
      return formData
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.onSubmit()
        }
      })
    },
    onSubmit() {
      if (this.record.content === null || this.record.content === '') {
        this.$message({
          message: '配置内容不能为空',
          type: 'error'
        })
        return
      }

      if (!this.isEdit) {
        const params = {}
        params.show = 'all'
        params.dataId = this.record.dataId
        params.group = this.record.group
        params.tenant = this.$store.getters.tenant
        params.namespaceId = this.$store.getters.tenant
        this.releaseLoading = true
        getNacosConfig(params).then(data => {
          if (data) {
            this.$message({
              message: `配置 Data Id: [${this.record.dataId}] Group: [${this.record.group}] 已存在！`,
              type: 'error'
            })
          } else {
            this.handleSubmit()
          }
        }).finally(() => {
          this.releaseLoading = false
        })
      } else {
        this.dialogCompareVisible = true
        // use CodeMirror Merge
        // this.$nextTick(() => {
        //   this.initCompare(this.content, this.record.content)
        // })
      }
    },
    handleSubmit() {
      this.releaseLoading = true
      releaseNacosConfig(this.convertData()).then(resp => {
        if (resp) {
          this.dialogCompareVisible = false
          this.$message({
            message: '发布成功',
            type: 'success'
          })

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
      }).finally(() => {
        this.releaseLoading = false
      })
    },
    onBack() {
      this.$store.dispatch('tagsView/delView', this.tempRoute).then(() => {
        this.$router.go(-1)
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

