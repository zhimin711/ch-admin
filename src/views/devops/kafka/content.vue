<template>
  <div class="app-container">
    <div class="filter-container">

      <el-form :model="listQuery.params" :inline="true" label-width="80px" label-position="left">
        <el-form-item label="集群名称">
          <el-select
            v-model="listQuery.params.clusterId"
            placeholder="请选择"
            class="filter-item"
            @change="handleClusterChange"
          >
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主题名称">
          <el-select
            v-model="listQuery.params.topicId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
            @change="selectTopic"
          >
            <el-option
              v-for="item in options.topics"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分区号">
          <el-select
            v-model="listQuery.params.partition"
          >
            <el-option :value="-1" label="全部" />
            <el-option
              v-for="item in topicPartitions"
              :key="item.partition"
              :label="item.partition"
              :value="item.partition"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索范围">
          <el-input v-model="listQuery.params.size" placeholder="请输入范围" class="input-with-select">
            <el-select slot="prepend" v-model="listQuery.params.type" placeholder="请选择" @change="handleTypeChange">
              <el-option label="最新" value="LATEST" />
              <el-option label="最早" value="EARLIEST" />
              <el-option label="全量" value="ALL" />
            </el-select>
            <template slot="append">条</template>
          </el-input>
        </el-form-item>
        <el-form-item label="搜索量">
          <el-select v-model="listQuery.params.limit">
            <el-option label="10条" value="10" />
            <el-option label="50条" value="50" />
            <el-option label="100条" value="100" />
            <el-option label="200条" value="200" />
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="24">
            <el-form-item label="搜索内容">
              <el-input v-model="listQuery.params.content" placeholder="搜索内容(包含信息)" />
            </el-form-item>
            <el-form-item label="消息KEY">
              <el-input v-model="listQuery.params.key" placeholder="消息KEY" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-badge v-permission="'KAFKA_CONTENT_SEARCH'" :value="listQuery.total" :max="99" class="item">
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">
            查询
          </el-button>
        </el-badge>
        <el-button
          v-permission="['KAFKA_CONTENT_SEND']"
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          con="el-icon-plus"
          :disabled="topicPartitions.length === 0"
          @click="handlePush"
        >
          推送消息
        </el-button>
      </el-form>
    </div>
    <el-tabs v-model="activePartition" type="card">
      <el-tab-pane v-for="(item, index) in topicPartitions" :key="item.partition" :label="'分区'+item.partition" :name="item.partition+''">
        <el-descriptions class="margin-top" :column="3" border>
          <el-descriptions-item label="起始位置"><el-tag>{{ item.beginningOffset }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="结束位置"><el-tag>{{ item.endOffset }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="可搜索量"><el-tag>{{ item.endOffset - item.beginningOffset }}</el-tag></el-descriptions-item>
        </el-descriptions>
        <el-table v-show="partitionMessages.length>0" :data="partitionMessages[index]" border fit highlight-current-row style="width: 100%">
          <el-table-column width="77px" align="center" label="索引">
            <template slot-scope="scope">
              <span>{{ scope.row.offset }}</span>
            </template>
          </el-table-column>
          <el-table-column label="内容">
            <template slot-scope="scope">
              <span>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" align="center" label="发送时间">
            <template slot-scope="scope">
              <span>{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="120">
            <template slot-scope="scope">
              <el-link v-if="contentType!=='STRING'" type="primary" icon="el-icon-view" @click="handleView(scope.row)">JSON视图</el-link>
              <el-link v-permission="['KAFKA_CONTENT_SEND']" type="primary" icon="el-icon-position" @click="handlePush(scope.row)">重发</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible" :title="'消息JSON'" width="80%">
      <!--<span v-html="content"></span>-->
      <pre>{{ content }}</pre>

      <div style="text-align:center;">
        <el-button type="danger" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'推送主题消息'">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="主题分区">
          <el-select
            v-model="record.partition"
            clearable
          >
            <el-option
              v-for="item in topicPartitions"
              :key="item.partition"
              :label="item.partition"
              :value="item.partition"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息KEY">
          <el-input v-model="record.key" placeholder="消息KEY" />
        </el-form-item>
        <el-form-item label="发送消息">
          <el-input
            v-model="record.value"
            :autosize="{ minRows: 5, maxRows: 15}"
            type="textarea"
            placeholder="发送Kafka 消息"
          />
        </el-form-item>
        <div style="text-align:right;">
          <el-button type="primary" :loading="dialogLoading" @click="handleSend">发送</el-button>
          <el-button type="danger" :loading="dialogLoading" @click="dialogVisible2=false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { deepClone } from '@/utils'
import { searchKafkaContent, sendKafkaContent } from '@/api/devops/kafka/search-content'
import { availableKafkaClusters, getKafkaClusterTopicInfo, listKafkaClusterTopics } from '@/api/devops/kafka/cluster'

export default {
  name: 'KafkaContent',
  data() {
    return {
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {
          type: 'LATEST', partition: -1, size: 1000, limit: '10'
        }
      },
      limitDisabled: false,
      record: {},
      content: '',
      activePartition: '',
      topic: {},
      topicPartitions: [],
      partitionOffset: {},
      partitionMessages: {},
      dialogLoading: false,
      dialogVisible: false,
      dialogVisible2: false,
      contentType: '',
      loading: false,
      options: {
        clusters: [],
        topics: []
      },
      loadingIns: null
    }
  },
  created() {
    // this.getList()
    this.getClusters()
  },
  methods: {
    getClusters() {
      availableKafkaClusters().then(resp => {
        if (resp.success) {
          this.options.clusters = resp.rows
        }
      })
    },
    getList() {
      if (!this.listQuery.params.clusterId || this.listQuery.params.clusterId === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (!this.listQuery.params.topicId || this.listQuery.params.topicId === '') {
        this.$message({
          type: 'warn',
          message: '请先选择主题...'
        })
        return
      }
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

      // this.listLoading = true
      searchKafkaContent(this.listQuery).then(resp => {
        if (resp.success) {
          this.contentType = 'STRING'
          if (resp.extra) this.contentType = resp.extra.contentType
          this.fillPartitionData(resp.rows[0].partitionMessages)
          this.partitionOffset = resp.rows[0].partitionOffset
        }
        // this.listLoading = false
      }).finally(() => {
        this.loadingIns.close()
      })
    },
    fillPartitionData(messages) {
      this.partitionMessages = []
      this.listQuery.total = 0
      this.topicPartitions.forEach(item => {
        this.listQuery.total += messages[item.partition].length
        this.partitionMessages.push(messages[item.partition])
      })
    },
    handleView(row) {
      this.content = JSON.parse(row.value)
      this.dialogVisible = true
    },
    handlePush(row) {
      this.dialogVisible2 = true
      this.record = {}
      if (row) {
        this.record = deepClone(row)
      }
    },
    async handleSend() {
      this.record.clusterId = this.listQuery.params.clusterId
      this.record.topic = this.topic.name
      let resp = null
      this.dialogLoading = true
      resp = await sendKafkaContent(this.record).catch(() => {}).finally(() => {
        this.dialogLoading = false
      })
      if (resp && resp.success) {
        this.dialogVisible2 = false
        this.$notify({
          title: `推送消息 Success!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.clusterId}</div>
          `,
          type: 'success'
        })
      }
    },
    async remoteMethod(query) {
      if (!this.listQuery.params.clusterId || this.listQuery.params.clusterId === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (query !== '') {
        this.loading = true
        listKafkaClusterTopics(this.listQuery.params.clusterId, query).then(resp => {
          this.loading = false
          if (resp.success) {
            this.options.topics = resp.rows
          }
        })
      } else {
        this.options.topics = []
      }
    },
    selectTopic(val) {
      getKafkaClusterTopicInfo(this.listQuery.params.clusterId, val).then(resp => {
        if (resp.success) {
          this.topic = resp.rows[0]
          this.topicPartitions = this.topic.partitions
        }
      })
    },
    handleTypeChange(val) {
      this.limitDisabled = val === '0'
    },
    handleClusterChange(val) {
      this.options.topics = []
      this.topicPartitions = []
    }
  }
}
</script>
<style>
.input-with-select .el-select .el-input {
  width: 130px;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>
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
    /*width: 360px;*/
  }
  .margin-top {
    margin-bottom: 15px;
  }

</style>
