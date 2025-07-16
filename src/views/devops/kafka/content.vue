<template>
  <div class="app-container">
    <!-- 搜索配置卡片 -->
    <el-card class="search-card" shadow="hover">

      <el-form :model="listQuery.params" :inline="true" class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-s-home" />
                集群名称
              </label>
              <el-select
                v-model="listQuery.params.clusterId"
                placeholder="请选择集群"
                class="form-select"
                @change="handleClusterChange"
              >
                <el-option
                  v-for="item in options.clusters"
                  :key="item.clusterName"
                  :label="item.clusterName"
                  :value="item.id"
                >
                  <span style="float: left">
                    <i class="el-icon-s-home" style="color: #409EFF; margin-right: 5px;" />
                    {{ item.clusterName }}
                  </span>
                </el-option>
              </el-select>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-s-order" />
                主题名称
              </label>
              <div class="topic-select-wrapper">
                <el-select
                  v-model="listQuery.params.topicId"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请输入关键词搜索主题"
                  :remote-method="remoteMethod"
                  :loading="loading"
                  class="topic-select"
                  @change="selectTopic"
                >
                  <el-option
                    v-for="item in options.topics"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <span style="float: left">
                      <i class="el-icon-s-order" style="color: #409EFF; margin-right: 5px;" />
                      {{ item.label }}
                    </span>
                  </el-option>
                </el-select>
                <el-button
                  class="refresh-btn"
                  icon="el-icon-refresh"
                  :loading="loading"
                  @click="refreshTopicPartition"
                />
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-s-grid" />
                分区号
              </label>
              <el-select
                v-model="listQuery.params.partition"
                class="form-select"
              >
                <el-option :value="-1" label="全部" />
                <el-option
                  v-for="item in topicPartitions"
                  :key="item.partition"
                  :label="`分区 ${item.partition}`"
                  :value="item.partition"
                />
              </el-select>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-s-operation" />
                搜索范围
              </label>
              <div class="range-input-wrapper">
                <el-select
                  v-model="listQuery.params.type"
                  placeholder="请选择"
                  class="range-type-select"
                  @change="handleTypeChange"
                >
                  <el-option label="最新" value="LATEST" />
                  <el-option label="最早" value="EARLIEST" />
                  <el-option label="全量" value="ALL" />
                </el-select>
                <el-input
                  v-model="listQuery.params.size"
                  placeholder="请输入范围"
                  class="range-size-input"
                >
                  <template slot="append">条</template>
                </el-input>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-s-data" />
                搜索量
              </label>
              <el-select v-model="listQuery.params.limit" class="form-select">
                <el-option label="10条" value="10" />
                <el-option label="50条" value="50" />
                <el-option label="100条" value="100" />
                <el-option label="200条" value="200" />
              </el-select>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-document" />
                搜索内容
              </label>
              <el-input
                v-model="listQuery.params.content"
                placeholder="搜索内容(包含信息)"
                class="form-input"
              />
            </div>
          </el-col>

          <el-col :span="12">
            <div class="form-item-wrapper">
              <label class="form-label">
                <i class="el-icon-key" />
                消息KEY
              </label>
              <el-input
                v-model="listQuery.params.key"
                placeholder="消息KEY"
                class="form-input"
              />
            </div>
          </el-col>
        </el-row>

        <div class="search-buttons">
          <el-badge v-permission="'KAFKA_CONTENT_SEARCH'" :value="listQuery.total" :max="99" class="search-badge">
            <el-button
              type="primary"
              icon="el-icon-search"
              :loading="listLoading"
              @click="getList"
            >
              查询
            </el-button>
          </el-badge>
          <el-button
            v-permission="['KAFKA_CONTENT_SEND']"
            type="success"
            icon="el-icon-plus"
            :disabled="topicPartitions.length === 0"
            @click="handlePush"
          >
            推送消息
          </el-button>
          <el-button
            type="default"
            icon="el-icon-refresh"
            @click="resetSearch"
          >
            重置
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 分区数据卡片 -->
    <el-card class="partition-card" shadow="hover">
      <div slot="header" class="partition-header">
        <span class="partition-title">
          <i class="el-icon-s-grid" />
          分区数据
        </span>
        <div class="partition-actions">
          <el-tag type="info" size="small">
            共 {{ topicPartitions.length }} 个分区
          </el-tag>
        </div>
      </div>

      <el-tabs v-model="activePartition" type="border-card" class="partition-tabs">
        <el-tab-pane
          v-for="(item, index) in topicPartitions"
          :key="item.partition"
          :label="`分区 ${item.partition}`"
          :name="item.partition+''"
        >
          <div class="partition-info">
            <el-descriptions :column="3" border class="partition-descriptions">
              <el-descriptions-item label="起始位置">
                <el-tag type="primary">{{ item.beginningOffset }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="结束位置">
                <el-tag type="success">{{ item.endOffset }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="可搜索量">
                <el-tag type="warning">{{ item.endOffset - item.beginningOffset }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <el-table
            v-show="partitionMessages.length>0"
            :data="partitionMessages[index]"
            border
            stripe
            class="message-table"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column width="100px" align="center" label="索引">
              <template slot-scope="scope">
                <div class="offset-index">
                  <!-- <i class="el-icon-s-data" /> -->
                  <span>{{ scope.row.offset }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column width="135px" align="center" label="Key">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.key" type="info" size="small">
                  {{ scope.row.key }}
                </el-tag>
                <span v-else class="no-data">-</span>
              </template>
            </el-table-column>

            <el-table-column label="内容" min-width="300">
              <template slot-scope="scope">
                <div class="message-content">
                  <span>{{ scope.row.value }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column width="180px" align="center" label="发送时间">
              <template slot-scope="scope">
                <div class="message-time">
                  <i class="el-icon-time" />
                  <span>{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="180" fixed="right">
              <template slot-scope="scope">
                <div class="message-actions">
                  <el-link
                    v-if="contentType!=='STRING'"
                    type="primary"
                    icon="el-icon-view"
                    @click="handleView(scope.row)"
                  >
                    JSON视图
                  </el-link>
                  <el-link
                    v-permission="['KAFKA_CONTENT_SEND']"
                    type="success"
                    icon="el-icon-position"
                    @click="handlePush(scope.row)"
                  >
                    重发
                  </el-link>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- JSON视图弹窗 -->
    <el-dialog
      :visible.sync="dialogVisible"
      title="消息JSON视图"
      width="80%"
      class="json-dialog"
    >
      <el-card class="json-card" shadow="hover">
        <div slot="header" class="json-header">
          <span class="json-title">
            <i class="el-icon-document" />
            JSON内容
          </span>
        </div>
        <pre class="json-content">{{ content }}</pre>
      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 推送消息弹窗 -->
    <el-dialog
      :visible.sync="dialogVisible2"
      title="推送主题消息"
      width="600px"
      class="push-dialog"
    >
      <el-card class="push-card" shadow="hover">
        <div slot="header" class="push-header">
          <span class="push-title">
            <i class="el-icon-s-promotion" />
            消息推送
          </span>
        </div>

        <el-form :model="record" label-width="100px" class="push-form">
          <el-form-item label="主题分区">
            <el-select
              v-model="record.partition"
              clearable
              placeholder="请选择分区"
              class="push-select"
            >
              <el-option
                v-for="item in topicPartitions"
                :key="item.partition"
                :label="`分区 ${item.partition}`"
                :value="item.partition"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="消息KEY">
            <el-input
              v-model="record.key"
              placeholder="消息KEY"
              class="push-input"
            />
          </el-form-item>

          <el-form-item label="发送消息">
            <el-input
              v-model="record.value"
              :autosize="{ minRows: 5, maxRows: 15}"
              type="textarea"
              placeholder="发送Kafka 消息"
              class="push-textarea"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="dialogLoading"
          icon="el-icon-s-promotion"
          @click="handleSend"
        >
          发送
        </el-button>
        <el-button
          type="danger"
          @click="dialogVisible2=false"
        >
          取消
        </el-button>
      </div>
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
    refreshTopicPartition() {
      this.selectTopic(this.listQuery.params.topicId)
    },
    resetSearch() {
      this.listQuery.params = {
        type: 'LATEST',
        partition: -1,
        size: 1000,
        limit: '10'
      }
      this.options.topics = []
      this.topicPartitions = []
      this.partitionMessages = []
      this.activePartition = ''
    },
    getList() {
      if (this.$isEmpty(this.listQuery.params.clusterId)) {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (this.$isEmpty(this.listQuery.params.topicId)) {
        this.$message({
          type: 'warn',
          message: '请先选择主题...'
        })
        return
      }

      this.listLoading = true
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

      searchKafkaContent(this.listQuery).then(resp => {
        if (resp.success) {
          this.contentType = 'STRING'
          if (resp.extra) this.contentType = resp.extra.contentType
          this.fillPartitionData(resp.rows[0].partitionMessages)
          this.partitionOffset = resp.rows[0].partitionOffset
        }
      }).finally(() => {
        this.listLoading = false
        this.loadingIns.close()
      })
    },
    fillPartitionData(messages) {
      this.partitionMessages = []
      this.listQuery.total = 0
      this.activePartition = ''
      this.topicPartitions.forEach(item => {
        if (messages[item.partition]) {
          this.listQuery.total += messages[item.partition].length
          this.partitionMessages.push(messages[item.partition])
          if (this.activePartition === '' && this.listQuery.total > 0) {
            this.activePartition = item.partition + ''
          }
        } else {
          this.partitionMessages.push([])
        }
      })
    },
    handleView(row) {
      try {
        this.content = JSON.parse(row.value)
        this.dialogVisible = true
      } catch (error) {
        this.$message.error('JSON格式错误')
      }
    },
    handlePush(row) {
      this.dialogVisible2 = true
      this.record = {}
      if (row) {
        this.record = deepClone(row)
      }
    },
    async handleSend() {
      if (!this.record.value || this.record.value.trim() === '') {
        this.$message.warning('请输入消息内容')
        return
      }

      this.record.clusterId = this.listQuery.params.clusterId
      this.record.topic = this.topic.name

      this.dialogLoading = true
      try {
        const resp = await sendKafkaContent(this.record)
        if (resp && resp.success) {
          this.dialogVisible2 = false
          this.$notify({
            title: '推送消息成功!',
            dangerouslyUseHTMLString: true,
            message: `
              <div>集群名称: ${this.record.clusterId}</div>
              <div>主题名称: ${this.record.topic}</div>
            `,
            type: 'success'
          })
        }
      } catch (error) {
        this.$message.error('推送消息失败: ' + (error.message || '未知错误'))
      } finally {
        this.dialogLoading = false
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
        try {
          const resp = await listKafkaClusterTopics(this.listQuery.params.clusterId, query)
          if (resp.success) {
            this.options.topics = resp.rows
          }
        } catch (error) {
          this.$message.error('获取主题列表失败')
        } finally {
          this.loading = false
        }
      } else {
        this.options.topics = []
      }
    },
    selectTopic(val) {
      if (!val) return

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
      this.partitionMessages = []
      this.activePartition = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

// 搜索卡片
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.search-header {
  display: flex;
  align-items: center;
}

.search-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    color: #409EFF;
  }
}

.search-form {
  padding: 0;
}

.form-item-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;

  i {
    margin-right: 6px;
    color: #409EFF;
  }
}

.form-select,
.form-input {
  width: 100%;
}

.topic-select-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topic-select {
  flex: 1;
}

.refresh-btn {
  flex-shrink: 0;
}

.range-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-type-select {
  width: 100px;
}

.range-size-input {
  flex: 1;
}

.search-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.search-badge {
  .el-badge__content {
    background-color: #409EFF;
  }
}

// 分区卡片
.partition-card {
  border-radius: 8px;
}

.partition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.partition-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    color: #409EFF;
  }
}

.partition-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.partition-tabs {
  border: none;

  .el-tabs__header {
    margin-bottom: 0;
  }
}

.partition-info {
  margin-bottom: 15px;
}

.partition-descriptions {
  border-radius: 6px;
  overflow: hidden;
}

.message-table {
  border-radius: 6px;
  overflow: hidden;
}

.offset-index {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Courier New', monospace;

  i {
    color: #409EFF;
  }
}

.message-content {
  word-break: break-all;
  line-height: 1.5;
}

.message-time {
  display: flex;
  align-items: center;
  gap: 4px;

  i {
    color: #67C23A;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
}

.no-data {
  color: #C0C4CC;
  font-style: italic;
}

// 弹窗样式
.json-dialog,
.push-dialog {
  .el-dialog__header {
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-dialog__title {
    font-weight: 600;
    color: #303133;
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

// JSON卡片
.json-card {
  border-radius: 8px;
}

.json-header {
  display: flex;
  align-items: center;
}

.json-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    color: #409EFF;
  }
}

.json-content {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

// 推送卡片
.push-card {
  border-radius: 8px;
}

.push-header {
  display: flex;
  align-items: center;
}

.push-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;

  i {
    margin-right: 8px;
    color: #409EFF;
  }
}

.push-form {
  padding: 0;
}

.push-select,
.push-input,
.push-textarea {
  width: 100%;
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .form-item-wrapper {
    margin-bottom: 10px;
  }

  .message-actions {
    flex-direction: column;
    gap: 5px;
  }

  .topic-select-wrapper,
  .range-input-wrapper {
    flex-direction: column;
    gap: 5px;
  }

  .topic-select,
  .range-type-select,
  .range-size-input {
    width: 100%;
  }
}

// 卡片悬停效果
.search-card:hover,
.partition-card:hover,
.json-card:hover,
.push-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

// 表格悬停效果
.message-table .el-table__row:hover {
  background-color: #f0f9ff !important;
}

// 标签样式优化
.el-tag {
  border-radius: 4px;
}

// 链接样式优化
.el-link {
  font-size: 13px;

  &:hover {
    text-decoration: none;
  }
}
</style>
