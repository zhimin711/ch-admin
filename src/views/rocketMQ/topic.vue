<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="el-icon-s-order" />
          <span>RocketMQ 主题管理</span>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            size="small"
            :loading="table.main.loading"
            @click="refreshData"
          >
            刷新数据
          </el-button>
        </div>
      </div>
      <div class="header-description">
        管理RocketMQ主题的创建、配置、监控和消息发送
      </div>
    </div>

    <!-- 筛选条件卡片 -->
    <el-card class="filter-card" shadow="hover">
      <div slot="header" class="filter-header">
        <span class="filter-title">
          <i class="el-icon-s-operation" />
          主题筛选
        </span>
        <div class="filter-actions">
          <el-button
            v-permission="'ROCKET_MQ_TOPIC_ADD'"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleAdd"
          >
            创建主题
          </el-button>
        </div>
      </div>

      <el-form :inline="true" class="filter-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="filter-item-wrapper">
              <label class="filter-label">
                <i class="el-icon-s-home" />
                集群选择
              </label>
              <el-select
                v-model="nameSrvAddr"
                placeholder="请选择集群"
                class="filter-select"
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
          </el-col>

          <el-col :span="8">
            <div class="filter-item-wrapper">
              <label class="filter-label">
                <i class="el-icon-s-order" />
                主题名称
              </label>
              <el-input
                v-model="table.main.params.topicName"
                placeholder="请输入主题名称"
                class="filter-input"
                clearable
                @clear="getList"
              >
                <i slot="prefix" class="el-input__icon el-icon-search" />
              </el-input>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="filter-item-wrapper">
              <label class="filter-label">
                <i class="el-icon-s-grid" />
                主题类型
              </label>
              <el-checkbox-group v-model="checkList" class="filter-checkbox-group">
                <el-checkbox label="普通">
                  <i class="el-icon-s-order" style="color: #409EFF; margin-right: 5px;" />
                  普通
                </el-checkbox>
                <el-checkbox label="重试">
                  <i class="el-icon-refresh" style="color: #E6A23C; margin-right: 5px;" />
                  重试
                </el-checkbox>
                <el-checkbox label="死信">
                  <i class="el-icon-warning" style="color: #F56C6C; margin-right: 5px;" />
                  死信
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-col>
        </el-row>

        <div class="filter-buttons">
          <el-button
            v-permission="'ROCKET_MQ_TOPIC_SEARCH'"
            type="primary"
            icon="el-icon-search"
            @click="getList"
          >
            {{ $t('btn.search') }}
          </el-button>
          <el-button
            type="default"
            icon="el-icon-refresh"
            @click="resetFilters"
          >
            {{ $t('btn.reset') }}
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格卡片 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="table-header">
        <span class="table-title">
          <i class="el-icon-s-data" />
          主题列表
        </span>
        <div class="table-actions">
          <el-tag type="info" size="small">
            共 {{ filteredData.length }} 个主题
          </el-tag>
        </div>
      </div>

      <el-table
        v-loading="table.main.loading"
        :data="paginatedData"
        border
        stripe
        class="topic-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="主题名称" prop="topicName" min-width="200">
          <template slot-scope="{row}">
            <div class="topic-name">
              <i class="el-icon-s-order" />
              <span>{{ row.topicName }}</span>
              <el-tag
                v-if="row.topicName.startsWith('%R')"
                type="warning"
                size="mini"
              >
                重试
              </el-tag>
              <el-tag
                v-else-if="row.topicName.startsWith('%D')"
                type="danger"
                size="mini"
              >
                死信
              </el-tag>
              <el-tag
                v-else
                type="success"
                size="mini"
              >
                普通
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" :label="$t('label.actions')" width="400" fixed="right">
          <template slot-scope="scope">
            <div class="action-links">
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_STATUS'"
                type="warning"
                icon="el-icon-view"
                @click="handleStatus(scope.row, scope.$index)"
              >
                {{ $t('label.status') }}
              </el-link>
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_ROUTE'"
                type="primary"
                icon="el-icon-share"
                @click="handleRoute(scope.row, scope.$index)"
              >
                路由
              </el-link>
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_CONSUMER'"
                type="info"
                icon="el-icon-connection"
                @click="handleConsume(scope.row, scope.$index)"
              >
                Consumer管理
              </el-link>
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_CONFIG'"
                type="primary"
                icon="el-icon-set-up"
                @click="handleEdit(scope.row, scope.$index)"
              >
                配置
              </el-link>
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_SEND'"
                type="success"
                icon="el-icon-s-promotion"
                @click="handleSend(scope.row)"
              >
                发消息
              </el-link>
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_RESET'"
                type="warning"
                icon="el-icon-refresh"
                @click="handleOffset(scope.row)"
              >
                重置消费起点
              </el-link>
              <el-link
                v-permission="'ROCKET_MQ_TOPIC_DELETE'"
                type="danger"
                icon="el-icon-delete"
                @click="handleDel(scope.row)"
              >
                {{ $t('btn.delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="table.main.total>0"
        :total="filteredData.length"
        :page.sync="table.main.page"
        :limit.sync="table.main.limit"
        @pagination="handlePageChange"
      />
    </el-card>

    <!-- 创建/编辑主题弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.addOrEdit"
      :title="dialog.type==='edit'?'修改主题信息':'创建主题'"
      width="800px"
      class="topic-dialog"
    >
      <el-form :model="record" label-width="120px" label-position="left">
        <el-tabs v-model="dialog.activeName" type="border-card">
          <el-tab-pane label="基本配置" name="first">
            <el-form-item v-if="dataForm.visible.clusterName" label="集群名称">
              <el-select v-model="record.clusterNameList" multiple :placeholder="$t('input.tips.select')" style="width: 100%">
                <el-option
                  v-for="item in options.clusters"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="代理名">
              <el-select v-model="record.brokerNameList" multiple :placeholder="$t('input.tips.select')" style="width: 100%" :disabled="dataForm.disable.brokerName">
                <el-option
                  v-for="item in options.brokers"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="主题名称">
              <el-input v-model="record.topicName" placeholder="主题名称" :disabled="dataForm.disable.topicName" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="写队列数量">
                  <el-input-number v-model="record.writeQueueNums" :min="1" :max="1024" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="读队列数量">
                  <el-input-number v-model="record.readQueueNums" :min="1" :max="1024" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="权限">
                  <el-input-number v-model="record.perm" :min="0" :max="10" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="顺序消息">
                  <el-switch
                    v-model="record.order"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    :active-text="$t('label.enable')"
                    :inactive-text="$t('label.disable')"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="扩展配置" name="second">
            <el-form-item label="存储类型">
              <el-select v-model="record.type" placeholder="请选择" style="width: 100%">
                <el-option key="JSON" label="JSON" value="JSON" />
                <el-option key="STRING" label="STRING" value="STRING" />
                <el-option key="PROTO_STUFF" label="PROTO_STUFF" value="PROTO_STUFF" />
              </el-select>
            </el-form-item>
            <el-form-item label="存储Jar包">
              <el-input v-model="record.classFile" placeholder="存储Jar包" />
            </el-form-item>
            <el-form-item label="存储对象">
              <el-input v-model="record.className" placeholder="存储对象" />
            </el-form-item>
            <el-form-item label="说明">
              <el-input
                v-model="record.description"
                :autosize="{ minRows: 2, maxRows: 4}"
                type="textarea"
                placeholder="主题说明"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialog.visible.addOrEdit=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 主题状态弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.status"
      :title="dialog.title"
      width="800px"
      class="status-dialog"
    >
      <el-table
        :data="table.stats.data"
        max-height="500"
        border
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="队列" prop="queue" />
        <el-table-column label="最小位点" prop="minOffset" width="100" align="center" />
        <el-table-column label="最大位点" prop="maxOffset" width="100" align="center" />
        <el-table-column label="上次更新时间" prop="lastUpdate" width="180" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.status=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <!-- 路由信息弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.route"
      :title="dialog.title"
      width="900px"
      class="route-dialog"
    >
      <el-card class="route-card" shadow="hover">
        <div slot="header" class="route-header">
          <span class="route-title">
            <i class="el-icon-s-home" />
            代理信息
          </span>
        </div>
        <div v-for="o in list.a" :key="o.brokerName" class="broker-info">
          <el-row class="broker-row">
            <el-col :span="4">
              <strong>代理名:</strong>
            </el-col>
            <el-col :span="20">
              <el-tag type="primary">{{ o.brokerName }}</el-tag>
            </el-col>
          </el-row>
          <el-row class="broker-addr-row">
            <el-col :span="4">
              <strong>代理地址:</strong>
            </el-col>
            <el-col :span="20">
              <div v-for="(p,k) in o.brokerAddrs" :key="p" class="addr-item">
                <el-tag size="small" type="info">{{ k }}</el-tag>
                <span class="addr-value">{{ p }}</span>
              </div>
            </el-col>
          </el-row>
          <el-divider content-position="right">
            <el-tag type="success">[{{ o.brokerName }}] End</el-tag>
          </el-divider>
        </div>
      </el-card>

      <el-card class="queue-card" shadow="hover">
        <div slot="header" class="queue-header">
          <span class="queue-title">
            <i class="el-icon-s-data" />
            队列信息
          </span>
        </div>
        <el-table
          :data="list.b"
          max-height="500"
          border
          stripe
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column label="代理名" prop="brokerName" />
          <el-table-column label="读队列数量" prop="readQueueNums" width="120" align="center" />
          <el-table-column label="写队列数量" prop="writeQueueNums" width="120" align="center" />
          <el-table-column label="权限" prop="perm" width="100" align="center" />
        </el-table>
      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.route=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <!-- 重置位点弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.offset"
      title="重置消费位点"
      width="500px"
      class="offset-dialog"
    >
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="订阅组">
          <el-select v-model="record.consumerGroup" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in list.consumeGroup"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间点">
          <el-date-picker
            v-model="record.offset"
            type="datetime"
            placeholder="选择时间"
            value-format="timestamp"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-permission="'ROCKET_MQ_CONSUMER_RESET_OFFSET'" type="primary" @click="handleResetSubmit">{{ $t('btn.reset') }}</el-button>
        <el-button type="danger" @click="dialog.visible.offset=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 发送消息弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.send"
      title="推送主题消息"
      width="600px"
      class="send-dialog"
    >
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="主题名称">
          <el-input v-model="record.topic" placeholder="主题名称" :disabled="dataForm.disable.topicName" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标签">
              <el-input v-model="record.tag" placeholder="标签" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="键值">
              <el-input v-model="record.key" placeholder="键值" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="消息内容">
          <el-input
            v-model="record.messageBody"
            :autosize="{ minRows: 5, maxRows: 15}"
            type="textarea"
            placeholder="请输入要发送的消息内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="dialog.loading" @click="submitSend">发送</el-button>
        <el-button type="danger" :loading="dialog.loading" @click="dialog.visible.send=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- Consumer管理弹窗 -->
    <el-dialog
      :visible.sync="dialog.visible.consumer"
      :title="dialog.title + '订阅组'"
      width="80%"
      class="consumer-dialog"
    >
      <div v-if="list.consumeGroup.length === 0" class="empty-consumer">
        <i class="el-icon-warning" />
        <span>暂无订阅组信息</span>
      </div>
      <div v-for="(item2,index) in list.consumeGroup" :key="'consumeGroup'+index">
        <el-card v-for="(item, k) in item2" :key="'consumeGroup'+k" class="consumer-card" shadow="hover">
          <div slot="header" class="consumer-header">
            <div class="consumer-info">
              <span class="consumer-group">
                <i class="el-icon-s-custom" />
                订阅组: <el-tag type="primary">{{ k }}</el-tag>
              </span>
              <span class="consumer-delay">
                <i class="el-icon-time" />
                延迟: <el-tag type="warning">{{ item.diffTotal }}</el-tag>
              </span>
              <span class="consumer-time">
                <i class="el-icon-date" />
                最后消费时间: <el-tag type="success">{{ item.lastTimestamp | parseTime }}</el-tag>
              </span>
            </div>
          </div>
          <el-table
            :data="item.queueStatInfoList"
            max-height="400"
            border
            stripe
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column label="Broker" prop="brokerName" />
            <el-table-column label="队列" prop="queueId" width="80" align="center" />
            <el-table-column label="客户端" prop="clientInfo" min-width="150" />
            <el-table-column label="Broker位点" prop="brokerOffset" width="120" align="center" />
            <el-table-column label="消费位点" prop="consumerOffset" width="120" align="center" />
            <el-table-column label="延迟" prop="diffTotal" width="100" align="center" />
            <el-table-column label="最后时间" prop="lastTimestamp" width="180" align="center">
              <template slot-scope="{row}">
                {{ row.lastTimestamp | parseTime }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.consumer=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { parseTime } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { listRocketMQ } from '@/api/rocketmq/cluster'
import {
  listRocketMQTopic,
  getRocketMQTopicStatus,
  getRocketMQTopicRoute,
  getRocketMQTopic,
  addRocketMQTopic,
  editRocketMQTopic,
  getRocketMQTopicConsumer,
  getRocketMQTopicConsumerInfo,
  sendRocketMQTopicMessage,
  deleteRocketMQTopic
} from '@/api/rocketmq/topic'
import { resetRocketMQConsumerOffset } from '@/api/rocketmq/consumer'
import { getTopics, refresh2 } from '@/api/devops/kafka/topic'
import { listRocketMQNameSrv } from '@/api/rocketmq/name-srv'
import Cookies from 'js-cookie'

const defaultRecord = {
  'writeQueueNums': 16,
  'readQueueNums': 16,
  'perm': 6,
  'order': false,
  'type': 'JSON'
}
export default {
  name: 'RocketMQTopic',
  components: { Pagination },
  data() {
    return {
      checkList: ['普通'],
      table: {
        main: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        },
        stats: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        }
      },
      record: {},
      dialog: {
        title: '',
        loading: false,
        visible: {
          addOrEdit: false,
          status: false,
          consumer: false,
          route: false,
          send: false,
          offset: false,
          sync: false
        },
        type: '',
        activeName: 'first'
      },
      dataForm: {
        disable: {
          clusterName: false,
          brokerName: false,
          topicName: false
        },
        visible: {
          clusterName: true
        }
      },
      list: {
        loading: false,
        consumeGroup: [],
        a: [],
        b: []
      },
      consumeGroupMap: {},
      options: {
        clusters: [],
        brokers: [],
        topics: [],
        nameSrvList: []
      },
      nameSrvAddr: '',
      loading: false
    }
  },
  computed: {
    filteredData() {
      return this.table.main.data.filter(item => this.filterData(item))
    },
    paginatedData() {
      const start = (this.table.main.page - 1) * this.table.main.limit
      const end = start + this.table.main.limit
      return this.filteredData.slice(start, end)
    }
  },
  created() {
    this.listNameSvr()
    this.getList()
    // this.getClusters()
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
            }
          }
        }
      })
    },
    changeNameSvr() {
      Cookies.set('nameSrvAddr', this.nameSrvAddr)
      this.getList()
    },
    refreshData() {
      this.getList()
    },
    resetFilters() {
      this.table.main.params = {}
      this.checkList = ['普通']
      this.getList()
    },
    async getClusters() {
      await listRocketMQ().then(resp => {
        if (resp.success) {
          const { brokerServer, clusterInfo } = resp.rows[0]

          if (clusterInfo.clusterAddrTable) {
            this.options.clusters = []
            for (const k in clusterInfo.clusterAddrTable) {
              this.options.clusters.push({ value: k, label: k })
            }
            // this.brokers = this.generateBrokerMap(brokerServer, clusterInfo.clusterAddrTable, clusterInfo.brokerAddrTable)
          }
          if (brokerServer) {
            this.options.brokers = []
            for (const k in brokerServer) {
              this.options.brokers.push({ value: k, label: k })
            }
          }
        }
      })
    },
    handlePageChange(val) {
      // this.table.main.page = val;
    },
    getList() {
      this.table.main.loading = true
      listRocketMQTopic().then(resp => {
        this.table.main.loading = false
        if (resp.success) {
          const { topicList } = resp.rows[0]
          topicList.sort()
          this.table.main.data = []
          for (let i = 0; i < topicList.length; i++) {
            this.table.main.data.push({ topicName: topicList[i] })
          }
          this.table.main.total = topicList.length
        }
      }).finally(() => { this.loading = false })
    },
    async handleStatus(row) {
      try {
        const resp = await getRocketMQTopicStatus({ topic: row.topicName })
        if (resp.success && resp.rows && resp.rows.length > 0) {
          const { offsetTable } = resp.rows[0]
          this.table.stats.data = []
          for (const k in offsetTable) {
            this.table.stats.data.push({
              queue: k,
              minOffset: offsetTable[k].minOffset,
              maxOffset: offsetTable[k].maxOffset,
              lastUpdate: parseTime(offsetTable[k].lastUpdateTimestamp, '{y}-{m}-{d} {h}:{i}:{s}')
            })
          }
          this.dialog.title = `[${row.topicName}] ${this.$t('label.status')}`
          this.dialog.visible.status = true
        } else {
          this.$message.error('获取主题状态信息失败')
        }
      } catch (error) {
        console.error('handleStatus error:', error)
        this.$message.error('获取主题状态信息失败: ' + (error.message || '未知错误'))
      }
    },
    async handleRoute(row) {
      try {
        const resp = await getRocketMQTopicRoute({ topic: row.topicName })
        if (resp.success && resp.rows && resp.rows.length > 0) {
          const { brokerDatas, queueDatas } = resp.rows[0]
          this.list.a = brokerDatas || []
          this.list.b = queueDatas || []
          this.dialog.title = `[${row.topicName}] 路由信息`
          this.dialog.visible.route = true
        } else {
          this.$message.error('获取主题路由信息失败')
        }
      } catch (error) {
        console.error('handleRoute error:', error)
        this.$message.error('获取主题路由信息失败: ' + (error.message || '未知错误'))
      }
    },
    async handleAdd() {
      await this.getClusters()
      this.record = Object.assign({}, defaultRecord)
      this.dialog.visible.addOrEdit = true
      this.dialog.type = 'new'
      this.dataForm.visible.clusterName = true
      this.dataForm.disable.brokerName = false
      this.dataForm.disable.topicName = false
    },
    async handleEdit(row) {
      try {
        await this.getClusters()
        const resp = await getRocketMQTopic({ topic: row.topicName })
        if (resp.success && resp.rows && resp.rows.length > 0) {
          this.record = resp.rows[0]
          this.dialog.visible.addOrEdit = true
          this.dialog.type = 'edit'
          this.dataForm.visible.clusterName = false
          this.dataForm.disable.brokerName = true
          this.dataForm.disable.topicName = true
        } else {
          this.$message.error('获取主题配置信息失败')
        }
      } catch (error) {
        console.error('handleEdit error:', error)
        this.$message.error('获取主题配置信息失败: ' + (error.message || '未知错误'))
      }
    },
    async handleConsume(row) {
      try {
        const resp = await getRocketMQTopicConsumer({ topic: row.topicName })
        if (resp.success) {
          this.dialog.record = row
          this.list.consumeGroup = resp.rows || []
          this.dialog.title = `[${row.topicName}] Consumer管理`
          this.dialog.visible.consumer = true
        } else {
          this.$message.error('获取Consumer信息失败')
        }
      } catch (error) {
        console.error('handleConsume error:', error)
        this.$message.error('获取Consumer信息失败: ' + (error.message || '未知错误'))
      }
    },
    handleSend(row) {
      this.record = { topic: row.topicName }
      this.dialog.visible.send = true
      this.dataForm.disable.topicName = true
    },
    async submitSend() {
      try {
        this.dialog.loading = true
        const resp = await sendRocketMQTopicMessage(this.record)
        if (resp.success) {
          this.$message.success('消息发送成功!')
          this.dialog.visible.send = false
        } else {
          this.$message.error(resp.message || '消息发送失败')
        }
      } catch (error) {
        console.error('submitSend error:', error)
        this.$message.error('消息发送失败: ' + (error.message || '未知错误'))
      } finally {
        this.dialog.loading = false
      }
    },
    async handleOffset(row) {
      try {
        const resp = await getRocketMQTopicConsumerInfo({ topic: row.topicName })
        if (resp.success && resp.rows && resp.rows.length > 0) {
          this.record = Object.assign({}, defaultRecord)
          this.dialog.record = row
          const { groupList } = resp.rows[0]
          this.list.consumeGroup = groupList || []
          this.dialog.visible.offset = true
        } else {
          this.$message.error('未找到主题消费者信息: ' + row.topicName)
        }
      } catch (error) {
        console.error('handleOffset error:', error)
        this.$message.error('获取消费者信息失败: ' + (error.message || '未知错误'))
      }
    },
    handleDel(row) {
      const _this = this
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      }).then(() => {
        deleteRocketMQTopic({ topic: row.topicName }).then(resp => {
          if (resp.success) {
            _this.getList()
            _this.$message.success(this.$t('message.deleteSuccess'))
          }
        })
      }).catch(err => { console.error(err) })
    },
    handleRefresh(row) {
      this.$confirm('请确认是否重建主题，当前主题消息将删除?', '重建主题', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await refresh2(row)
          this.$message.success('重建主题成功!')
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      try {
        const _this = this
        let resp = null
        let opName = '添加'

        if (this.dialog.type === 'new') {
          resp = await addRocketMQTopic(this.record)
        } else if (this.dialog.type === 'edit') {
          opName = '修改'
          // 确保有id字段，如果没有则使用topicName
          const editData = { ...this.record }
          if (!editData.id && editData.topicName) {
            editData.id = editData.topicName
          }
          resp = await editRocketMQTopic(editData.id, editData)
        } else {
          this.$message.error('未知操作类型!')
          return
        }

        if (resp.success) {
          this.dialog.visible.addOrEdit = false
          this.$notify({
            title: `${opName}主题成功!`,
            dangerouslyUseHTMLString: true,
            message: `
              <div>主题名称: ${this.record.topicName}</div>
            `,
            type: 'success'
          })
          _this.getList()
        } else {
          this.$message.error(resp.message || `${opName}主题失败`)
        }
      } catch (error) {
        console.error('handleSubmit error:', error)
        this.$message.error('操作失败: ' + (error.message || '未知错误'))
      }
    },
    handleSync() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible2 = true
    },
    async handleResetSubmit() {
      this.dialogVisible2 = false
      const param = { 'resetTime': this.record.offset, 'consumerGroupList': [], 'topic': this.dialog.record.topic, 'force': true }
      param.consumerGroupList.push(this.record.consumerGroup)
      resetRocketMQConsumerOffset(param).then(resp => {
        if (resp.success) {
          // const data = resp.rows[0]
          this.$message.success('reset success')
        }
      })
    },
    async remoteMethod(query) {
      if (!this.record.clusterName || this.record.clusterName === '') {
        this.$message.warn('请先选择集群...')
        return
      }
      if (query !== '') {
        this.loading = true
        getTopics(this.record.clusterName, query).then(response => {
          this.loading = false
          if (response.success) {
            this.options.topics = response.rows.map(item => {
              return { value: item, label: item }
            })
          }
        })
      } else {
        this.options.topics = []
      }
    },
    filterData(item) {
      if (this.checkList.length === 0) return false
      if (!isEmpty(this.table.main.params.topicName) && item.topicName.indexOf(this.table.main.params.topicName) < 0) return false
      if (this.checkList.includes('重试') && item.topicName.startsWith('%R')) { return true }
      if (this.checkList.includes('死信') && item.topicName.startsWith('%D')) { return true }
      return this.checkList.includes('普通') && item.topicName.startsWith('%') === false
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

// 页面标题
.page-header {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;

  i {
    margin-right: 12px;
    color: #409EFF;
    font-size: 28px;
  }
}

.header-description {
  color: #606266;
  font-size: 14px;
}

// 筛选卡片
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.filter-title {
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

.filter-form {
  padding: 0;
}

.filter-item-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.filter-label {
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

.filter-select,
.filter-input {
  width: 100%;
}

.filter-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-buttons {
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

.topic-table {
  border-radius: 6px;
  overflow: hidden;
}

.topic-name {
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    color: #409EFF;
  }
}

.action-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .el-link {
    margin-right: 0;
    font-size: 13px;

    &:hover {
      text-decoration: none;
    }
  }
}

// 弹窗样式
.topic-dialog,
.status-dialog,
.route-dialog,
.offset-dialog,
.send-dialog,
.consumer-dialog {
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

// 路由信息样式
.route-card,
.queue-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.route-header,
.queue-header {
  display: flex;
  align-items: center;
}

.route-title,
.queue-title {
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

.broker-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.broker-row {
  margin-bottom: 10px;
  align-items: center;
}

.broker-addr-row {
  margin-bottom: 15px;
}

.addr-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;

  .addr-value {
    font-family: 'Courier New', monospace;
    color: #606266;
  }
}

// Consumer管理样式
.empty-consumer {
  text-align: center;
  padding: 40px;
  color: #909399;

  i {
    font-size: 48px;
    margin-bottom: 10px;
    display: block;
  }
}

.consumer-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.consumer-header {
  display: flex;
  align-items: center;
}

.consumer-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.consumer-group,
.consumer-delay,
.consumer-time {
  display: flex;
  align-items: center;
  gap: 5px;

  i {
    color: #409EFF;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .page-header {
    padding: 16px;
  }

  .header-title {
    font-size: 20px;

    i {
      font-size: 24px;
    }
  }

  .filter-item-wrapper {
    margin-bottom: 10px;
  }

  .action-links {
    flex-direction: column;
    gap: 5px;
  }

  .consumer-info {
    flex-direction: column;
    gap: 10px;
  }
}

// 卡片悬停效果
.filter-card:hover,
.table-card:hover,
.route-card:hover,
.queue-card:hover,
.consumer-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

// 按钮样式优化
.el-button--mini {
  border-radius: 4px;
  font-weight: 500;
}

// 标签样式优化
.el-tag {
  border-radius: 4px;
}

// 表格悬停效果
.topic-table .el-table__row:hover {
  background-color: #f0f9ff !important;
}
</style>
