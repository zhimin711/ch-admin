<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="params" label-width="180px" label-position="left">
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
      </el-form>
    </div>
    <el-table v-loading="listLoading" :data="tableA">
      <el-table-column width="120px" label="分片">
        <template slot-scope="{row}">
          <span>{{ row.brokerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编号">
        <template slot-scope="{row}">
          <span>{{ row.index }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" prop="address" />
      <el-table-column label="版本" prop="brokerVersionDesc" />
      <el-table-column label="生产消息TPS">
        <template slot-scope="{row}">
          <span>{{ row.putTps.split(' ')[0] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费消息TPS">
        <template slot-scope="{row}">
          <span>{{ row.getTransferedTps.split(' ')[0] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昨日生产总数">
        <template slot-scope="{row}">
          <span>{{ row.msgPutTotalTodayMorning - row.msgPutTotalYesterdayMorning }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昨日消费总数">
        <template slot-scope="{row}">
          <span>{{ row.msgGetTotalTodayMorning - row.msgGetTotalYesterdayMorning }}</span>
        </template>
      </el-table-column>
      <el-table-column label="今天生产总数">
        <template slot-scope="{row}">
          <span>{{ row.msgPutTotalTodayNow - row.msgPutTotalTodayMorning }}</span>
        </template>
      </el-table-column>
      <el-table-column label="今天消费总数">
        <template slot-scope="{row}">
          <span>{{ row.msgGetTotalTodayNow - row.msgGetTotalTodayMorning }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-link v-permission="'ROCKETMQ_CLUSTER_STATUS'" type="success" icon="el-icon-view" @click="handleStatus(scope.row)">状态</el-link>
          <el-link v-permission="'ROCKETMQ_CLUSTER_CONFIG'" type="primary" icon="el-icon-setting" @click="handleConfig(scope.row)">配置</el-link>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle">
      <el-table :data="tableB">
        <el-table-column label="名称" prop="name" />
        <el-table-column label="配置" prop="value" />
      </el-table>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialogVisible=false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { generateBrokerMap } from '@/api/rocketmq/tools'
import { listRocketMQ, getRocketMQ } from '@/api/rocketmq/cluster'

export default {
  name: 'RocketMQCluster',
  data() {
    return {
      listLoading: true,
      loading: { handleSubmit: false },
      params: {},
      record: {},
      brokerServer: {},
      brokers: {},
      tableA: [],
      tableB: [],
      dialogVisible: false,
      dialogTitle: '',
      options: {
        clusters: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listRocketMQ().then(resp => {
        this.listLoading = false
        if (resp.success) {
          const { brokerServer, clusterInfo } = resp.rows[0]

          this.brokerServer = brokerServer
          if (clusterInfo.clusterAddrTable) {
            this.options.clusters = []
            for (const k in clusterInfo.clusterAddrTable) {
              this.options.clusters.push({ clusterName: k })
            }
            this.brokers = generateBrokerMap(brokerServer, clusterInfo.clusterAddrTable, clusterInfo.brokerAddrTable)
            this.params.clusterName = this.options.clusters[0].clusterName
            this.handleClusterChange(this.params.clusterName)
          }
        }
      }).catch(() => { this.loading = false })
    },
    handleClusterChange(val) {
      this.tableA = this.brokers[val]
    },
    handleStatus(row) {
      this.dialogTitle = `[${row.brokerName}][${row.index}]`
      this.dialogVisible = true
      this.record = this.brokerServer[row.brokerName][row.index]
      this.tableB = []
      for (const k in this.record) {
        this.tableB.push({ name: k, value: this.record[k] })
      }
    },
    handleConfig(row) {
      this.dialogTitle = `[${row.brokerName}][${row.index}]`
      getRocketMQ({ brokerAddr: row.address }).then(resp => {
        if (resp.success) {
          const record = resp.rows[0]
          this.tableB = []
          for (const k in record) {
            this.tableB.push({ name: k, value: record[k] })
          }
          this.dialogVisible = true
        }
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
  .info-cell {
    padding: 5px 5px;
    border: 1px solid #d9d9d9
  }
</style>
