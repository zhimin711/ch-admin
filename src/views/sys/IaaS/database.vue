<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-permission="['IAAS_DATABASE_SEARCH']" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-permission="['IAAS_DATABASE_ADD']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="120px" label="类型">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.type }}</span>-->
          <el-tag>
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180px" label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="端口">
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
            {{ row.status | enableStatusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <!--<el-link v-permission="['IAAS_DATABASE_EDIT']" type="primary" icon="el-icon-setting" @click="handleEdit(scope.row, scope.$index)">管理</el-link>-->
          <router-link v-permission="['IAAS_DATABASE_EDIT']" :to="'/cloud/IaaS/dataSource/'+scope.row.id">
            <el-button type="text" icon="el-icon-setting">管理</el-button>
          </router-link>
          <el-link v-permission="['IAAS_DATABASE_DELETE']" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改 数据库实例':'添加 数据库实例'">
      <el-form :model="record" label-width="80px" label-position="left">
        <el-form-item label="类型">
          <el-select v-model="record.type" placeholder="请选择">
            <el-option key="1" label="MySQL" value="MySQL" />
            <el-option key="2" label="Oracle" value="Oracle" />
            <!--<el-option key="3" label="" value="3" />-->
            <!--<el-option key="4" label="" value="4" />-->
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="record.name" placeholder="实例名称" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="record.url" placeholder="连接地址" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="record.port" placeholder="端口" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="record.username" placeholder="用户名(管理员)" />
        </el-form-item>
        <el-form-item label="用户密码">
          <el-input v-model="record.password" type="password" placeholder="用户密码" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="record.status" placeholder="请选择">
            <el-option key="enabled" label="启用" value="1" />
            <el-option key="disabled" label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { listDatabase, addDatabase, editDatabase, delDatabase } from '@/api/sys/IaaS/database'

export default {
  name: 'IaaSDatabase2',
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
      record: {},
      recordRoles: [],
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      roles: []
    }
  },
  created() {
    this.getList()
    // this.getEnableRoles()
  },
  methods: {
    getList() {
      this.listLoading = true
      listDatabase(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      })
    },
    handleAdd() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
    },
    handleDel(row) {
      const _this = this
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await delDatabase(row.id)
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
        resp = await addDatabase(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editDatabase(this.record.id, this.record)
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
