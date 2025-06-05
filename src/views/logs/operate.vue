<template>
  <div class="app-container">
    <el-form :inline="true" class="filter-container" label-width="80px">
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="listQuery.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 270px;"
        />
      </el-form-item>

      <el-form-item label="请求地址">
        <el-input v-model="listQuery.params.url" :placeholder="$t('label.address')" style="width: 400px;" />
      </el-form-item>

      <el-form-item label="授权码">
        <el-input v-model="listQuery.params.authCode" :placeholder="$t('label.code')" style="width: 300px;" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getList">
          {{ $t('btn.search') }}
        </el-button>
        <el-button type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
          {{ $t('btn.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column :label="$t('label.address')" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.method')" width="75px">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.code')" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.authCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.operator }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作IP">
        <template slot-scope="scope">
          <span>{{ scope.row.requestIp }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" width="160px">
        <template slot-scope="scope">
          <span>{{ scope.row.requestTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="耗时（毫秒）" width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.responseTime - scope.row.requestTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="错误信息">
        <template slot-scope="scope">
          <span>{{ scope.row.errorMessage }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { listOPRecord } from '@/api/logs/op-record'
import { parseTime } from '@/utils'

export default {
  name: 'LogsOperate',
  components: { Pagination },
  data() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        // 初始化时间范围参数为今天
        dateRange: [startOfDay, endOfDay],
        params: {
        }
      },
      record: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.params.startTime = parseTime(this.listQuery.dateRange[0], '{y}-{m}-{d} {h}:{i}:{s}')
      this.listQuery.params.endTime = parseTime(this.listQuery.dateRange[1], '{y}-{m}-{d} {h}:{i}:{s}')
      listOPRecord(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
      }).finally(() => { this.listLoading = false })
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
</style>
