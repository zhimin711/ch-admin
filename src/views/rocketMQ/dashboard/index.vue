<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="el-icon-s-data" />
          <span>RocketMQ 仪表板</span>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            size="small"
            :loading="loading"
            @click="refreshAllData"
          >
            刷新数据
          </el-button>
        </div>
      </div>
      <div class="header-description">
        实时监控RocketMQ集群的Broker和Topic性能指标
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon broker-icon">
              <i class="el-icon-s-grid" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ brokerCount }}</div>
              <div class="stats-label">Broker节点</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon topic-icon">
              <i class="el-icon-s-order" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ topicCount }}</div>
              <div class="stats-label">Topic数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon message-icon">
              <i class="el-icon-s-promotion" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ totalMessages }}</div>
              <div class="stats-label">总消息数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon tps-icon">
              <i class="el-icon-s-marketing" />
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ avgTPS }}</div>
              <div class="stats-label">平均TPS</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件卡片 -->
    <el-card class="filter-card" shadow="hover">
      <div slot="header" class="filter-header">
        <span class="filter-title">
          <i class="el-icon-s-operation" />
          数据筛选
        </span>
        <el-tag type="info" size="small">
          数据每5秒自动刷新
        </el-tag>
      </div>

      <el-form :inline="true" class="filter-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="filter-item-wrapper">
              <label class="filter-label">
                <i class="el-icon-date" />
                选择日期
              </label>
              <el-date-picker
                v-model="params.date"
                type="date"
                value-format="yyyy-MM-dd"
                :picker-options="dateOptions.pickerOptions"
                placeholder="选择日期"
                class="filter-date-picker"
                @change="handleDateChange"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="filter-item-wrapper">
              <label class="filter-label">
                <i class="el-icon-s-order" />
                选择主题
              </label>
              <el-select
                v-model="params.topicName"
                placeholder="请选择主题"
                class="filter-select"
                @change="handleTopicChange"
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
        </el-row>
      </el-form>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span class="chart-title">
              <i class="el-icon-s-data" />
              Broker消息统计
            </span>
            <el-tag type="primary" size="small">TOP 10</el-tag>
          </div>
          <div class="chart-wrapper">
            <bar-chart ref="brokerBarChart" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span class="chart-title">
              <i class="el-icon-s-order" />
              Topic消息统计
            </span>
            <el-tag type="success" size="small">TOP 10</el-tag>
          </div>
          <div class="chart-wrapper">
            <bar-chart-topic ref="topicBarChart" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span class="chart-title">
              <i class="el-icon-s-marketing" />
              Broker趋势图
            </span>
            <el-tag type="warning" size="small">实时数据</el-tag>
          </div>
          <div class="chart-wrapper">
            <line-chart ref="brokerLineChart" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span class="chart-title">
              <i class="el-icon-s-marketing" />
              Topic趋势图
            </span>
            <el-tag type="danger" size="small">实时数据</el-tag>
          </div>
          <div class="chart-wrapper">
            <line-chart-topic ref="topicLineChart" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import BarChart from './components/BarChart'
import BarChartTopic from './components/BarChartTopic'
import LineChart from './components/LineChart'
import LineChartTopic from './components/LineChartTopic'

import { parseTime } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { generateBrokerMap } from '@/api/rocketmq/tools'
import { listRocketMQ } from '@/api/rocketmq/cluster'
import {
  listRocketDashboardBroker,
  listRocketDashboardTopic,
  listRocketDashboardTopicCurrent
} from '@/api/rocketmq/dashboard'

