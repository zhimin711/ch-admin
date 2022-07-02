<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
import BoxCard from './components/BoxCard'

import { getWeekVisits } from '@/api/report/wiki/user.js'
import { getWeekArticles } from '@/api/report/wiki/article.js'
import { getWeekResources } from '@/api/report/wiki/resource.js'
// import { getNewRecommends } from '@/api/report/wiki/recommend.js'

const lineChartData = {
  newVisitis: {
    title: '',
    legendData: ['总量', '游客'],
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    title: '',
    legendData: ['文章发布量', '文章审核量'],
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    title: '',
    legendData: ['资源发布量', '资源审核量'],
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    title: '',
    legendData: ['文章点赞量', '资源点赞量'],
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    TransactionTable,
    TodoList,
    BoxCard
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis
    }
  },
  created() {
    this.weekReport('newVisitis')
  },
  methods: {
    handleSetLineChartData(type) {
      this.weekReport(type)
    },
    async weekReport(type) {
      let resp
      if (type === 'newVisitis') {
        resp = await getWeekVisits()
      } else if (type === 'messages') {
        resp = await getWeekArticles()
      } else if (type === 'purchases') {
        resp = await getWeekResources()
      }
      this.lineChartData = lineChartData[type]
      if (resp && resp.success) {
        this.lineChartData.xData = resp.rows[0].dateList
        this.lineChartData.expectedData = resp.rows[0].valueList
        this.lineChartData.actualData = resp.rows[0].keyList
      }
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
