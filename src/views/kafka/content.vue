<template>
  <div class="app-container">
    <div class="filter-container">

      <el-form :model="listQuery.params" :inline="true" label-width="100px" label-position="left">
        <el-form-item label="集群名称">
          <el-select v-model="listQuery.params.cluster" placeholder="请选择" class="filter-item" @change="handleClusterChange">
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主题名称">
          <el-select
            v-model="listQuery.params.topic"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
          >
            <el-option
              v-for="item in options.topics"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索类型">
          <el-radio-group v-model="listQuery.params.type" @change="handleTypeChange">
            <el-radio-button label="0">全量</el-radio-button>
            <el-radio-button label="1">最新</el-radio-button>
            <el-radio-button label="2">最早</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="搜索量">
          <el-input-number v-model="listQuery.params.limit" :min="12" :max="1000" :step="4" :disabled="limitDisabled" />
        </el-form-item>
        <el-form-item label="搜索内容">
          <el-input v-model="listQuery.params.content" placeholder="搜索内容(关键信息)" />
        </el-form-item>
        <el-button v-if="checkPermission2(['KAFKA_CONTENT_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
          查询
        </el-button>
        <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {type: '0', limit: 12}">
          重置
        </el-button>
        <el-button v-if="checkPermission2(['KAFKA_CONTENT_SEND'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handlePush">
          推送消息
        </el-button>
      </el-form>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="70px" align="center" label="分区ID">
        <template slot-scope="scope">
          <span>{{ scope.row.partitionId }}</span>
        </template>
      </el-table-column>
      <el-table-column width="66px" align="center" label="索引">
        <template slot-scope="scope">
          <span>{{ scope.row.messageOffset }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容">
        <template slot-scope="scope">
          <span>{{ scope.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-link type="primary" icon="el-icon-view" @click="handleView(scope.row)">JSON视图</el-link>
          <el-link v-if="checkPermission2(['KAFKA_CONTENT_RESEND'])" type="primary" icon="el-icon-position" @click="handleResend(scope.row)">重发</el-link>
        </template>
      </el-table-column>
    </el-table>

    <!--<pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />-->

    <el-dialog :visible.sync="dialogVisible" :title="'消息JSON'" width="80%">
      <!--<span v-html="content"></span>-->
      <pre>{{ content }}</pre>

      <div style="text-align:center;">
        <el-button type="danger" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'推送主题消息'">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="集群名称">
          <el-select v-model="record.cluster" placeholder="请选择">
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主题名称">
          <el-select
            v-model="record.topic"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethodSend"
            :loading="loading"
            style="width:100%"
          >
            <el-option
              v-for="item in options.topics"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发送消息">
          <el-input
            v-model="record.content"
            :autosize="{ minRows: 5, maxRows: 15}"
            type="textarea"
            placeholder="发送Kafka 消息"
          />
        </el-form-item>
        <div style="text-align:right;">
          <el-button type="primary" @click="handleSubmit">发送</el-button>
          <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { search, getStatus, list, send, resend, getClusters, getTopics } from '@/api/kafka/content'

export default {
  name: 'UserManager',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      let s = 'draft'
      if (status === '1') {
        s = 'published'
      } else if (status === '3') {
        s = 'deleted'
      }
      return statusMap[s]
    }
  },
  data() {
    return {
      listLoading: false,
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
      dialogVisible: false,
      dialogVisible2: false,
      loading: false,
      options: {
        clusters: [],
        topics: []
      },
      timer: '',
      loadingIns: null
    }
  },
  created() {
    // this.getList()
    this.getClusters()
  },
  methods: {
    checkPermission2,
    async getClusters() {
      const resp = await getClusters()
      if (resp && resp.success) this.options.clusters = resp.rows
    },
    getList() {
      if (!this.listQuery.params.cluster || this.listQuery.params.cluster === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (!this.listQuery.params.topic || this.listQuery.params.topic === '') {
        this.$message({
          type: 'warn',
          message: '请先选择主题...'
        })
        return
      }
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

      // this.listLoading = true
      search(this.listQuery).then(response => {
        if (response.code) {
          this.sid = response.code
          this.timer = setInterval(this.getStatus, 2000)
        } else {
          this.loadingIns.close()
          this.listQuery.list = response.rows
          this.listQuery.total = response.total
        }
        // this.listLoading = false
      }).catch(() => {
        this.loadingIns.close()
      })
    },
    handleView(row) {
      this.content = JSON.parse(row.content)
      this.dialogVisible = true
    },
    handlePush() {
      this.record = {}
      this.dialogVisible2 = true
    },
    handleResend(row) {
      this.record = deepClone(row)
      this.$confirm('请确认重新发送消息到原主题?', 'Warning', {
        confirmButtonText: '发送',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await resend(row.sid, row.content)
          this.$message({
            type: 'success',
            message: '发送 success!'
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      let resp = null
      resp = await send(this.record).catch(() => {})
      if (resp && resp.success) {
        this.dialogVisible2 = false
        this.$notify({
          title: `推送消息 Success!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.cluster}</div>
          `,
          type: 'success'
        })
        // _this.getList()
      }
    },
    async remoteMethod(query) {
      if (!this.listQuery.params.cluster || this.listQuery.params.cluster === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (query !== '') {
        this.loading = true
        getTopics(this.listQuery.params.cluster, query).then(response => {
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
    async remoteMethodSend(query) {
      if (!this.record.cluster || this.record.cluster === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (query !== '') {
        this.loading = true
        getTopics(this.record.cluster, query).then(response => {
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
    handleTypeChange(val) {
      this.limitDisabled = val === '0'
    },
    getStatus() {
      getStatus(this.sid).then(resp => {
        if (resp.success && resp.rows[0] !== '1') {
          clearTimeout(this.timer)
          this.loadingIns.close()
          this.getAsyncList(this.sid)
        }
      })
    },
    handleClusterChange(val) { this.options.topics = [] },
    getAsyncList(sid) {
      this.listLoading = true
      list(sid).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      })
    }
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
