<template>
  <div>
    <el-form ref="form" :model="record" label-width="120px" :rules="rules">
      <div style="padding-left: 10px;padding-top: 20px;">
        <el-form-item>
          {{ record.name }}&nbsp;&nbsp;&nbsp;&nbsp;
          <el-button type="primary" @click="onSubmit">保存</el-button>
          <el-button type="warning" @click="onCancel">重置</el-button>
          <el-button type="info" @click="onBack">返回</el-button>
        </el-form-item>
        <el-form-item label="Data ID" prop="dataId">
          <el-input v-model="record.dataId" placeholder="请输入Data ID" />
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-input v-model="record.group" placeholder="分组名称" />
        </el-form-item>
        <el-form-item label="归属应用" prop="appName">
          <el-input v-model="record.appName" placeholder="归属应用" />
        </el-form-item>
        <el-form-item v-if="isHistory" label="操作类型" prop="opType">
          <el-input v-model="record.opType" placeholder="操作类型" />
        </el-form-item>
        <el-form-item v-if="isHistory" label="MD5" prop="md5">
          <el-input v-model="record.md5" placeholder="MD5" />
        </el-form-item>
        <CodeMirror v-model="record.content" />
      </div>
    </el-form>
  </div>
</template>

<script>
import CodeMirror from '@/components/CodeMirror/ConfigFile'
import { getNacosConfigsHistory } from '@/api/nacos/history'

const defaultRecord = {
  dataId: null,
  group: '',
  content: '',
  appName: null
}
export default {
  components: { CodeMirror },
  props: {
    mode: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      tempRoute: {},
      record: {},
      isHistory: false,
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.isHistory = this.mode === 'HistoryDetail' || this.mode === 'HistoryRollback'
    if (this.mode === 'Add') {
      this.record = Object.assign({}, defaultRecord)
    } else {
      this.loadConfig(this.$route.params)
    }
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    editorInit() {
    },
    loadConfig(params) {
      if (this.isHistory) {
        getNacosConfigsHistory(params)
      }
    },
    onSubmit() {
      if (this.form.content === null || this.form.content === '') {
        this.$message({
          message: '配置内容不能为空',
          type: 'error'
        })
        return
      }
      this.$confirm(
        '修改主配置可能会导致Server重启，是否继续？',
        '确定修改',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        /* updateCanalConfig(this.record).then(response => {
          if (response.data === 'success') {
            this.$message({
              message: '保存成功',
              type: 'success'
            })
            this.loadCanalConfig()
          } else {
            this.$message({
              message: '保存失败',
              type: 'error'
            })
          }
        })*/
      })
    },
    onCancel() {
      this.loadCanalConfig()
    },
    onBack() {
      history.go(-1)
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

