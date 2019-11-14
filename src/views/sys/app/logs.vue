<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.params.insId"
        class="filter-item"
        filterable
        remote
        reserve-keyword
        placeholder="(应用实例)请输入关键词"
        :remote-method="queryInstances"
        :loading="loadingIns"
        @change="changeIns">
        <el-option
          v-for="item in options.instances"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <!--<el-input v-model="listQuery.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />-->
      <el-select v-model="listQuery.params.type" placeholder="类型" class="filter-item" clearable>
        <el-option label="日志" value="1">日志</el-option>
        <el-option label="配置" value="0">配置</el-option>
      </el-select>
      <el-select v-model="listQuery.params.env" placeholder="环境" class="filter-item" clearable @change="changeEnv">
        <el-option label="DEV" value="1">DEV</el-option>
        <el-option label="TEST" value="2">TEST</el-option>
        <el-option label="PROD" value="3">PROD</el-option>
      </el-select>
      <el-input v-model="listQuery.params.fileName" placeholder="文件名匹配（info.log）" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.params.content" placeholder="日志内容匹配" style="width: 300px;" class="filter-item" />
      <el-button v-if="checkPermission2(['UPMS_USER_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="120px" label="主机类型">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.type }}</span>-->
          <el-tag>
            {{ scope.row.type | convertTypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180px" label="主机名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机地址">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="主机端口">
        <template slot-scope="scope">
          <span>{{ scope.row.port }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <!--<el-button type="primary" size="small" @click="handleEdit(scope.row)">Edit</el-button>-->
          <!--<el-button type="danger" size="small" @click="handleDel(scope.row)">Delete</el-button>-->
          <el-link v-if="checkPermission2(['UPMS_USER_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['UPMS_USER_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list, add, edit, del } from '@/api/sys/app/logs'
import { getUserInstances, getUserNodes } from '@/api/sys/app/instance'

export default {
  name: 'SysAppLogsManager',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      let s = 'draft'
      if (status === '1') {
        s = 'published'
      } else if (status === '3') {
        s = 'deleted'
      }
      return statusMap[s]
    },
    convertTypeFilter(type) {
      return ['', 'DB(数据库)', '远程终端(SSH)', '(FTP)'][type]
    }
  },
  data() {
    return {
      loadingIns: false,
      options: {
        instances: []
      },
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      record: {},
      recordRoles: [],
      nodes: []
    }
  },
  created() {
    this.queryInstances('')
    // this.getList()
  },
  methods: {
    checkPermission2,
    queryInstances(query) {
      this.loadingIns = true
      getUserInstances(query).then(response => {
        this.loadingIns = false
        this.options.instances = response.rows
      })
    },
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      })
    },
    changeIns(val) {
      getUserNodes(val).then(response => {
        this.nodes = response.rows
      })
    },
    changeEnv(val) {
    },
    handleDel(row) {
      const _this = this
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await del(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        resp = await add(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await edit(this.record.id, this.record)
      }
      if (resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.username} success!`
        })
        _this.getList()
      }
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
