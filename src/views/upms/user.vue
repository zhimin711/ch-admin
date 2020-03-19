<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.userId" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-input v-model="listQuery.params.username" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-if="checkPermission2(['UPMS_USER_SEARCH'])" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['UPMS_USER_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加用户
      </el-button>
      <!--<el-button v-if="checkPermission2(['UPMS_USER_PASSWORD_INIT'])" class="filter-item" style="margin-left: 10px;" type="warning" icon="el-icon-refresh" @click="handleAdd">
        初始化用户密码
      </el-button>-->
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
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
      <el-table-column label="邮箱地址">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
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
          <!--<el-button type="primary" size="small" @click="handleEdit(scope.row)">Edit</el-button>-->
          <!--<el-button type="danger" size="small" @click="handleDel(scope.row)">Delete</el-button>-->
          <el-link v-if="checkPermission2(['UPMS_USER_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <!--<el-link v-if="checkPermission2(['UPMS_USER_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>-->
          <el-link v-if="checkPermission2(['UPMS_USER_ROLE'])" type="primary" icon="el-icon-menu" @click="handleAuth(scope.row)">分配角色</el-link>
          <el-link v-if="checkPermission2(['UPMS_USER_PASSWORD_INIT'])" type="danger" icon="el-icon-refresh" @click="handleInitPwd(scope.row)">初始化密码</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit 用户':'New 用户'">
      <el-form :model="record" label-width="80px" label-position="left">
        <el-form-item label="用户ID">
          <el-input v-model="record.userId" placeholder="用户ID（系统生成）" :disabled="true" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="record.username" placeholder="用户名" :disabled="dialogCodeEdit" />
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
            placeholder="用户 Description"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'分配用户角色'" width="544px">
      <div style="text-align:left;margin-bottom: 20px">
        <el-transfer v-model="recordRoles" :data="roles" :titles="['未分配角色', '已分配角色']" :props="{ key: 'id', label: 'name' }" />
      </div>
      <div style="text-align:left;padding-left:170px">
        <el-button type="primary" @click="handleSubmitAuth">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import waves from '@/directive/waves/index.js' // 水波纹指令
import { list, add, edit, del, initPwd, getEnableRoles, getRoles, editRoles } from '@/api/upms/user'

export default {
  name: 'UserManager',
  components: { Pagination },
  directives: {
    waves
  },
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
    this.getEnableRoles()
  },
  methods: {
    checkPermission2,
    async getEnableRoles() {
      const resp = await getEnableRoles()
      if (resp && resp.success) this.roles = resp.rows
    },
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.loading = false })
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
          await del(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
          })
        })
        .catch(err => { console.error(err) })
    },
    handleInitPwd(row) {
      const _this = this
      _this.$confirm(`请确认是否初始化用户[${row.username}]密码，操作不可回退?`, '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const resp = await initPwd(row.id)
          if (resp.success) {
            _this.$alert(`初始化成功！ (${resp.rows[0]})`, `[${row.username}]用户密码`, {
              confirmButtonText: '确定',
              callback: action => {
                //
              }
            })
          }
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
    },
    handleAuth(row) {
      //
      this.dialogVisible2 = true

      this.record = deepClone(row)
      this.recordRoles = []
      getRoles(row.id).then(resp => {
        if (resp.success) {
          resp.rows.forEach(route => {
            this.recordRoles.push(route.id)
          })
        }
      })
    },
    async handleSubmitAuth() {
      //
      const resp = await editRoles(this.record.id, this.recordRoles)
      if (resp && resp.success) {
        this.dialogVisible2 = false
      }
      this.$notify({
        title: '角色授权',
        dangerouslyUseHTMLString: true,
        message: `Auth Roles ` + (resp && resp.success ? 'success!' : 'error...'),
        type: resp && resp.success ? 'success' : 'error'
      })
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
