<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="table.main.params.clusterName" :placeholder="$t('input.tips.select')" class="filter-item">
        <el-option
          v-for="item in options.clusters"
          :key="item.clusterName"
          :label="item.clusterName"
          :value="item.clusterName"
        />
      </el-select>
      <el-input v-model="table.main.params.topicName" placeholder="主题名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="'ROCKET_MQ_CONSUMER_SEARCH'" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        {{ $t('btn.search') }}
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="table.main.params = {}">
        {{ $t('btn.reset') }}
      </el-button>
      <el-button v-permission="'ROCKET_MQ_CONSUMER_ADD'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        创建主题
      </el-button>
    </div>
    <el-table v-loading="table.main.loading" :data="table.main.data.slice((table.main.page - 1) * table.main.limit, (table.main.page - 1) * table.main.limit + table.main.limit)" border fit highlight-current-row style="width: 100%">
      <el-table-column label="集群名称" prop="group" />
      <el-table-column label="数量" prop="count" width="50" align="center" />
      <el-table-column label="版本" prop="version" />
      <el-table-column label="类型" prop="consumeType" />
      <el-table-column label="模式" prop="messageModel" />
      <el-table-column label="TPS" prop="consumeTps" width="50" align="center" />
      <el-table-column label="延迟" prop="diffTotal" width="50" align="center" />
      <el-table-column align="center" :label="$t('label.actions')">
        <template slot-scope="scope">
          <el-link v-permission="'ROCKET_MQ_CONSUMER_STATUS'" type="warning" icon="el-icon-view" @click="handleStatus(scope.row, scope.$index)">{{ $t('label.status') }}</el-link>
          <el-link v-permission="'ROCKET_MQ_CONSUMER_DETAIL'" type="primary" icon="el-icon-share" @click="handleRoute(scope.row, scope.$index)">{{ $t('label.detail') }}</el-link>
          <el-link v-permission="'ROCKET_MQ_CONSUMER_CONFIG'" type="primary" icon="el-icon-set-up" @click="handleEdit(scope.row, scope.$index)">配置</el-link>
          <el-link v-permission="'ROCKET_MQ_CONSUMER_DELETE'" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">{{ $t('btn.delete') }}</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="table.main.total>0" :total="table.main.total" :page.sync="table.main.page" :limit.sync="table.main.limit" @pagination="handlePageChange" />

    <el-dialog :visible.sync="dialog.visible.addOrEdit" :title="dialog.type==='edit'?'修改订阅':'新增订阅'" width="70%">
      <el-form :model="record" label-width="200px" label-position="left">
        <el-tabs v-model="dialog.activeName">
          <el-tab-pane label="基本配置" name="first">
            <el-form-item v-if="dataForm.visible.clusterName" label="集群名称">
              <el-select v-model="record.clusterNameList" multiple :placeholder="$t('input.tips.select')" style="min-width: 300px">
                <el-option
                  v-for="item in options.clusters"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="brokerName">
              <el-select v-model="record.brokerNameList" multiple :placeholder="$t('input.tips.select')" style="min-width: 300px" :disabled="dataForm.disable.brokerName">
                <el-option
                  v-for="item in options.brokers"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>

            </el-form-item>
            <el-form-item label="groupName">
              <el-input v-model="record.subscriptionGroupConfig.groupName" placeholder="group名称" :disabled="dataForm.disable.groupName" />
            </el-form-item>
            <el-form-item label="consumeEnable">
              <el-switch
                v-model="record.subscriptionGroupConfig.consumeEnable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
            <el-form-item label="consumeFromMinEnable">
              <el-switch
                v-model="record.subscriptionGroupConfig.consumeFromMinEnable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
            <el-form-item label="consumeBroadcastEnable">
              <el-switch
                v-model="record.subscriptionGroupConfig.consumeBroadcastEnable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
            <el-form-item label="retryQueueNums">
              <el-input-number v-model="record.subscriptionGroupConfig.retryQueueNums" :min="1" :max="1024" />
            </el-form-item>
            <el-form-item label="retryMaxTimes">
              <el-input-number v-model="record.subscriptionGroupConfig.retryMaxTimes" :min="16" :max="1024" />
            </el-form-item>
            <el-form-item label="brokerId">
              <el-input-number v-model="record.subscriptionGroupConfig.brokerId" :min="0" :max="1024" />
            </el-form-item>
            <el-form-item label="whichBrokerWhenConsumeSlowly">
              <el-input-number v-model="record.subscriptionGroupConfig.whichBrokerWhenConsumeSlowly" :min="1" :max="100" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="扩展配置" name="second" />
        </el-tabs>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" v-loading="dialog.loading" @click="handleSubmit()">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" v-loading="dialog.loading" @click="dialog.visible.addOrEdit=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialog.visible.status" :title="dialog.title">
      <el-table :data="table.stats.data" max-height="500">
        <el-table-column label="ClientId" prop="clientId" />
        <el-table-column label="ClientAddr" prop="clientAddr" />
        <el-table-column label="Language" prop="language" />
        <el-table-column label="Version" prop="versionDesc" />
      </el-table>
      <el-card style="margin-top: 30px">
        <div slot="header" class="clearfix">
          <span>Below is subscription:</span>
        </div>
        <el-table :data="list.subscription" max-height="500">
          <el-table-column label="Topic" prop="topic" />
          <el-table-column label="SubExpression" prop="subString" />
        </el-table>
      </el-card>
      <div style="margin-top: 30px">
        <span>ConsumeType: {{ record.consumeType }}</span>
        <el-divider />
        <span>MessageModel: {{ record.messageModel }}</span>
        <el-divider />
        <span>ConsumeFromWhere: {{ record.consumeFromWhere }}</span>
      </div>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialog.visible.status=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialog.visible.route" :title="dialog.title" width="80%">
      <el-card v-for="item in list.consumerDetail" class="box-card route-broker">
        <div slot="header" class="clearfix">
          <span>主题	:	<el-tag>{{ item.topic }}</el-tag></span>
          <span>延迟	:	<el-tag type="warning">{{ item.diffTotal }}</el-tag></span>
          <span>最后消费时间	:	<el-tag type="success">{{ item.lastTimestamp | parseTime }}</el-tag></span>
        </div>
        <el-table :data="item.queueStatInfoList" max-height="500">
          <el-table-column label="broker" prop="brokerName" />
          <el-table-column label="queue" prop="queueId" width="100" align="center" />
          <el-table-column label="consumerClient" prop="clientInfo">
            <template slot-scope="{row}">
              <el-button v-if="row.clientInfo" type="text" @click="handleDetail2(row)">
                {{ row.clientInfo }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="brokerOffset" prop="brokerOffset" width="120" align="center" />
          <el-table-column label="consumerOffset" prop="consumerOffset" width="130" align="center" />
          <el-table-column label="diffTotal" prop="diffTotal" width="100" align="center" />
          <el-table-column label="lastTimestamp" prop="lastTimestamp" width="180" align="center">
            <template slot-scope="{row}">
              {{ row.lastTimestamp | parseTime }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialog.visible.route=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialog.visible.consumer" :title="dialog.title + '订阅组'" width="80%">
      <el-form :model="dialog.record2" label-width="250px" label-position="left">
        <el-form-item v-for="(v,k,i) in dialog.record2.properties" :label="k">
          {{ v }}
        </el-form-item>
      </el-form>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>状态</span>
        </div>
        <el-table :data="list.a" max-height="500">
          <el-table-column label="Topic" prop="topic" />
          <el-table-column label="pullRT" prop="pullRT" />
          <el-table-column label="pullTPS" prop="pullTPS" />
          <el-table-column label="consumeRT" prop="consumeRT" />
          <el-table-column label="consumeOKTPS" prop="consumeOKTPS" />
          <el-table-column label="consumeFailedTPS" prop="consumeFailedTPS" />
          <el-table-column label="consumeFailedMsgs" prop="consumeFailedMsgs" />
        </el-table>
      </el-card>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialog.visible.consumer=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialog.visible.delete" :title="dialog.title">
      <el-form label-width="180">
        <el-form-item label="broker">
          <el-select v-model="dialog.record.brokerNameList" multiple :placeholder="$t('input.tips.select')" style="min-width: 300px" :disabled="dataForm.disable.brokerName">
            <el-option
              v-for="item in options.brokers"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" style="text-align:right;">
        <el-button type="primary" @click="submitDel">{{ $t('btn.confirm') }}</el-button>
        <el-button @click="dialog.visible.delete=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { parseTime } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { listRocketMQ } from '@/api/rocketmq/cluster'
import {
  listRocketMQConsumerGroups,
  getRocketMQConsumerStatus,
  getRocketMQConsumerDetail,
  getRocketMQConsumerClient,
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
  name: 'RocketMQConsumer1',
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
      listRocketMQConsumerGroups().then(resp => {
        if (resp.success) {
          this.table.main.data = resp.rows
          this.table.main.total = resp.rows.length
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
      this.record = deepClone(defaultRecord)
      this.dialog.visible.addOrEdit = true
      this.dialog.type = 'new'
      this.dataForm.visible.clusterName = true
      this.dataForm.disable.brokerName = false
      this.dataForm.disable.topicName = false
    },
    async handleEdit(row) {
      await this.getClusters()
      getRocketMQConsumerDetail({ topic: row.topicName }).then(resp => {
        if (resp.success) {
          this.record = resp.rows[0]
          this.dialog.visible.addOrEdit = true
          this.dialog.type = 'edit'
          this.dataForm.visible.clusterName = false
          this.dataForm.disable.brokerName = true
          this.dataForm.disable.topicName = true
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
        if (resp.success) {
          this.dialog.record.groupName = row.group
          this.dialog.record.brokerNameList = []
          this.options.brokers = resp.rows.map(item => {
            return { value: item, label: item }
          })
          this.dialog.title = `[${row.group}] Delete!`
          this.dialog.visible.delete = true
        }
      })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'

      if (this.dialog.type === 'new') {
        if(isEmpty(this.record.clusterNameList)) {
          this.$message.warning('please select clusterName!')
          return
        }
        if (isEmpty(this.record.brokerNameList)) {
          this.$message.warning('please select brokerName!')
          return
        }
        this.dialog.loading = true
        resp = await addRocketMQConsumer(this.record)
      } else if (this.dialog.type === 'edit') {
        opName = '修改'
        this.dialog.loading = true
        resp = await editRocketMQConsumer(this.record)
      }else{
        this.$message.error('unknown operate!')
        return
      }
      this.dialog.loading = false
      if (resp.success) {
        this.dialog.visible.addOrEdit = false
        this.$notify({
          title: `${opName}集群名称 Success!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>名称: ${this.record.subscriptionGroupConfig.groupName}</div>
          `,
          type: 'success'
        })
        _this.getList()
      }
    }
  }
}
</script>

<style scoped>
  .el-table .el-link {
    margin-right: 5px;
  }

  .el-select .el-input__inner {
    width: 360px;
  }
  .item {
    margin-bottom: 10px;
  }

  .route-broker{
    margin-bottom: 15px;
  }
  .route-broker .broker-row {
    /*border-bottom: 1px solid #0a76a4;*/
    padding-bottom: 15px;
  }
  .route-broker .broker-addr-cell {
    padding: 5px;
    /*border: 1px solid #d9d9d9;*/
  }
  .el-card__header span {
    margin-right: 10px;
  }
</style>
