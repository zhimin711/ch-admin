<template>
  <el-card>
    <el-form ref="form" :model="record" label-width="120px" :rules="rules" disabled>
      <div style="padding-left: 10px;padding-top: 20px;">
        <el-form-item label="归属应用" prop="appName">
          <el-select v-model="record.appName" placeholder="请选择">
            <el-option
              v-for="item in projects"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Data ID" prop="dataId">
          <el-input v-model="record.dataId" placeholder="请输入Data ID" />
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-input v-model="record.group" placeholder="分组名称" />
        </el-form-item>
        <el-form-item v-if="!isHistory" label="标签">
          <el-input v-model="record.configTags" />
        </el-form-item>
        <el-form-item v-if="!isHistory" label="描述">
          <el-input v-model="record.desc" type="textarea" />
        </el-form-item>
        <el-form-item v-if="isHistory" label="操作类型" prop="opType">
          <el-select v-model="record.opType">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isHistory" label="MD5" prop="md5">
          <el-input v-model="record.md5" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="record.content" type="textarea" :autosize="{ minRows: 10, maxRows: 14}" />
        </el-form-item>
      </div>
    </el-form>
    <el-row>
      <el-col :span="10" :offset="3">
        <el-button v-if="mode === 'ROLLBACK'" type="warning" @click="onRollback">回滚配置</el-button>
        <el-button type="info" @click="onBack">返回</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { getNacosConfigHistory, rollbackNacosConfig } from '@/api/devops/nacos/history'
import { getNacosConfig } from '@/api/devops/nacos/configs'
import { getNamespaceProjects } from '@/api/devops/nacos/namespaces'

export default {
  props: {
    mode: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      namespaceId: '',
      tempRoute: {},
      record: {},
      projects: [],
      isHistory: false,
      options: [{
        value: 'I',
        label: '新增'
      }, {
        value: 'U',
        label: '更新'
      }, {
        value: 'D',
        label: '删除'
      }],
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.isHistory = this.mode === 'HISTORY' || this.mode === 'ROLLBACK'
    this.loadConfig(this.$route.query)
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    editorInit() {
    },
    searchNamespaceProjects() {
      if (this.namespaceId === '') return
      getNamespaceProjects(this.namespaceId, '').then(resp => {
        if (resp.success) {
          this.projects = resp.rows
        }
      })
    },
    loadConfig(params) {
      this.namespaceId = params.namespaceId
      params.tenant = this.namespaceId
      if (this.isHistory) {
        getNacosConfigHistory(params).then(resp => {
          if (resp.success) {
            this.record = Object.assign({}, resp.rows[0])
          }
        })
      } else {
        params.show = 'all'
        getNacosConfig(params).then(resp => {
          if (resp.success) {
            this.record = Object.assign({}, resp.rows[0])
          }
        })
      }
      this.searchNamespaceProjects()
    },
    onRollback() {
      const h = this.$createElement
      this.$msgbox({
        title: '回滚配置',
        message: h('div', { style: 'margin-left: 20px' }, [
          h('p', null, '确定要 以下配置吗？ '),
          h('span', null, `Data Id: `),
          h('i', { style: 'color: teal' }, this.record.dataId),
          h('br', null, null),
          h('span', null, `Group: `),
          h('i', { style: 'color: teal' }, this.record.group)
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(action => {
        this.handleSubmit()
      })
    },
    handleSubmit() {
      this.record.namespaceId = this.namespaceId
      rollbackNacosConfig(this.record).then(resp => {
        this.$message({
          message: '配置回滚' + (resp ? '成功' : '失败'),
          type: resp ? 'success' : 'error'
        })
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