export default {
  name: 'RocketMQDashboard',
  components: {
    LineChart,
    LineChartTopic,
    BarChart,
    BarChartTopic
  },
  data() {
    return {
      loading: false,
      params: {},
      origClusterAddr: '',
      lineChartData: {},
      barChartData: {
        broker: {},
        topic: {}
      },
      timer: '',
      // 统计数据
      brokerCount: 0,
      topicCount: 0,
      totalMessages: 0,
      avgTPS: 0,
      dateOptions: {
        pickerOptions: {
          disabledDate(time) {
            const times = 86400000 * 7// 一周的毫秒数
            const curTime = new Date().getTime()
            const before = curTime - times// 前一周毫秒数
            const after = curTime// 后一周毫秒数
            return time.getTime() > after || time.getTime() < before
          }
        }
      },
      options: { topics: [] }
    }
  },
  created() {
    this.getReportCluster()
    this.getReportTopic()
    this.getBrokerTrend()
  },
  mounted() {
    this.timer = setInterval(() => {
      this.refreshTrend()
    }, 5000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    handleDateChange(time) {
      this.refreshTrend()
    },
    handleTopicChange(val) {
      this.getTopicTrend(val)
    },
    refreshAllData() {
      this.loading = true
      Promise.all([
        this.getReportCluster(),
        this.getReportTopic(),
        this.getBrokerTrend()
      ]).finally(() => {
        this.loading = false
      })
    },
    refreshTrend() {
      this.getBrokerTrend()
      this.getTopicTrend()
    },
    getReportCluster() {
      return listRocketMQ().then(resp => {
        if (resp.success) {
          const { brokerServer, clusterInfo } = resp.rows[0]

          if (clusterInfo.clusterAddrTable) {
            const clusterMap = generateBrokerMap(brokerServer, clusterInfo.clusterAddrTable, clusterInfo.brokerAddrTable)
            const brokerArray = []
            let totalMsg = 0
            let totalTPS = 0

            for (const k in clusterMap) {
              clusterMap[k].forEach(item => {
                brokerArray.push(item)
                totalMsg += parseFloat(item.msgGetTotalTodayNow) || 0
                totalTPS += parseFloat(item.putTps.split(' ')[0]) || 0
              })
            }

            // 更新统计数据
            this.brokerCount = brokerArray.length
            this.totalMessages = totalMsg.toLocaleString()
            this.avgTPS = totalTPS > 0 ? (totalTPS / brokerArray.length).toFixed(2) : '0'

            brokerArray.sort(function(firstBroker, lastBroker) {
              const firstTotalMsg = parseFloat(firstBroker.msgGetTotalTodayNow)
              const lastTotalMsg = parseFloat(lastBroker.msgGetTotalTodayNow)
              return lastTotalMsg - firstTotalMsg
            })
            const xAxisData = []; const data = []

            for (let i = 0; i < brokerArray.length && i < 10; i++) {
              const broker = brokerArray[i]
              xAxisData.push(broker.brokerName + ':' + broker.index)
              data.push(broker.msgGetTotalTodayNow)
            }
            this.barChartData.broker.xData = xAxisData
            this.barChartData.broker.yData = data
            this.$refs.brokerBarChart.setOptions(this.barChartData.broker)
          }
        }
      })
    },
    getReportTopic() {
      return listRocketDashboardTopicCurrent().then(resp => {
        this.options.topics = []
        if (resp.success) {
          const topicList = resp.rows
          let totalMsg = 0

          topicList.sort(function(first, last) {
            const firstTotalMsg = parseFloat(first.split(',')[1])
            const lastTotalMsg = parseFloat(last.split(',')[1])
            return lastTotalMsg - firstTotalMsg
          })
          const xAxisData = []; const data = []

          for (let i = 0; i < topicList.length; i++) {
            const currentArray = topicList[i].split(',')
            const msgCount = parseFloat(currentArray[1]) || 0
            totalMsg += msgCount

            if (i < 10) {
              xAxisData.push(currentArray[0])
              data.push(currentArray[1])
            }
            this.options.topics.push({ label: currentArray[0], value: currentArray[0] })
          }

          // 更新统计数据
          this.topicCount = topicList.length

          this.barChartData.topic.xData = xAxisData
          this.barChartData.topic.yData = data
          this.$refs.topicBarChart.setOptions(this.barChartData.topic)
          if (this.options.topics.length > 0) {
            this.getTopicTrend(this.options.topics[0].value)
          }
          console.log('totalMsg:', totalMsg)
        }
      })
    },
    getBrokerTrend() {
      const params = { date: this.params.date }
      if (isEmpty(params.date)) {
        params.date = parseTime(new Date(), '{y}-{m}-{d}')
      }
      listRocketDashboardBroker(params).then(resp => {
        if (resp.success) {
          const _data = {}
          const _xAxisData = []
          const row = resp.rows[0]
          for (const k in row) {
            _data[k] = row[k]
            _xAxisData.push(k)
          }
          this.$refs.brokerLineChart.setOptions(this.getBrokerLineChart(_xAxisData, _data))
        }
      })
    },
    getBrokerLineChart(legend, data) {
      const series = []
      const xAxisData = []
      let flag = true
      for (const k in data) {
        const key = k
        const values = data[k]
        const _tps = []
        values.forEach((tpsValue, i) => {
          const tpsArray = tpsValue.split(',')
          if (flag) {
            xAxisData.push(parseTime(tpsArray[0], '{h}:{i}:{s}'))
          }
          _tps.push(tpsArray[1])
        })
        flag = false
        const _series = {
          name: key,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          data: _tps
        }
        series.push(_series)
      }
      return {
        legend: {
          data: legend
        },
        color: ['#FF0000', '#00BFFF', '#FF00FF', '#1ce322', '#000000', '#EE7942'],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        series: series
      }
    },
    getTopicTrend(topic) {
      const params = { date: this.params.date, topicName: topic || this.params.topicName }
      if (isEmpty(params.topicName)) {
        return
      }
      if (isEmpty(this.params.date)) {
        params.date = parseTime(new Date(), '{y}-{m}-{d}')
      }
      this.params = Object.assign(params)
      listRocketDashboardTopic(params).then(resp => {
        if (resp.success) {
          const _data = {}
          _data[params.topicName] = resp.rows
          const _xAxisData = [params.topicName]
          this.$refs.topicLineChart.setOptions(this.getTopicLineChart(_xAxisData, _data))
        }
      })
    },
    getTopicLineChart(legend, data) {
      const series = []
      const xAxisData = []
      let flag = true
      for (const k in data) {
        const key = k
        const values = data[k]
        const _tps = []
        values.forEach((tpsValue, i) => {
          const tpsArray = tpsValue.split(',')
          if (flag) {
            xAxisData.push(parseTime(tpsArray[0], '{h}:{i}:{s}'))
          }
          _tps.push(tpsArray[3])
        })
        flag = false
        const _series = {
          name: key,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          data: _tps
        }
        series.push(_series)
      }

      const option = {
        baseOption: {
          legend: {
            data: legend
          },
          // color: ["#FF0000", "#00BFFF", "#FF00FF", "#1ce322", "#000000", '#EE7942'],
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData
          },
          series: series
        },
        media: [
          {
            query: {},
            option: {

            }
          }
        ]

      }
      return option
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
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

// 统计卡片
.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;

  i {
    font-size: 24px;
    color: #fff;
  }
}

.broker-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.topic-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.tps-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #606266;
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

.filter-date-picker,
.filter-select {
  width: 100%;
}

// 图表卡片
.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.chart-title {
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

.chart-wrapper {
  height: 400px;
  padding: 16px 0;
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
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

  .stats-content {
    padding: 4px 0;
  }

  .stats-icon {
    width: 50px;
    height: 50px;
    margin-right: 12px;

    i {
      font-size: 20px;
    }
  }

  .stats-number {
    font-size: 24px;
  }

  .chart-wrapper {
    height: 300px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    height: 350px;
  }
}

// 卡片悬停效果
.filter-card:hover,
.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

// 按钮样式优化
.el-button--small {
  border-radius: 4px;
  font-weight: 500;
}

// 标签样式优化
.el-tag {
  border-radius: 4px;
}
</style>
