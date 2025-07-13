<template>
  <div class="app-container">

    <!-- 搜索类型标签页 -->
    <el-card class="search-card" shadow="hover">

      <!-- 集群选择区域 -->
      <div class="cluster-section">
        <div class="cluster-item-wrapper">
          <label class="cluster-label">
            <i class="el-icon-s-home" />
            集群选择
          </label>
          <el-select
            v-model="nameSrvAddr"
            placeholder="请选择集群"
            class="cluster-select"
            @change="changeNameSvr"
          >
            <el-option
              v-for="item in options.nameSrvList"
              :key="item.addr"
              :label="item.name + ' - ' + item.addr"
              :value="item.addr"
            >
              <span style="float: left">
                <i class="el-icon-s-home" style="color: #409EFF; margin-right: 5px;" />
                {{ item.name }}
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ item.addr }}
              </span>
            </el-option>
          </el-select>
        </div>
      </div>

      <el-tabs v-model="activeName" type="border-card" class="search-tabs">
        <el-tab-pane label="按Topic搜索" name="name1">
          <div class="tab-content">
            <div class="tab-description">
              <i class="el-icon-info" />
              最多返回2000条消息记录
            </div>

            <el-form :model="params" :inline="true" class="search-form">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="form-item-wrapper">
                    <label class="form-label">
                      <i class="el-icon-s-order" />
                      选择主题
                    </label>
                    <el-select
                      v-model="params.topicName"
                      filterable
                      placeholder="请选择主题"
                      class="form-select"
                      @change="handleClusterChange"
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
                  </div>
                </el-col>

                <el-col :span="8">
                  <div class="form-item-wrapper">
                    <label class="form-label">
                      <i class="el-icon-date" />
                      消息时间范围
                    </label>
                    <el-date-picker
                      v-model="dateOptions.s2e"
                      :picker-options="dateOptions.pickerOptions"
                      type="datetimerange"
                      value-format="timestamp"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      class="form-date-picker"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="按Message Key搜索" name="name2">
          <div class="tab-content">
            <div class="tab-description">
              <i class="el-icon-info" />
              最多返回64条消息记录
            </div>

            <el-form :model="params" :inline="true" class="search-form">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="form-item-wrapper">
                    <label class="form-label">
                      <i class="el-icon-s-order" />
                      选择主题
                    </label>
                    <el-select
                      v-model="params.topicName"
                      filterable
                      placeholder="请选择主题"
                      class="form-select"
                      @change="handleClusterChange"
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
                  </div>
                </el-col>

                <el-col :span="8">
                  <div class="form-item-wrapper">
                    <label class="form-label">
                      <i class="el-icon-key" />
                      消息Key
                    </label>
                    <el-input
                      v-model="params.key"
                      placeholder="请输入消息Key"
                      class="form-input"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="按Message ID搜索" name="name3">
          <div class="tab-content">
            <div class="tab-description">
              <i class="el-icon-warning" />
              生产者客户端版本>=v3.5.8时，Topic不能为空
            </div>

            <el-form :model="params" :inline="true" class="search-form">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="form-item-wrapper">
                    <label class="form-label">
                      <i class="el-icon-s-order" />
                      选择主题
                    </label>
                    <el-select
                      v-model="params.topicName"
                      filterable
                      placeholder="请选择主题"
                      class="form-select"
                      @change="handleClusterChange"
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
                  </div>
                </el-col>

                <el-col :span="8">
                  <div class="form-item-wrapper">
                    <label class="form-label">
                      <i class="el-icon-document" />
                      消息ID
                    </label>
                    <el-input
                      v-model="params.msgId"
                      placeholder="请输入消息ID"
                      class="form-input"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="search-buttons">
        <el-button
          v-permission="'ROCKET_MQ_MESSAGE_SEARCH'"
          type="primary"
          icon="el-icon-search"
          :loading="table.main.loading"
          @click="handleSearch"
        >
          {{ $t('btn.search') }}
        </el-button>
        <el-button
          type="default"
          icon="el-icon-refresh"
          @click="resetSearch"
        >
          重置
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格卡片 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="table-header">
        <span class="table-title">
          <i class="el-icon-s-data" />
          消息列表
        </span>
        <div class="table-actions">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            size="small"
            :loading="table.main.loading"
            @click="refreshData"
          >
            刷新数据
          </el-button>
          <el-tag type="info" size="small">
            共 {{ table.main.total }} 条消息
          </el-tag>
        </div>
      </div>

      <el-table
        v-loading="table.main.loading"
        :data="paginatedData"
        border
        stripe
        class="message-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="消息ID" prop="msgId" min-width="100">
          <template slot-scope="{row}">
            <div class="message-id">
              <i class="el-icon-document" />
              <span>{{ row.msgId }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标签" prop="properties.TAGS" width="150">
          <template slot-scope="{row}">
            <el-tag v-if="row.properties.TAGS" type="info" size="small">
              {{ row.properties.TAGS }}
            </el-tag>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <el-table-column label="键值" prop="properties.KEYS">
          <template slot-scope="{row}">
            <el-tag v-if="row.properties.KEYS" type="warning" size="small">
              {{ row.properties.KEYS }}
            </el-tag>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>

        <el-table-column label="存储时间" width="180" align="center">
          <template slot-scope="scope">
            <div class="store-time">
              <i class="el-icon-time" />
              <span>{{ scope.row.storeTimestamp | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" :label="$t('label.actions')" width="120" fixed="right">
          <template slot-scope="scope">
            <el-link
              v-permission="'ROCKETMQ_CLUSTER_DETAIL'"
              type="primary"
              icon="el-icon-view"
              @click="handleDetail(scope.row)"
            >
              {{ $t('label.detail') }}
            </el-link>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="table.main.total>0"
        :total="table.main.total"
        :page.sync="table.main.page"
        :limit.sync="table.main.limit"
      />
    </el-card>

    <!-- 消息详情弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.detail"
      :title="dialog.title"
      width="900px"
      class="detail-dialog"
    >
      <el-card class="message-detail-card" shadow="hover">
        <div slot="header" class="detail-header">
          <span class="detail-title">
            <i class="el-icon-document" />
            消息基本信息
          </span>
        </div>

        <el-form :model="dialog.record" label-width="120px" :disabled="true" class="detail-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="消息ID">
                <el-input v-model="dialog.record.msgId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="主题">
                <el-input v-model="dialog.record.topic" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标签">
                <el-input v-model="dialog.record.properties.TAGS" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="键值">
                <el-input v-model="dialog.record.properties.KEYS" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="存储时间">
            <el-date-picker
              v-model="dialog.record.storeTimestamp"
              type="datetime"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="消息内容">
            <el-input
              v-model="dialog.record.messageBody"
              :rows="6"
              type="textarea"
              placeholder="消息内容"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="track-card" shadow="hover">
        <div slot="header" class="track-header">
          <span class="track-title">
            <i class="el-icon-s-marketing" />
            消息轨迹
          </span>
        </div>

        <el-table
          :data="dialog.data"
          border
          stripe
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column label="消费者组" prop="consumerGroup" />
          <el-table-column label="轨迹类型" prop="trackType" width="120" align="center" />
          <el-table-column align="center" :label="$t('label.actions')" width="150" fixed="right">
            <template slot-scope="scope">
              <div class="track-actions">
                <el-link
                  v-permission="'ROCKETMQ_MESSAGE_RESEND'"
                  type="success"
                  icon="el-icon-s-promotion"
                  @click="handleSend(scope.row)"
                >
                  重发
                </el-link>
                <el-link
                  type="danger"
                  icon="el-icon-view"
                  @click="handleDetail2(scope.row)"
                >
                  {{ $t('label.detail') }}
                </el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.detail=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRocketMQTopic
} from '@/api/rocketmq/topic'
import { listRocketMQMessage, listRocketMQMessage2, detailRocketMQMessage, resendRocketMQMessage } from '@/api/rocketmq/message'
import { isEmpty } from '@/utils/validate'
import { listRocketMQNameSrv } from '@/api/rocketmq/name-srv'
import Cookies from 'js-cookie'

export default {
  name: 'RocketMQMessage',
  data() {
    return {
      params: {},
      record: {},
      dateOptions: {
        pickerOptions: {
          shortcuts: [{
            text: '前后半小时',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 30 * 60 * 1000)
              end.setTime(end.getTime() + 30 * 60 * 1000)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近六小时',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 6)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近12小时',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 12)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近7天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }]
        },
        s2e: []
      },
      brokerServer: {},
      brokers: {},
      table: {
        main: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        }
      },
      dialog: {
        visible: {
          detail: false
        },
        loading: false,
        type: '',
        title: '消息详细信息',
        params: {},
        record: { properties: {}},
        data: []
      },
      activeName: 'name1',
      nameSrvAddr: '',
      options: {
        nameSrvList: [],
        topics: []
      }
    }
  },
  computed: {
    paginatedData() {
      const start = (this.table.main.page - 1) * this.table.main.limit
      const end = start + this.table.main.limit
      return this.table.main.data.slice(start, end)
    }
  },
  created() {
    this.listNameSvr()
    this.getTopics()
    this.initParams()
  },
  methods: {
    listNameSvr() {
      this.nameSrvAddr = Cookies.get('nameSrvAddr')
      listRocketMQNameSrv().then(resp => {
        if (resp.success) {
          this.options.nameSrvList = resp.rows
          if (this.options.nameSrvList.length > 0) {
            if (!this.nameSrvAddr) {
              this.nameSrvAddr = this.options.nameSrvList[0].addr
              Cookies.set('nameSrvAddr', this.nameSrvAddr)
            }
          }
        }
      })
    },
    changeNameSvr() {
      Cookies.set('nameSrvAddr', this.nameSrvAddr)
      this.getTopics()
    },
    refreshData() {
      this.getTopics()
      this.handleSearch()
    },
    resetSearch() {
      this.params = {}
      this.dateOptions.s2e = []
      this.initParams()
    },
    getTopics() {
      listRocketMQTopic().then(resp => {
        if (resp.success) {
          const { topicList } = resp.rows[0]
          topicList.sort()
          this.options.topics = []
          for (let i = 0; i < topicList.length; i++) {
            this.options.topics.push({ label: topicList[i], value: topicList[i] })
          }
        }
      })
    },
    initParams() {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 30 * 60 * 1000) // 当前时间前30分钟
      end.setTime(end.getTime() + 30 * 60 * 1000) // 当前时间后30分钟
      this.dateOptions.s2e = [start.getTime(), end.getTime()]
    },
    handleClusterChange(val) {
    },
    async handleDetail(row) {
      try {
        this.dialog.record = { properties: {}}
        this.dialog.data = []
        const resp = await detailRocketMQMessage({ topic: row.topic, msgId: row.msgId })
        if (resp.success && resp.rows && resp.rows.length > 0) {
          this.dialog.visible.detail = true
          const { messageTrackList, messageView } = resp.rows[0]
          this.dialog.record = messageView || { properties: {}}
          this.dialog.data = messageTrackList || []
        } else {
          this.$message.error('获取消息详情失败')
        }
      } catch (error) {
        console.error('handleDetail error:', error)
        this.$message.error('获取消息详情失败: ' + (error.message || '未知错误'))
      }
    },
    async handleSend(row) {
      try {
        const resp = await resendRocketMQMessage({
          consumerGroup: row.consumerGroup,
          msgId: this.dialog.record.msgId,
          topic: this.dialog.record.topic
        })
        if (resp.success) {
          this.$message.success('消息重发成功!')
        } else {
          this.$message.error(resp.message || '消息重发失败')
        }
      } catch (error) {
        console.error('handleSend error:', error)
        this.$message.error('消息重发失败: ' + (error.message || '未知错误'))
      }
    },
    handleDetail2(row) {
      let msg = '暂无异常信息'
      if (row.exceptionDesc) {
        msg = row.exceptionDesc
      }
      this.$alert(msg, '异常详情', {
        confirmButtonText: this.$t('btn.confirm'),
        callback: action => {
        }
      })
    },
    async handleSearch() {
      if (isEmpty(this.params.topicName)) {
        this.$message.warning('请选择主题!')
        return
      }

      try {
        this.table.main.loading = true
        let resp

        if (this.activeName === 'name2') {
          if (isEmpty(this.params.key)) {
            this.$message.warning('请输入消息Key!')
            return
          }
          resp = await listRocketMQMessage2({ topic: this.params.topicName, key: this.params.key })
        } else if (this.activeName === 'name3') {
          if (isEmpty(this.params.msgId)) {
            this.$message.warning('请输入消息ID!')
            return
          }
          this.handleDetail({ topic: this.params.topicName, msgId: this.params.msgId })
          return
        } else {
          if (this.dateOptions.s2e.length < 2) {
            this.$message.warning('请选择时间范围!')
            return
          }
          resp = await listRocketMQMessage({
            topic: this.params.topicName,
            begin: this.dateOptions.s2e[0],
            end: this.dateOptions.s2e[1]
          })
        }

        if (resp && resp.success) {
          this.table.main.data = resp.rows || []
          this.table.main.total = resp.rows ? resp.rows.length : 0
        } else {
          this.$message.error('搜索失败')
        }
      } catch (error) {
        console.error('handleSearch error:', error)
        this.$message.error('搜索失败: ' + (error.message || '未知错误'))
      } finally {
        this.table.main.loading = false
      }
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

// 集群选择区域
.cluster-section {
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
}

.cluster-item-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.cluster-label {
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

.cluster-select {
  width: 100%;
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

.search-tabs {
  border: none;

  .el-tabs__header {
    margin-bottom: 0;
  }
}

.tab-content {
  padding: 0px;
}

.tab-description {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  i {
    margin-right: 6px;
    color: #E6A23C;
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
.form-input,
.form-date-picker {
  width: 100%;
}

.search-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

// 表格卡片
.table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.table-title {
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

.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-table {
  border-radius: 6px;
  overflow: hidden;
}

.message-id {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', monospace;

  i {
    color: #409EFF;
  }
}

.store-time {
  display: flex;
  align-items: center;
  gap: 6px;

  i {
    color: #67C23A;
  }
}

.no-data {
  color: #C0C4CC;
  font-style: italic;
}

// 弹窗样式
.detail-dialog {
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

// 消息详情卡片
.message-detail-card,
.track-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.detail-header,
.track-header {
  display: flex;
  align-items: center;
}

.detail-title,
.track-title {
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

.detail-form {
  padding: 0;
}

.track-actions {
  display: flex;
  gap: 8px;
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .form-item-wrapper {
    margin-bottom: 10px;
  }

  .cluster-section {
    padding: 10px;
  }

  .track-actions {
    flex-direction: column;
    gap: 5px;
  }
}

// 卡片悬停效果
.search-card:hover,
.table-card:hover,
.message-detail-card:hover,
.track-card:hover {
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
