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
      <el-button v-permission="'ROCKET_MQ_TOPIC_SEARCH'" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        {{ $t('btn.search') }}
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="table.main.params = {}">
        {{ $t('btn.reset') }}
      </el-button>
      <!--<el-button v-permission="'ROCKET_MQ_TOPIC_SYNC'" class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-refresh" @click="handleSync">
        同步集群主题
      </el-button>-->
      <el-button v-permission="'ROCKET_MQ_TOPIC_ADD'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        创建主题
      </el-button>
    </div>
    <el-table v-loading="table.main.loading" :data="table.main.data.slice((table.main.page - 1) * table.main.limit, (table.main.page - 1) * table.main.limit + table.main.limit)" border fit highlight-current-row style="width: 100%">
      <el-table-column width="133px" label="集群名称">
        <template slot-scope="scope">
          <span>{{ scope.row.clusterName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主题名称" prop="topicName" />
      <!--<el-table-column label="存储类型" width="127">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分区数" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.partitionSize }}</span>
        </template>
      </el-table-column>
      <el-table-column label="复制数" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.replicaSize }}</span>
        </template>
      </el-table-column>-->
      <el-table-column align="center" :label="$t('label.actions')">
        <template slot-scope="scope">
          <el-link v-permission="'ROCKET_MQ_TOPIC_STATUS'" type="warning" icon="el-icon-view" @click="handleStatus(scope.row, scope.$index)">状态</el-link>
          <el-link v-permission="'ROCKET_MQ_TOPIC_ROUTE'" type="primary" icon="el-icon-share" @click="handleRoute(scope.row, scope.$index)">路由</el-link>
          <el-link v-permission="'ROCKET_MQ_TOPIC_CONSUMER'" type="" icon="el-icon-connection" @click="handleConsume(scope.row, scope.$index)">Consumer管理</el-link>
          <el-link v-permission="'ROCKET_MQ_TOPIC_CONFIG'" type="primary" icon="el-icon-set-up" @click="handleEdit(scope.row, scope.$index)">配置</el-link>
          <el-link v-permission="'ROCKET_MQ_TOPIC_SEND'" type="success" icon="el-icon-s-promotion" @click="handleSend(scope.row)">发消息</el-link>
          <el-link v-permission="'ROCKET_MQ_TOPIC_RESET'" type="warning" icon="el-icon-refresh" @click="handleOffset(scope.row)">重置消费起点</el-link>
          <el-link v-permission="'ROCKET_MQ_TOPIC_DELETE'" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="table.main.total>0" :total="table.main.total" :page.sync="table.main.page" :limit.sync="table.main.limit" @pagination="handlePageChange" />

    <el-dialog :visible.sync="dialog.visible.addOrEdit" :title="dialog.type==='edit'?'修改主题信息':'创建主题'">
      <el-form :model="record" label-width="100px" label-position="left">
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
            <el-form-item label="代理名">
              <el-select v-model="record.brokerNameList" multiple :placeholder="$t('input.tips.select')" style="min-width: 300px" :disabled="dataForm.disable.brokerName">
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
            <el-form-item label="写队列数量:">
              <el-input-number v-model="record.writeQueueNums" :min="1" :max="1024" />
            </el-form-item>
            <el-form-item label="读队列数量:">
              <el-input-number v-model="record.readQueueNums" :min="1" :max="1024" />
            </el-form-item>
            <el-form-item label="perm:">
              <el-input-number v-model="record.perm" :min="0" :max="10" />
            </el-form-item>
            <el-form-item label="顺序:">
              <el-switch
                v-model="record.order"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-text="$t('label.enable')"
                :inactive-text="$t('label.disable')"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="扩展配置" name="second">
            <el-form-item label="存储类型">
              <el-select v-model="record.type" placeholder="请选择">
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
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialog.visible.addOrEdit=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialog.visible.sync" :title="'同步Kafka集群主题'" width="400px">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="集群名称">
          <el-select v-model="record.clusterName" placeholder="请选择">
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSyncSubmit">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialog.visible.sync=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialog.visible.status" :title="dialog.title">
      <el-table :data="table.stats.data" max-height="500">
        <el-table-column label="队列" prop="queue" />
        <el-table-column label="最小位点" prop="minOffset" width="80" align="center" />
        <el-table-column label="最大位点" prop="maxOffset" width="80" align="center" />
        <el-table-column label="上次更新时间" prop="lastUpdate" width="180" />
      </el-table>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialog.visible.status=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialog.visible.route" :title="dialog.title">
      <el-card class="box-card route-broker">
        <div slot="header" class="clearfix">
          <span>代理信息:	</span>
        </div>
        <div v-for="o in list.a" :key="o.brokerName" class="text item">
          <el-row class="broker-row">
            <el-col :span="4">代理名:</el-col>
            <el-col :span="20">{{ o.brokerName }}</el-col>
          </el-row>
          <el-row>
            <el-col :span="4">代理地址:</el-col>
            <el-col :span="20">
              <div v-for="(p,k) in o.brokerAddrs" :key="p">
                <el-col class="broker-addr-cell" :span="2">{{ k }}</el-col>
                <el-col class="broker-addr-cell" :span="20">{{ p }}</el-col>
              </div>
            </el-col>
          </el-row>
          <el-divider content-position="right">[{{ o.brokerName }}] End</el-divider>
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>队列信息	</span>
        </div>
        <el-table :data="list.b" max-height="500">
          <el-table-column label="代理名" prop="brokerName" />
          <el-table-column label="读队列数量" prop="readQueueNums" width="100" align="center" />
          <el-table-column label="写队列数量" prop="writeQueueNums" width="100" align="center" />
          <el-table-column label="perm" prop="perm" width="100" />
        </el-table>
      </el-card>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialog.visible.route=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialog.visible.offset" :title="'重置位点'">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="订阅组">
          <el-select v-model="record.consumerGroup" placeholder="请选择">
            <el-option
              v-for="item in options.consumerGroupList"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间点">
          <el-date-picker v-model="record.currMarkAt" type="datetime" placeholder="选择时间" value-format="timestamp" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSyncSubmit">{{ $t('btn.reset') }}</el-button>
        <el-button type="danger" @click="dialog.visible.offset=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialog.visible.send" :title="'推送主题消息'">
      <el-form :model="record" label-width="100px" label-position="left">
        <!--<el-form-item label="集群名称">
          <el-select v-model="record.cluster" placeholder="请选择">
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>-->
        <el-form-item label="主题名称">
          <!--<el-select
            v-model="record.topicName"
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
          </el-select>-->
          <el-input v-model="record.topic" placeholder="主题名称" :disabled="dataForm.disable.topicName" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="record.key" placeholder="标签" />
        </el-form-item>
        <el-form-item label="值">
          <el-input v-model="record.tag" placeholder="值" />
        </el-form-item>
        <el-form-item label="发送消息">
          <el-input
            v-model="record.messageBody"
            :autosize="{ minRows: 5, maxRows: 15}"
            type="textarea"
            placeholder="发送消息"
          />
        </el-form-item>
        <div style="text-align:right;">
          <el-button type="primary" :loading="dialog.loading" @click="submitSend">发送</el-button>
          <el-button type="danger" :loading="dialog.loading" @click="dialog.visible.send=false">{{ $t('btn.cancel') }}</el-button>
        </div>
      </el-form>
    </el-dialog>
    <el-dialog :visible.sync="dialog.visible.consumer" :title="dialog.title + '订阅组'">

      <div slot="footer" style="text-align:right;">
        <el-button @click="dialog.visible.consumer=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { parseTime } from '@/utils'
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
import { getTopics, syncAll, refresh2 } from '@/api/kafka/topic'

