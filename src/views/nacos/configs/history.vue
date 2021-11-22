<template>
  <el-card class="box-card">
    <sticky :z-index="10" :class-name="'sub-navbar2 '">
      <tenant v-model="namespaceId" @change="queryData" />
    </sticky>
    <div slot="header" class="clearfix">
      <span>历史版本(保留30天)</span>
    </div>
    <div class="">
      <div class="query-container">
        <el-form ref="queryForm" :model="listQuery" :inline="true" :rules="rules">
          <el-form-item label="Data ID" prop="dataId">
            <el-input v-model="listQuery.dataId" placeholder="请输入Data ID" style="width: 200px;" />
          </el-form-item>
          <el-form-item label="分组" prop="group">
            <el-input v-model="listQuery.group" placeholder="分组名称" style="width: 200px;" />
          </el-form-item>
        </el-form>
        <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      </div>
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="Data ID" min-width="200" prop="dataId" />
        <el-table-column label="Group" min-width="200" prop="group" />
        <el-table-column label="最后更新时间" min-width="100" prop="lastModifiedTime" :formatter="dateFormat" />
        <el-table-column align="center" label="操作" width="180">
          <template slot-scope="{row}">
            <el-button v-permission="'NacosConfigsHistoryDetail'" type="text" icon="el-icon-view" @click.native="handleDetail(row)">详情</el-button>
            <el-button v-permission="'NacosConfigsHistoryRollback'" type="text" icon="el-icon-refresh-left" @click.native="handleRollback(row)">回滚</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="count>0" :total="count" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="fetchData()" />
    </div>
  </el-card>

</template>

<script>
import { getNacosConfigsHistory } from '@/api/nacos/history'
import { parseTime } from '@/utils/index'
import Pagination from '@/components/Pagination'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/tenant' // 粘性header组件

export default {
  name: 'NacosConfigsHistory',
  components: { Pagination, Sticky, Tenant },
  data() {
    return {
      namespaceId: '',
      list: null,
      listLoading: false,
      count: 0,
      listQuery: {
        search: 'accurate',
        namespaceId: '',
        dataId: null,
        group: 'DEFAULT_GROUP',
        pageNo: 1,
        pageSize: 10
      },
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
  },
  methods: {
    fetchData() {
      this.listLoading = true
      this.listQuery.tenant = this.namespaceId
      getNacosConfigsHistory(this.listQuery).then(res => {
        this.list = res.pageItems
        this.count = res.totalCount
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.listQuery.pageNo = 1
          this.fetchData()
        }
      })
    },
    handleDetail(row) {
      this.$router.push(`/nacos/configs/historyDetail?nid=${row.id}&namespaceId=${row.namespaceId || ''}&dataId=${row.dataId}&group=${row.group}`)
    },
    handleRollback(row) {
      this.$router.push(`/nacos/configs/rollback?nid=${row.id}&namespaceId=${row.namespaceId || ''}&dataId=${row.dataId}&group=${row.group}`)
    },
    dateFormat(row, column, cellValue, index) {
      return parseTime(new Date(cellValue))
    }
  }
}
</script>
