<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.url" :placeholder="$t('label.address')" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.params.authCode" :placeholder="$t('label.code')" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        {{ $t('btn.search') }}
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        {{ $t('btn.reset') }}
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column :label="$t('label.address')">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.method')" width="75px">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.code')">
        <template slot-scope="scope">
          <span>{{ scope.row.authCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录IP">
        <template slot-scope="scope">
          <span>{{ scope.row.requestIp }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="requestTime" label="登录时间" width="160">
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
import { listOPRecord } from '@/api/logs/login-record'

export default {
  name: 'LogsLogin',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
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