const defaultRecord = {
  'writeQueueNums': 16,
  'readQueueNums': 16,
  'perm': 6,
  'order': false,
  'type': 'JSON'
}
export default {
  name: 'RocketMQTopic1',
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
      this.listLoading = true
      listRocketMQTopic().then(resp => {
        this.listLoading = false
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
    handleStatus(row) {
      getRocketMQTopicStatus({ topic: row.topicName }).then(resp => {
        if (resp.success) {
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
        }
      })
    },
    handleRoute(row) {
      getRocketMQTopicRoute({ topic: row.topicName }).then(resp => {
        if (resp.success) {
          const { brokerDatas, queueDatas } = resp.rows[0]
          this.list.a = brokerDatas
          this.list.b = queueDatas
          this.dialog.title = `[${row.topicName}] ${this.$t('label.status')}`
          this.dialog.visible.route = true
        }
      })
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
      await this.getClusters()
      getRocketMQTopic({ topic: row.topicName }).then(resp => {
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
    handleConsume(row) {
      getRocketMQTopicConsumer({ topic: row.topicName }).then(resp => {
        if (resp.success) {
          this.list.consumeGroup = []
          this.dialog.visible.consumer = true
        }
      }).finally(() => {
      })
    },
    handleSend(row) {
      this.record = { topic: row.topicName }
      this.dialog.visible.send = true
      this.dataForm.disable.topicName = true
    },
    submitSend() {
      this.dialog.loading = true
      sendRocketMQTopicMessage(this.record).then(resp => {
        if (resp.success) {
          this.$message.success('send message success!')
          this.dialog.visible.send = false
        }
      }).finally(() => {
        this.dialog.loading = false
      })
    },
    handleOffset(row) {
      getRocketMQTopicConsumerInfo({ topic: row.topicName }).then(resp => {
        if (resp.success) {
          const { groupList } = resp.rows[0]
          this.list.consumeGroup = groupList
          this.dialog.visible.offset = true
        }
      })
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
      })
        .catch(err => { console.error(err) })
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
      const _this = this
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        resp = await addRocketMQTopic(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editRocketMQTopic(this.record.id, this.record)
      }
      if (resp.success) {
        this.dialogVisible = false
        this.$notify({
          title: `${opName}集群名称 Success!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.topicName}</div>
          `,
          type: 'success'
        })
        _this.getList()
      }
    },
    handleSync() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible2 = true
    },
    async handleSyncSubmit() {
      this.dialogVisible2 = false
      const loadingS = Loading.service({ target: document.querySelector('.app-container'), text: `正在同步${this.record.clusterName}主题，请稍后......`, fullscreen: false })
      const _this = this
      const resp = await syncAll(_this.record).catch(() => { loadingS.close() })
      loadingS.close()
      if (resp && resp.success) {
        this.$notify({
          title: `Kafka集群主题同步成功!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.clusterName}</div>
          `,
          type: 'success'
        })
        _this.getList()
      } else {
        // _this.dialogVisible2 = true
        _this.$message.error('同步失败！')
      }
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
</style>
