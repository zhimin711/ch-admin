<template>
  <div class="app-container">
    <!-- 筛选条件卡片 -->
    <el-card class="filter-card" shadow="hover">
      <div slot="header" class="filter-header">
        <span class="filter-title">
          <i class="el-icon-s-operation" />
          集群配置
        </span>
        <el-button
          type="text"
          icon="el-icon-refresh"
          :loading="listLoading"
          @click="refreshData"
        >
          刷新
        </el-button>
      </div>

      <el-form :inline="true" :model="params" class="filter-form">
        <el-row :gutter="20">
          <el-col :span="12">
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

          <el-col :span="12">
            <div class="filter-item-wrapper">
              <label class="filter-label">
                <i class="el-icon-s-grid" />
                Broker集群
              </label>
              <el-select
                v-model="params.clusterName"
                placeholder="请选择Broker集群"
                class="filter-select"
                @change="handleClusterChange"
              >
                <el-option
                  v-for="item in options.clusters"
                  :key="item.clusterName"
                  :label="item.clusterName"
                  :value="item.clusterName"
                >
                  <span style="float: left">
                    <i class="el-icon-s-grid" style="color: #67C23A; margin-right: 5px;" />
                    {{ item.clusterName }}
                  </span>
                </el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格卡片 -->
    <el-card class="table-card" shadow="hover">
      <div slot="header" class="table-header">
        <span class="table-title">
          <i class="el-icon-s-data" />
          Broker节点列表
        </span>
        <div class="table-actions">
          <el-tag type="info" size="small">
            共 {{ tableA.length }} 个节点
          </el-tag>
        </div>
      </div>

      <el-table
        v-loading="listLoading"
        :data="tableA"
        stripe
        border
        class="cluster-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column width="120px" label="分片" align="center">
          <template slot-scope="{row}">
            <el-tag type="primary" size="small">
              <i class="el-icon-s-grid" />
              {{ row.brokerName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="编号" align="center" width="80">
          <template slot-scope="{row}">
            <el-tag type="info" size="small">{{ row.index }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="地址" prop="address" min-width="200">
          <template slot-scope="{row}">
            <el-link type="primary" :underline="false">
              <i class="el-icon-location" />
              {{ row.address }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="版本" prop="brokerVersionDesc" align="center" width="120">
          <template slot-scope="{row}">
            <el-tag type="success" size="small">{{ row.brokerVersionDesc }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="生产消息TPS" align="center" width="120">
          <template slot-scope="{row}">
            <div class="metric-value">
              <i class="el-icon-upload2" style="color: #409EFF;" />
              <span class="metric-number">{{ row.putTps.split(' ')[0] }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="消费消息TPS" align="center" width="120">
          <template slot-scope="{row}">
            <div class="metric-value">
              <i class="el-icon-download" style="color: #67C23A;" />
              <span class="metric-number">{{ row.getTransferedTps.split(' ')[0] }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="昨日生产总数" align="center" width="120">
          <template slot-scope="{row}">
            <div class="metric-value">
              <i class="el-icon-data-analysis" style="color: #E6A23C;" />
              <span class="metric-number">{{ row.msgPutTotalTodayMorning - row.msgPutTotalYesterdayMorning }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="昨日消费总数" align="center" width="120">
          <template slot-scope="{row}">
            <div class="metric-value">
              <i class="el-icon-data-analysis" style="color: #F56C6C;" />
              <span class="metric-number">{{ row.msgGetTotalTodayMorning - row.msgGetTotalYesterdayMorning }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="今天生产总数" align="center" width="120">
          <template slot-scope="{row}">
            <div class="metric-value">
              <i class="el-icon-data-line" style="color: #409EFF;" />
              <span class="metric-number">{{ row.msgPutTotalTodayNow - row.msgPutTotalTodayMorning }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="今天消费总数" align="center" width="120">
          <template slot-scope="{row}">
            <div class="metric-value">
              <i class="el-icon-data-line" style="color: #67C23A;" />
              <span class="metric-number">{{ row.msgGetTotalTodayNow - row.msgGetTotalTodayMorning }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-link
              type="success"
              size="mini"
              icon="el-icon-view"
              @click="handleStatus(scope.row)"
            >
              状态
            </el-link>
            <el-link
              v-permission="'ROCKETMQ_CLUSTER_CONFIG'"
              type="primary"
              size="mini"
              icon="el-icon-setting"
              @click="handleConfig(scope.row)"
            >
              配置
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="800px"
      class="detail-dialog"
    >
      <el-table
        :data="tableB"
        border
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="配置项" prop="name" width="200" />
        <el-table-column label="配置值" prop="value" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-close" @click="dialogVisible=false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { generateBrokerMap } from '@/api/rocketmq/tools'
import { listRocketMQ, getRocketMQ } from '@/api/rocketmq/cluster'
import { listRocketMQNameSrv } from '@/api/rocketmq/name-srv'
import Cookies from 'js-cookie'

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
      nameSrvAddr: '',
      options: {
        nameSrvList: [],
        clusters: []
      }
    }
  },
  created() {
    this.listNameSvr()
    // this.getList()
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
            this.getList()
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
      this.dialogTitle = `Broker状态详情 - [${row.brokerName}][${row.index}]`
      this.dialogVisible = true
      this.record = this.brokerServer[row.brokerName][row.index]
      this.tableB = []
      for (const k in this.record) {
        this.tableB.push({ name: k, value: this.record[k] })
      }
    },
    handleConfig(row) {
      this.dialogTitle = `Broker配置详情 - [${row.brokerName}][${row.index}]`
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
.app-container {
  padding: 10px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.filter-card {
  margin-bottom: 10px;
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
}

.filter-title i {
  margin-right: 8px;
  color: #409EFF;
}

.filter-form {
  padding: 0;
}

.filter-item-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.filter-label i {
  margin-right: 6px;
  color: #409EFF;
}

.filter-select {
  width: 100%;
}

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
}

.table-title i {
  margin-right: 8px;
  color: #409EFF;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cluster-table {
  border-radius: 6px;
  overflow: hidden;
}

.metric-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.metric-number {
  font-weight: 600;
  color: #303133;
}

.detail-dialog .el-dialog__header {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.detail-dialog .el-dialog__title {
  font-weight: 600;
  color: #303133;
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .filter-item-wrapper {
    margin-bottom: 10px;
  }

  .el-col {
    margin-bottom: 10px;
  }
}

/* 表格悬停效果 */
.cluster-table .el-table__row:hover {
  background-color: #f0f9ff !important;
}

/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
}

/* 按钮样式优化 */
.el-button--mini {
  border-radius: 4px;
  font-weight: 500;
}

/* 卡片阴影效果 */
.filter-card:hover,
.table-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}
</style>
