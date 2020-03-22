<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.url" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.params.authCode" placeholder="授权代码" style="width: 200px;" class="filter-item" />
      <el-button v-if="checkPermission2(['LOGS_OPERATE_LIST'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column> <el-table-column label="方法" width="70px">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授权代码">
        <template slot-scope="scope">
          <span>{{ scope.row.authCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.operator }}</span>
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
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { listOPRecord } from '@/api/logs/op-record'

export default {
  name: 'LogsOperateManager',
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
    checkPermission2,
    getList() {
      this.listLoading = true
      listOPRecord(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.loading = false })
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
