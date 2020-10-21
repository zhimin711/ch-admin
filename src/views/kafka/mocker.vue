<template>
  <div class="app-container">
    <div class="filter-container">

      <el-form :model="params" label-width="180px" label-position="left">
        <el-row>
          <el-col :span="12">
            <el-form-item label="集群名称">
              <el-select v-model="params.clusterName" placeholder="请选择" class="filter-item" @change="handleClusterChange">
                <el-option
                  v-for="item in options.clusters"
                  :key="item.clusterName"
                  :label="item.clusterName"
                  :value="item.clusterName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题名称">
              <el-select
                v-model="params.topicName"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="remoteMethod"
                :loading="loading"
                @change="handleTopicChange"
              >
                <el-option
                  v-for="item in options.topics"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Mock线程数">
              <el-input-number v-model="params.threadSize" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单线程Mock数据量">
              <el-input-number v-model="params.batchSize" :min="1" :max="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="开启调整">
              <el-switch v-model="params.edit" />
            </el-form-item>
          </el-col>
          <el-col v-if="params.edit" :span="12">
            <el-form-item label="调整延迟（秒）">
              <el-input-number v-model="params.batchSize" :min="1" :max="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="开启删除">
              <el-switch v-model="params.del" />
            </el-form-item>
          </el-col>
          <el-col v-if="params.del" :span="12">
            <el-form-item label="删除延迟（秒）">
              <el-input-number v-model="params.batchSize" :min="1" :max="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Mock属性" style="margin-bottom: 0">
          <el-button type="text" size="small" icon="el-icon-plus" @click="handleAddNode">添加属性</el-button>
        </el-form-item>
        <el-table
          :data="subParams"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column prop="code" label="属性代码">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.code" type="textarea" size="small" placeholder="属性代码" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="属性类型" width="120">
            <template slot-scope="{row}">
              <template>
                <!--<el-input v-model="row.type" size="small" placeholder="属性类型" />-->
                <el-select v-model="row.type" placeholder="请选择" size="small">
                  <el-option v-for="item in options.propTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="valRegex" label="Mock规则">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valRegex" type="textarea" size="small" placeholder="[1-100]值或正则（多个&quot;,&quot;拼接，空为自动）" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="valEdit" label="调整值" width="100">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valEdit" size="small" placeholder="调整值" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="valDel" label="删除值" width="100">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valDel" size="small" placeholder="删除值" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="序号" width="80">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.sort" size="small" placeholder="序号" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="属性名称">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.name" size="small" placeholder="属性名称" />
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link v-if="scope.$index>0" type="danger" @click="handleDelNode(scope.$index)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">
          查询
        </el-button>
        <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="params = {}">
          重置
        </el-button>
      </el-form>
    </div>

  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { getClusters, getTopics } from '@/api/kafka/content'
import { search } from '@/api/kafka/mocker'

export default {
  name: 'KafkaContent',
  data() {
    return {
      listLoading: false,
      params: {
        clusterName: '',
        topicName: '',
        threadSize: 4,
        batchSize: 10
      },
      subParams: [{}],
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {
          type: '1', limit: 12
        }
      },
      limitDisabled: false,
      record: {},
      content: '',
      contentType: '',
      loading: false,
      options: {
        clusters: [],
        topics: [],
        propTypes: [
          { value: '', label: '自动' },
          { value: 'String', label: 'String' },
          { value: 'Integer', label: 'Integer' },
          { value: 'Float', label: 'Float' },
          { value: 'Date', label: 'Date' },
          { value: 'Boolean', label: 'Boolean' },
          { value: 'Double', label: 'Double' },
          { value: 'Long', label: 'Long' },
          { value: 'Short', label: 'Short' }
        ]
      },
      timer: '',
      loadingIns: null
    }
  },
  created() {
    this.getClusters()
  },
  methods: {
    checkPermission2,
    async getClusters() {
      const resp = await getClusters()
      if (resp && resp.success) this.options.clusters = resp.rows
    },
    getList() {
      if (!this.params.clusterName || this.params.clusterName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (!this.params.topicName || this.params.topicName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择主题...'
        })
        return
      }
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

      // this.listLoading = true
      search(this.params).then(resp => {
        if (resp.success) {
          this.params = Object.assign(this.params, resp.rows[0])
          this.subParams = resp.rows[0].props
        }
      }).finally(() => {
        this.loadingIns.close()
      })
    },
    handleView(row) {
      this.content = JSON.parse(row.content)
      this.dialogVisible = true
    },
    handleAddNode() {
      this.subParams.push({ clazz: '', params: '' })
    },
    handleDelNode(index) {
      this.subParams.splice(index, 1)
    },
    async handleSubmit() {
      // const resp = null
      // resp = await send(this.record).catch(() => {})
      // if (resp && resp.success) {
      //   this.dialogVisible2 = false
      //   this.$notify({
      //     title: `推送消息 Success!`,
      //     dangerouslyUseHTMLString: true,
      //     message: `
      //       <div>集群名称: ${this.record.cluster}</div>
      //     `,
      //     type: 'success'
      //   })
      // }
    },
    async remoteMethod(query) {
      if (!this.params.clusterName || this.params.clusterName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (query !== '') {
        this.loading = true
        getTopics(this.params.clusterName, query).then(response => {
          this.loading = false
          if (response.success) {
            this.options.topics = response.rows.map(item => {
              return { value: item.topicName, label: item.topicName }
            })
          }
        })
      } else {
        this.options.topics = []
      }
    },
    handleTopicChange(val) {
      console.log('handleTopicChange: ', val)
      this.getList()
    },
    handleClusterChange(val) { this.options.topics = [] }
  }
}
</script>

<style scoped>
  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }

  .el-select .el-input__inner {
    width: 360px;
  }
</style>
