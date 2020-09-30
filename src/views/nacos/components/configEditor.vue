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
        <el-button type="primary" @click="onSubmit">发布</el-button>
        <el-button type="info" @click="onBack">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import CodeMirror from '@/components/CodeMirror/ConfigFile'
import { getNacosConfig, releaseNacosConfig } from '@/api/nacos/configs'

const defaultRecord = {
  dataId: null,
  group: 'DEFAULT_GROUP',
  type: 'text',
  content: '',
  appName: null
}
export default {
  components: { CodeMirror },
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
      isEdit: false,
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
    editorInit() {
    },
    changeCodeMode(val) {
      this.record.type = val
    },
    loadConfig(params) {
      params.show = 'all'
      getNacosConfig(params).then(data => {
        if (data) {
          this.record = Object.assign({}, data)
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

      const formData = new FormData()
      formData.append('namespaceId', this.record.tenant || this.$store.getters.tenant)
      formData.append('tenant', this.record.tenant || this.$store.getters.tenant)
      if (!this.isEdit) {
        formData.append('appName', this.record.appName)
        formData.append('dataId', this.record.dataId)
        formData.append('group', this.record.group)
        formData.append('content', this.record.content)
        formData.append('type', this.record.type)
        formData.append('config_tags', this.record.configTags || '')
        this.handleSubmit(formData)
      } else {
        formData.append('dataId', this.record.dataId)
        formData.append('group', this.record.group)
        formData.append('content', this.record.content)

        this.$confirm(
          '修改主配置可能会导致Server重启，是否继续？',
          '确定修改',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {

        })
      }
    },
    handleSubmit(data) {
      releaseNacosConfig(data).then(resp => {
        if (resp) {
          this.$message({
            message: '保存成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '保存失败',
            type: 'error'
          })
        }
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

