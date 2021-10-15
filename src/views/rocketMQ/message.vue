<template>
  <div class="app-container">
    <el-tabs v-model="activeName" style="margin-bottom: 15px">
      <el-tab-pane label="Topic" name="name1">
        Only Return 2000 Messages
      </el-tab-pane>
      <el-tab-pane label="Message KEY" name="name2">
        Only Return 64 Messages
      </el-tab-pane>
      <el-tab-pane label="Message ID" name="name3">
        topic can't be empty if you producer client version>=v3.5.8
      </el-tab-pane>
    </el-tabs>
    <div class="filter-container">
      <el-form :model="params" :inline="true" label-width="180px" label-position="left">
        <el-form-item label="主题">
          <el-select v-model="params.topicName" placeholder="请选择" class="filter-item" @change="handleClusterChange">
            <el-option
              v-for="item in options.topics"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="activeName === 'name1'" label="消息时间">
          <el-date-picker
            v-model="dateOptions.s2e"
            :picker-options="dateOptions.pickerOptions"
            type="datetimerange"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item v-if="activeName === 'name2'" label="Key">
          <el-input v-model="params.key" />
        </el-form-item>
        <el-form-item v-if="activeName === 'name3'" label="MessageId">
          <el-input v-model="params.msgId" />
        </el-form-item>
        <el-form-item>
          <el-button v-permission="'ROCKET_MQ_MESSAGE_SEARCH'" class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">
            {{ $t('btn.search') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table v-loading="table.main.loading" :data="table.main.data.slice((table.main.page - 1) * table.main.limit, (table.main.page - 1) * table.main.limit + table.main.limit)">
      <el-table-column label="Message ID" prop="msgId" />
      <el-table-column label="Tag" prop="properties.TAGS" width="180" />
      <el-table-column label="Key" prop="properties.KEYS" width="180" />
      <el-table-column label="StoreTime" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.storeTimestamp | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('label.actions')" width="120">
        <template slot-scope="scope">
          <el-link v-permission="'ROCKETMQ_CLUSTER_DETAIL'" type="primary" icon="el-icon-view" @click="handleDetail(scope.row)">{{ $t('label.detail') }}</el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="table.main.total>0" :total="table.main.total" :page.sync="table.main.page" :limit.sync="table.main.limit" />

    <el-dialog :visible.sync="dialog.visible.detail" :title="dialog.title">
      <el-form :model="dialog.record" label-width="120px" :disabled="true">
        <el-form-item label="Message ID">
          <el-input v-model="dialog.record.msgId" />
        </el-form-item>
        <el-form-item label="Topic">
          <el-input v-model="dialog.record.topic" />
        </el-form-item>
        <el-form-item label="Tag">
          <el-input v-model="dialog.record.properties.TAGS" />
        </el-form-item>
        <el-form-item label="Key">
          <el-input v-model="dialog.record.properties.KEYS" />
        </el-form-item>
        <el-form-item label="StoreTime">
          <el-date-picker
            v-model="dialog.record.storeTimestamp"
            type="datetime"
          />
        </el-form-item>
        <el-form-item label="Message body">
          <el-input v-model="dialog.record.messageBody" type="textarea" />
        </el-form-item>
      </el-form>
      <el-table :data="dialog.data">
        <el-table-column label="consumerGroup" prop="consumerGroup" />
        <el-table-column label="trackType" prop="trackType" />
        <el-table-column align="center" :label="$t('label.actions')" width="120">
          <template slot-scope="scope">
            <el-link v-permission="'ROCKETMQ_MESSAGE_RESEND'" type="success" icon="el-icon-s-promotion" @click="handleSend(scope.row)">
              Resend
            </el-link>
            <el-link type="danger" icon="el-icon-view" @click="handleDetail2(scope.row)">{{ $t('label.detail') }}</el-link>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" style="text-align:right;">
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

export default {
  name: 'RocketMQMessage',
  data() {
    return {
      params: {},
      record: {},
      dateOptions: {
        pickerOptions: {
          shortcuts: [{
            text: '最近一小时',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000)
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
      options: {
        topics: []
      }
    }
  },
  created() {
    this.getTopics()
    this.initParams()
  },
  methods: {
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
      start.setTime(start.getTime() - 3600 * 1000)
      this.dateOptions.s2e = [start.getTime(), end.getTime()]
    },
    handleClusterChange(val) {
    },
    handleDetail(row) {
      // this.dialogTitle = `[${row.brokerName}][${row.index}]`
      this.dialog.record = { properties: {}}
      this.dialog.data = []
      detailRocketMQMessage({ topic: row.topic, msgId: row.msgId }).then(resp => {
        if (resp.success) {
          this.dialog.visible.detail = true
          const { messageTrackList, messageView } = resp.rows[0]
          this.dialog.record = messageView
          this.dialog.data = messageTrackList
        } else {
          // this.$message.warning('not found data!')
        }
      })
    },
    handleSend(row) {
      resendRocketMQMessage({
        consumerGroup: row.consumerGroup,
        msgId: this.dialog.record.msgId,
        topic: this.dialog.record.topic
      }).then(resp => {
        if (resp.success) {
          this.$message.success('resend success!')
        }
      })
    },
    handleDetail2(row) {
      let msg = 'Don\'t have Exception'
      if (row.exceptionDesc) {
        msg = row.exceptionDesc
      }
      this.$alert(msg, 'Result', {
        confirmButtonText: this.$t('btn.confirm'),
        callback: action => {
        }
      })
    },
    async handleSearch() {
      if (isEmpty(this.params.topicName)) {
        this.$message.warning('please select topic!')
        return
      }
      let resp
      if (this.activeName === 'name2') {
        if (isEmpty(this.params.key)) {
          this.$message.warning('please input message key!')
          return
        }
        resp = await listRocketMQMessage2({ topic: this.params.topicName, key: this.params.key })
      } else if (this.activeName === 'name3') {
        if (isEmpty(this.params.msgId)) {
          this.$message.warning('please input message id!')
          return
        }
        this.handleDetail({ topic: this.params.topicName, msgId: this.params.msgId })
        return
      } else {
        if (this.dateOptions.s2e.length < 2) {
          this.$message.warning('please select date range!')
          return
        }
        resp = await listRocketMQMessage({ topic: this.params.topicName, begin: this.dateOptions.s2e[0], end: this.dateOptions.s2e[1] }).catch(() => {})
      }
      if (resp && resp.success) {
        this.table.main.data = resp.rows
        this.table.main.total = resp.rows.length
      }
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
  .info-cell {
    padding: 5px 5px;
    border: 1px solid #d9d9d9
  }
</style>
