<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart ref="brokerBarChart" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <line-chart ref="brokerLineChart" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart-topic ref="topicBarChart" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <line-chart-topic ref="topicLineChart" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
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
  name: 'RocketMQDashboard1',
  components: {
    GithubCorner,
    LineChart,
    LineChartTopic,
    BarChart,
    BarChartTopic
  },
  data() {
    return {
      params: {},
      lineChartData: {},
      barChartData: {
        broker: {},
        topic: {}
      },
      options: { topic: [] }
    }
  },
  created() {
    this.getReportCluster()
    this.getReportTopic()
    this.getBrokerTrend()
  },
  methods: {
    handleSetLineChartData(type) {
    },
    getReportCluster() {
      listRocketMQ().then(resp => {
        if (resp.success) {
          const { brokerServer, clusterInfo } = resp.rows[0]

          if (clusterInfo.clusterAddrTable) {
            const clusterMap = generateBrokerMap(brokerServer, clusterInfo.clusterAddrTable, clusterInfo.brokerAddrTable)
            const brokerArray = []
            for (const k in clusterMap) {
              clusterMap[k].forEach(item => brokerArray.push(item))
            }
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
      listRocketDashboardTopicCurrent().then(resp => {
        this.options.topic = []
        if (resp.success) {
          const topicList = resp.rows
          topicList.sort(function(first, last) {
            const firstTotalMsg = parseFloat(first.split(',')[1])
            const lastTotalMsg = parseFloat(last.split(',')[1])
            return lastTotalMsg - firstTotalMsg
          })
          const xAxisData = []; const data = []

          for (let i = 0; i < topicList.length; i++) {
            const currentArray = topicList[i].split(',')
            if (i < 10) {
              xAxisData.push(currentArray[0])
              data.push(currentArray[1])
            }
            this.options.topic.push(currentArray[0])
          }
          this.barChartData.topic.xData = xAxisData
          this.barChartData.topic.yData = data
          this.$refs.topicBarChart.setOptions(this.barChartData.topic)
          this.params.topic = this.options.topic[0]
          this.getTopicTrend(this.params.topic)
        }
      })
    },
    getBrokerTrend() {
      const params = { date: this.params.date }
      if (isEmpty(this.params.date)) {
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
      const params = { date: this.params.date, topicName: topic }
      if (isEmpty(this.params.date)) {
        params.date = parseTime(new Date(), '{y}-{m}-{d}')
      }
      listRocketDashboardTopic(params).then(resp => {
        if (resp.success) {
          const _data = {}
          _data[topic] = resp.rows
          const _xAxisData = [topic]
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
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
