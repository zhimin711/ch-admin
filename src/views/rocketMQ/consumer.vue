<template>
  <div class="app-container">
    <!-- 顶部筛选区美化 -->
    <div class="filter-container">
      <div class="filter-section">
        <el-select
          v-model="table.main.params.clusterName"
          :placeholder="$t('input.tips.select')"
          class="filter-item"
          clearable
        >
          <el-option
            v-for="item in options.clusters"
            :key="item.clusterName"
            :label="item.clusterName"
            :value="item.clusterName"
          />
        </el-select>
        <el-input
          v-model="table.main.params.topicName"
          placeholder="主题名称"
          class="filter-item"
          clearable
        />
        <el-input
          v-model="table.main.params.groupName"
          placeholder="消费组名称"
          class="filter-item"
          clearable
        />
      </div>
      <div class="action-section">
        <el-button
          v-permission="'ROCKETMQ_CONSUMER_GROUPS'"
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="getList"
        >
          {{ $t('btn.search') }}
        </el-button>
        <el-button
          class="filter-item"
          type="default"
          icon="el-icon-refresh"
          @click="handleReset"
        >
          {{ $t('btn.reset') }}
        </el-button>
        <el-button
          v-permission="'ROCKET_MQ_CONSUMER_ADD'"
          class="filter-item"
          type="success"
          icon="el-icon-plus"
          @click="handleAdd"
        >
          添加订阅
        </el-button>
      </div>
    </div>

    <!-- 表格美化 -->
    <div class="table-container">
      <el-table
        v-loading="table.main.loading"
        :data="table.main.data"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="消费组名称" prop="group" min-width="180">
          <template slot-scope="scope">
            <el-link
              type="primary"
              class="group-name-link"
              @click="handleRoute(scope.row, scope.$index)"
            >
              {{ scope.row.group }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="count" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.count !== null && scope.row.count !== undefined && scope.row.count !== ''" size="small" type="info">{{ scope.row.count }}</el-tag>
            <span v-else>{{ scope.row.count || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" prop="version" width="120" align="center" />
        <el-table-column label="类型" prop="consumeType" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.consumeType"
              size="small"
              :type="scope.row.consumeType === 'CONSUME_ACTIVELY' ? 'success' : 'warning'"
            >
              {{ scope.row.consumeType }}
            </el-tag>
            <span v-else>{{ scope.row.consumeType || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模式" prop="messageModel" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.messageModel"
              size="small"
              :type="scope.row.messageModel === 'CLUSTERING' ? 'primary' : 'info'"
            >
              {{ scope.row.messageModel }}
            </el-tag>
            <span v-else>{{ scope.row.messageModel || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="TPS" prop="consumeTps" width="100" align="center">
          <template slot-scope="scope">
            <span class="tps-value">{{ scope.row.consumeTps || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="延迟" prop="diffTotal" width="100" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.diffTotal !== null && scope.row.diffTotal !== undefined && scope.row.diffTotal !== ''"
              size="small"
              :type="getDelayTagType(scope.row.diffTotal)"
            >
              {{ scope.row.diffTotal }}
            </el-tag>
            <span v-else>{{ scope.row.diffTotal || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('label.actions')" width="280" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-permission="'ROCKET_MQ_CONSUMER_STATUS'"
              size="mini"
              type="warning"
              icon="el-icon-view"
              @click="handleStatus(scope.row, scope.$index)"
            >
              {{ $t('label.status') }}
            </el-button>
            <el-button
              v-permission="'ROCKET_MQ_CONSUMER_DETAIL'"
              size="mini"
              type="primary"
              icon="el-icon-share"
              @click="handleRoute(scope.row, scope.$index)"
            >
              {{ $t('label.detail') }}
            </el-button>
            <el-button
              v-permission="'ROCKET_MQ_CONSUMER_CONFIG'"
              size="mini"
              type="info"
              icon="el-icon-set-up"
              @click="handleEdit(scope.row, scope.$index)"
            >
              配置
            </el-button>
            <el-button
              v-permission="'ROCKET_MQ_CONSUMER_DELETE'"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="handleDel(scope.row)"
            >
              {{ $t('btn.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      v-show="table.main.total>0"
      :total="table.main.total"
      :page.sync="table.main.page"
      :limit.sync="table.main.limit"
      @pagination="handlePageChange"
    />

    <!-- 新增/编辑订阅弹窗美化 -->
    <el-dialog
      :visible.sync="dialog.visible.addOrEdit"
      :title="dialog.type==='edit'?'修改订阅':'新增订阅'"
      width="75%"
      :close-on-click-modal="false"
      class="consumer-dialog"
    >
      <el-tabs v-model="dialog.activeName" type="card" class="config-tabs">
        <el-tab-pane
          v-for="(record2, index) in dialog.data"
          :key="'addOrEdit'+index"
          :label="`基本配置[${index+1}]`"
          :name="'name'+index"
        >
          <el-form :model="record2" label-width="200px" label-position="right" class="config-form">
            <el-form-item v-if="dataForm.visible.clusterName" label="集群名称" required>
              <el-select
                v-model="record2.clusterNameList"
                multiple
                :placeholder="$t('input.tips.select')"
                class="form-select"
                filterable
              >
                <el-option
                  v-for="item in options.clusters"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="brokerName" required>
              <el-select
                v-model="record2.brokerNameList"
                multiple
                :placeholder="$t('input.tips.select')"
                class="form-select"
                :disabled="dataForm.disable.brokerName"
                filterable
              >
                <el-option
                  v-for="item in options.brokers"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="groupName" required>
              <el-input
                v-model="record2.subscriptionGroupConfig.groupName"
                placeholder="group名称"
                :disabled="dataForm.disable.groupName"
                class="form-input"
              />
            </el-form-item>
            <el-form-item label="consumeEnable">
              <el-switch
                v-model="record2.subscriptionGroupConfig.consumeEnable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
            <el-form-item label="consumeFromMinEnable">
              <el-switch
                v-model="record2.subscriptionGroupConfig.consumeFromMinEnable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
            <el-form-item label="consumeBroadcastEnable">
              <el-switch
                v-model="record2.subscriptionGroupConfig.consumeBroadcastEnable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
            <el-form-item label="retryQueueNums">
              <el-input-number
                v-model="record2.subscriptionGroupConfig.retryQueueNums"
                :min="1"
                :max="1024"
                class="form-number"
              />
            </el-form-item>
            <el-form-item label="retryMaxTimes">
              <el-input-number
                v-model="record2.subscriptionGroupConfig.retryMaxTimes"
                :min="16"
                :max="1024"
                class="form-number"
              />
            </el-form-item>
            <el-form-item label="brokerId">
              <el-input-number
                v-model="record2.subscriptionGroupConfig.brokerId"
                :min="0"
                :max="1024"
                class="form-number"
              />
            </el-form-item>
            <el-form-item label="whichBrokerWhenConsumeSlowly">
              <el-input-number
                v-model="record2.subscriptionGroupConfig.whichBrokerWhenConsumeSlowly"
                :min="1"
                :max="100"
                class="form-number"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button v-loading="dialog.loading" type="primary" @click="handleSubmit(dialog.data[0])">
          {{ $t('btn.save') }}
        </el-button>
        <el-button @click="dialog.visible.addOrEdit=false">
          {{ $t('btn.cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 状态弹窗美化 -->
    <el-dialog
      :visible.sync="dialog.visible.status"
      :title="dialog.title"
      width="80%"
      class="status-dialog"
    >
      <div class="status-content">
        <el-card class="status-card">
          <div slot="header" class="card-header">
            <span class="header-title">客户端连接信息</span>
          </div>
          <el-table
            :data="table.stats.data"
            max-height="400"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column label="ClientId" prop="clientId" min-width="200" />
            <el-table-column label="ClientAddr" prop="clientAddr" min-width="150" />
            <el-table-column label="Language" prop="language" width="100" align="center" />
            <el-table-column label="Version" prop="versionDesc" width="120" align="center" />
          </el-table>
        </el-card>

        <el-card class="status-card" style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span class="header-title">订阅信息</span>
          </div>
          <el-table
            :data="list.subscription"
            max-height="300"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column label="Topic" prop="topic" min-width="200" />
            <el-table-column label="SubExpression" prop="subString" min-width="200" />
          </el-table>
        </el-card>

        <div class="status-info">
          <div class="info-item">
            <span class="info-label">ConsumeType:</span>
            <el-tag v-if="record.consumeType" type="primary">{{ record.consumeType }}</el-tag>
            <span v-else>{{ record.consumeType || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">MessageModel:</span>
            <el-tag v-if="record.messageModel" type="success">{{ record.messageModel }}</el-tag>
            <span v-else>{{ record.messageModel || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ConsumeFromWhere:</span>
            <el-tag v-if="record.consumeFromWhere" type="warning">{{ record.consumeFromWhere }}</el-tag>
            <span v-else>{{ record.consumeFromWhere || '-' }}</span>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.status=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <!-- 路由详情弹窗美化 -->
    <el-dialog
      :visible.sync="dialog.visible.route"
      :title="dialog.title"
      width="90%"
      class="route-dialog"
    >
      <div class="route-content">
        <el-card
          v-for="item in list.consumerDetail"
          :key="item.topic"
          class="route-card"
        >
          <div slot="header" class="route-header">
            <div class="route-info">
              <span class="topic-label">主题:</span>
              <el-tag v-if="item.topic" size="medium" type="primary">{{ item.topic }}</el-tag>
              <span v-else>{{ item.topic || '-' }}</span>
              <span class="delay-label">延迟:</span>
              <el-tag v-if="item.diffTotal !== null && item.diffTotal !== undefined && item.diffTotal !== ''" size="medium" type="warning">{{ item.diffTotal }}</el-tag>
              <span v-else>{{ item.diffTotal || '-' }}</span>
              <span class="time-label">最后消费时间:</span>
              <el-tag v-if="item.lastTimestamp" size="medium" type="success">{{ item.lastTimestamp | parseTime }}</el-tag>
              <span v-else>{{ item.lastTimestamp || '-' }}</span>
            </div>
          </div>
          <el-table
            :data="item.queueStatInfoList"
            max-height="400"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column label="broker" prop="brokerName" min-width="150" />
            <el-table-column label="queue" prop="queueId" width="100" align="center" />
            <el-table-column label="consumerClient" prop="clientInfo" min-width="200">
              <template slot-scope="{row}">
                <el-button
                  v-if="row.clientInfo"
                  type="text"
                  class="client-link"
                  @click="handleDetail2(row)"
                >
                  {{ row.clientInfo }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="brokerOffset" prop="brokerOffset" width="120" align="center" />
            <el-table-column label="consumerOffset" prop="consumerOffset" width="130" align="center" />
            <el-table-column label="diffTotal" prop="diffTotal" width="100" align="center">
              <template slot-scope="{row}">
                <el-tag
                  v-if="row.diffTotal !== null && row.diffTotal !== undefined && row.diffTotal !== ''"
                  size="small"
                  :type="getDelayTagType(row.diffTotal)"
                >
                  {{ row.diffTotal }}
                </el-tag>
                <span v-else>{{ row.diffTotal || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="lastTimestamp" prop="lastTimestamp" width="180" align="center">
              <template slot-scope="{row}">
                {{ row.lastTimestamp | parseTime }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.route=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <!-- 消费者详情弹窗美化 -->
    <el-dialog
      :visible.sync="dialog.visible.consumer"
      :title="dialog.title + '订阅组'"
      width="85%"
      class="consumer-detail-dialog"
    >
      <div class="consumer-detail-content">
        <el-card class="detail-card">
          <div slot="header" class="card-header">
            <span class="header-title">配置属性</span>
          </div>
          <el-form :model="dialog.record2" label-width="250px" label-position="left" class="detail-form">
            <el-form-item v-for="(v,k) in dialog.record2.properties" :key="k" :label="k">
              <span class="property-value">{{ v }}</span>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="detail-card" style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span class="header-title">状态信息</span>
          </div>
          <el-table
            :data="list.a"
            max-height="400"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column label="Topic" prop="topic" min-width="150" />
            <el-table-column label="pullRT" prop="pullRT" width="100" align="center" />
            <el-table-column label="pullTPS" prop="pullTPS" width="100" align="center" />
            <el-table-column label="consumeRT" prop="consumeRT" width="100" align="center" />
            <el-table-column label="consumeOKTPS" prop="consumeOKTPS" width="120" align="center" />
            <el-table-column label="consumeFailedTPS" prop="consumeFailedTPS" width="130" align="center" />
            <el-table-column label="consumeFailedMsgs" prop="consumeFailedMsgs" width="130" align="center" />
          </el-table>
        </el-card>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible.consumer=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认弹窗美化 -->
    <el-dialog
      :visible.sync="dialog.visible.delete"
      :title="dialog.title"
      width="500px"
      class="delete-dialog"
    >
      <div class="delete-content">
        <el-alert
          title="确认删除"
          description="删除操作不可恢复，请谨慎操作！"
          type="warning"
          :closable="false"
          show-icon
        />
        <el-form label-width="120px" style="margin-top: 20px;">
          <el-form-item label="broker">
            <el-select
              v-model="dialog.record.brokerNameList"
              multiple
              :placeholder="$t('input.tips.select')"
              style="width: 100%"
              :disabled="dataForm.disable.brokerName"
            >
              <el-option
                v-for="item in options.brokers"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="submitDel">{{ $t('btn.confirm') }}</el-button>
        <el-button @click="dialog.visible.delete=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { isEmpty } from '@/utils/validate'
import { listRocketMQ } from '@/api/rocketmq/cluster'
import {
  listRocketMQConsumerGroups,
  getRocketMQConsumerStatus,
  getRocketMQConsumerDetail,
  getRocketMQConsumerClient,
  getRocketMQConsumerConfig,
  fetchRocketMQConsumerBrokerNameList,
  addRocketMQConsumer,
  editRocketMQConsumer,
  deleteRocketMQConsumer
} from '@/api/rocketmq/consumer'

const defaultRecord = {
  brokerNameList: [],
  subscriptionGroupConfig: {
    groupName: '',
    consumeEnable: true,
    consumeFromMinEnable: true,
    consumeBroadcastEnable: true,
    retryQueueNums: 1,
    retryMaxTimes: 16,
    brokerId: 0,
    whichBrokerWhenConsumeSlowly: 1
  }
}
export default {
  name: 'RocketMQConsumer',
  components: { Pagination },
  data() {
    return {
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
      record: Object.assign({}, defaultRecord),
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
          delete: false
        },
        record: {},
        record2: {},
        data: [],
        type: '',
        activeName: 'first'
      },
      dataForm: {
        disable: {
          clusterName: false,
          brokerName: false,
          groupName: false
        },
        visible: {
          clusterName: true
        }
      },
      list: {
        loading: false,
        consumeGroup: [],
        subscription: [],
        consumerDetail: [],
        a: [],
        b: []
      },
      options: {
        clusters: [],
        brokers: [],
        topics: []
      },
      loading: false
    }
  },
  created() {
    this.getList()
    // this.getClusters()
  },
  methods: {
    // 获取延迟标签类型
    getDelayTagType(delay) {
      if (!delay || delay === 0) return 'success'
      if (delay < 100) return 'warning'
      return 'danger'
    },
    // 表格行样式
    tableRowClassName({ row, rowIndex }) {
      if (row.diffTotal > 100) {
        return 'warning-row'
      }
      return ''
    },
    // 重置筛选条件
    handleReset() {
      this.table.main.params = {}
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
      this.table.main.page = val.page
      this.table.main.limit = val.limit
      this.getList()
    },
    getList() {
      this.table.main.loading = true
      console.log(this.table.main.page, this.table.main.limit, this.table.main.params)
      listRocketMQConsumerGroups(this.table.main.page, this.table.main.limit, this.table.main.params).then(resp => {
        if (resp.success) {
          this.table.main.data = resp.data.rows
          this.table.main.total = resp.data.total
        }
      }).finally(() => { this.table.main.loading = false })
    },
    handleStatus(row) {
      getRocketMQConsumerStatus({ consumerGroup: row.group }).then(resp => {
        if (resp.success) {
          this.record = resp.rows[0]
          this.table.stats.data = this.record.connectionSet
          if (this.record.subscriptionTable) {
            this.list.subscription = []
            for (const k in this.record.subscriptionTable) {
              this.list.subscription.push({ topic: this.record.subscriptionTable[k].topic, subString: this.record.subscriptionTable[k].subString })
            }
          }

          this.dialog.title = `[${row.group}] ${this.$t('label.status')}`
          this.dialog.visible.status = true
        }
      })
    },
    handleRoute(row) {
      getRocketMQConsumerDetail({ consumerGroup: row.group }).then(resp => {
        if (resp.success) {
          this.dialog.record = row
          this.list.consumerDetail = resp.rows
          this.dialog.title = `[${row.group}] ${this.$t('label.status')}`
          this.dialog.visible.route = true
        }
      })
    },
    handleDetail2(row) {
      getRocketMQConsumerClient({ clientId: row.clientInfo, consumerGroup: this.dialog.record.group, jstack: false }).then(resp => {
        if (resp.success) {
          this.dialog.record2 = resp.rows[0]
          this.list.a = []
          for (const k in this.dialog.record2.statusTable) {
            const v = Object.assign({}, this.dialog.record2.statusTable[k])
            v.topic = k
            this.list.a.push(v)
          }
          this.dialog.visible.consumer = true
        }
      }).finally(() => {
      })
    },
    async handleAdd() {
      await this.getClusters()
      this.dialog.data = [deepClone(defaultRecord)]
      this.dialog.visible.addOrEdit = true
      this.dialog.type = 'new'
      this.dialog.activeName = 'name0'
      this.dataForm.visible.clusterName = true
      this.dataForm.disable.brokerName = false
      this.dataForm.disable.groupName = false
    },
    async handleEdit(row) {
      await this.getClusters()
      getRocketMQConsumerConfig({ consumerGroup: row.group }).then(resp => {
        if (resp.success) {
          this.dialog.data = resp.rows
          this.dialog.activeName = 'name0'
          this.dialog.visible.addOrEdit = true
          this.dialog.type = 'edit'
          this.dataForm.visible.clusterName = false
          this.dataForm.disable.brokerName = true
          this.dataForm.disable.groupName = true
        }
      })
    },
    submitDel() {
      const _this = this
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      }).then(() => {
        deleteRocketMQConsumer(this.dialog.record).then(resp => {
          if (resp.success) {
            this.dialog.visible.delete = false
            _this.$message.success(this.$t('message.deleteSuccess'))
            _this.getList()
          }
        })
      }).catch(err => { console.error(err) })
    },
    handleDel(row) {
      fetchRocketMQConsumerBrokerNameList({ consumerGroup: row.group }).then(resp => {
        this.options.brokers = []
        this.dialog.record = {}
        if (resp.success) {
          this.dialog.record.groupName = row.group
          this.options.brokers = resp.rows.map(item => {
            return { value: item, label: item }
          })
          this.dialog.title = `[${row.group}] Delete!`
          this.dialog.visible.delete = true
        }
      })
    },
    async handleSubmit(record) {
      const _this = this
      let resp = null
      let opName = '添加'

      if (this.dialog.type === 'new') {
        if (isEmpty(record.clusterNameList)) {
          this.$message.warning('please select clusterName!')
          return
        }
        if (isEmpty(record.brokerNameList)) {
          this.$message.warning('please select brokerName!')
          return
        }
        this.dialog.loading = true
        resp = await addRocketMQConsumer(record).finally(() => { this.dialog.loading = false })
      } else if (this.dialog.type === 'edit') {
        opName = '修改'
        this.dialog.loading = true
        resp = await editRocketMQConsumer(record).finally(() => { this.dialog.loading = false })
      } else {
        this.$message.error('unknown operate!')
        return
      }
      if (resp.success) {
        this.dialog.visible.addOrEdit = false
        this.$notify({
          title: `${opName}订阅成功!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>名称: ${record.subscriptionGroupConfig.groupName}</div>
          `,
          type: 'success'
        })
        _this.getList()
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

// 筛选区样式
.filter-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;

  .filter-section {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    flex: 1;
  }

  .action-section {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-item {
    min-width: 180px;
  }
}

// 表格容器
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

// 表格样式
:deep(.el-table) {
  .el-table__header-wrapper {
    .el-table__header {
      th {
        background: #f5f7fa !important;
        color: #606266;
        font-weight: bold;
        border-bottom: 2px solid #ebeef5;
      }
    }
  }

  .el-table__body-wrapper {
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .warning-row {
    background-color: #fdf6ec;
  }
}

// 消费组名称链接
.group-name-link {
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

// TPS数值样式
.tps-value {
  font-weight: 500;
  color: #409eff;
}

// 弹窗样式
.consumer-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.config-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 20px;
  }
}

.config-form {
  .form-select,
  .form-input {
    width: 100%;
    max-width: 400px;
  }

  .form-number {
    width: 200px;
  }
}

// 状态弹窗
.status-dialog {
  .status-content {
    .status-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    }

    .card-header {
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .status-info {
      margin-top: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-weight: 500;
          color: #606266;
          margin-right: 10px;
          min-width: 150px;
        }
      }
    }
  }
}

// 路由弹窗
.route-dialog {
  .route-content {
    .route-card {
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);

      &:last-child {
        margin-bottom: 0;
      }

      .route-header {
        .route-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;

          .topic-label,
          .delay-label,
          .time-label {
            font-weight: 500;
            color: #606266;
          }
        }
      }
    }
  }
}

// 消费者详情弹窗
.consumer-detail-dialog {
  .consumer-detail-content {
    .detail-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);

      .card-header {
        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .detail-form {
        .property-value {
          color: #606266;
          font-weight: 500;
        }
      }
    }
  }
}

// 删除弹窗
.delete-dialog {
  .delete-content {
    padding: 10px 0;
  }
}

// 客户端链接
.client-link {
  color: #409eff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

// 弹窗底部按钮
.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

// 响应式适配
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;

    .filter-section,
    .action-section {
      justify-content: center;
    }
  }

  .route-header .route-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
