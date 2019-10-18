<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.userId" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-input v-model="listQuery.params.username" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1"></el-option>
        <el-option label="禁用" value="0"></el-option>
      </el-select>
      <el-button  class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd">
        添加用户
      </el-button>
      <!--<el-button type="primary" class="filter-item" icon="el-icon-plus" @click="handleAddRole">New Role</el-button>-->
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="用户ID">
        <template slot-scope="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="用户名">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户姓名">
        <template slot-scope="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="邮箱地址">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column width="100px" label="Importance">
         <template slot-scope="scope">
           <svg-icon v-for="n in +scope.row.importance" :key="n" icon-class="star" class="meta-item__icon" />
         </template>
       </el-table-column>-->

<!--
      <el-table-column class-name="status-col" label="Status" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
-->

<!--
      <el-table-column min-width="300px" label="Title">
        <template slot-scope="{row}">
          <router-link :to="'/example/edit/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
-->
      <el-table-column align="center" label="Operations" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">Edit</el-button>
          <!--<el-button type="danger" size="small" @click="handleDelete(scope)">Delete</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit Role':'New Role'">
      <el-form :model="record" label-width="80px" label-position="left">
        <el-form-item label="用户ID">
          <el-input v-model="record.userId" placeholder="用户ID（系统生成）" disabled=""/>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="record.username" placeholder="用户名" :disabled="dialogCodeEdit"/>
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="record.realName" placeholder="用户姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="record.email" placeholder="电子邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="record.mobilePhone" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="Desc">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Role Description"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, add, edit, del } from '@/api/upms/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'

export default {
  name: 'UserManager',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        params: {}
      },
      record: {},
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.rows
        this.total = response.total
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
    handleSubmit() {
      const _this = this
      // this.record = {}
      if (this.dialogType === 'new') {
        add(this.record).then(resp => {
          if (resp.success) {
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: `添加 ${this.record.username} success!`
            })
            _this.getList()
          }
        })
      } else if (this.dialogType === 'edit') {
        edit(this.record.id, this.record).then(resp => {
          if (resp.success) {
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: `修改 ${this.record.username} success!`
            })
            _this.getList()
          }
        }).catch((err) => {
          console.log('err :', err)
          _this.$notify.error({ title: '错误', message: err.message })
        })
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
