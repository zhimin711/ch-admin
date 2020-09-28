<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input v-model="listQuery.name" placeholder="Server 名称" style="width: 200px;" class="filter-item" />-->
      <el-input v-model="listQuery.keyword" placeholder="节点Ip" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="fetchData()">查询</el-button>
    </div>
    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="节点IP" prop="address" />
      <el-table-column label="节点状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.state }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="节点元数据" width="150">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-view" @click="toggleExpand(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="1">
        <template slot-scope="{row}">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>节点元数据</span>
            </div>
            <div class="text item">
              <pre>{{ row.extendInfo }}</pre>
            </div>
          </el-card>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getClusterNodes } from '@/api/nacos/cluster'

export default {
  name: 'NacosClusterNodes',
  filters: {
    statusFilter(status) {
      const statusMap = {
        'UP': 'success',
        'DOWN': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      listLoading: true,
      listQuery: {
        name: '',
        ip: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getClusterNodes(this.listQuery).then(res => {
        this.list = res.data
      }).finally(() => {
        this.listLoading = false
      })
    },
    toggleExpand(row) {
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.address !== item.address) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    }
  }
}
</script>
<style scoped>
  .el-card pre {
    display: block;
    padding: 9.5px;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.428571429;
    color: #333333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #cccccc;
    border-radius: 4px;
  }
</style>
