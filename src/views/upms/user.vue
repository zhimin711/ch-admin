<template>
  <div class="app-container">

    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="departmentName"
            :placeholder="$t('input.tips.departmentName')"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="tree"
            :data="options.departments"
            :expand-on-click-node="false"
            :filter-node-method="filterDepartments"
            default-expand-all
            @node-click="handleDepartmentClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24" style="border-left: 1px solid #dedede;">
        <div class="filter-container">
          <el-input v-model="tableA.params.userId" :placeholder="$t('input.tips.userId')" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
          <el-input v-model="tableA.params.username" :placeholder="$t('input.tips.username')" style="width: 200px;" class="filter-item" />
          <el-input v-model="tableA.params.realName" :placeholder="$t('input.tips.realName')" style="width: 200px;" class="filter-item" />
          <el-select v-model="tableA.params.status" :placeholder="$t('label.status')" class="filter-item" clearable>
            <el-option :label="$t('label.enable')" value="1">{{ $t('label.enable') }}</el-option>
            <el-option :label="$t('label.disable')" value="0">{{ $t('label.disable') }}</el-option>
          </el-select>
          <el-button v-loading="tableA.loading" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getList">
            {{ $t('btn.search') }}
          </el-button>
          <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="tableA.params = {}">
            {{ $t('btn.reset') }}
          </el-button>
          <el-button v-permission="['UPMS_USER_ADD']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
            {{ $t('user.add') }}
          </el-button>
          <!--<el-button v-permission="['UPMS_USER_PASSWORD_INIT']" class="filter-item" style="margin-left: 10px;" type="warning" icon="el-icon-refresh" @click="handleAdd">
        初始化用户密码
      </el-button>-->
        </div>
        <el-table v-loading="tableA.loading" :data="tableA.list" border fit highlight-current-row style="width: 100%">
          <el-table-column width="180px" :label="$t('user.department')" prop="department" />
          <el-table-column width="120px" align="center" :label="$t('user.userId')">
            <template slot-scope="scope">
              <span>{{ scope.row.userId }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120" align="center" :label="$t('user.username')">
            <template slot-scope="scope">
              <span>{{ scope.row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('user.realName')" min-width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.realName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('user.email')" min-width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.email }}</span>
            </template>
          </el-table-column>
          <el-table-column width="180px" align="center" :label="$t('table.createDate')">
            <template slot-scope="scope">
              <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>

          <el-table-column class-name="status-col" :label="$t('table.status')" width="110">
            <template slot-scope="{row}">
              <el-tag :type="row.status | statusFilter">
                {{ row.status | enableStatusNameFilter }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column align="center" :label="$t('table.actions')" width="200">
            <template slot-scope="scope">
              <el-link v-permission="['UPMS_USER_EDIT']" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">{{ $t('btn.edit') }}</el-link>
              <el-link v-permission="['UPMS_USER_DELETE']" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">{{ $t('btn.delete') }}</el-link>
              <el-link v-permission="['UPMS_USER_ROLE']" type="primary" icon="el-icon-menu" @click="handleAuth(scope.row)">{{ $t('user.roles') }}</el-link>
              <el-link v-permission="['UPMS_USER_PASSWORD_INIT']" type="danger" icon="el-icon-refresh" @click="handleInitPwd(scope.row)">{{ $t('user.initPwd') }}</el-link>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="tableA.total>0" :total="tableA.total" :page.sync="tableA.num" :limit.sync="tableA.size" @pagination="getList" />
      </el-col>
    </el-row>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?$t('user.edit'): $t('user.add')">
      <el-form :model="record" label-width="110px" label-position="left">

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.department')" prop="recordDepartments">
              <el-cascader ref="categoryCascader" v-model="recordDepartments" :options="options.departments" :show-all-levels="false" :props="{ checkStrictly: true }" clearable @change="getDepartmentPositions" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.position')" prop="position">
              <el-select v-model="recordPositions" filterable :placeholder="$t('input.tips.select')">
                <el-option
                  v-for="item in options.positions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('user.userId')">
          <el-input v-model="record.userId" :placeholder="$t('user.userId2')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('user.username')">
          <el-input v-model="record.username" :placeholder="$t('input.tips.username')" :disabled="dialogCodeEdit" />
        </el-form-item>
        <el-form-item :label="$t('user.realName')">
          <el-input v-model="record.realName" :placeholder="$t('input.tips.realName')" />
        </el-form-item>
        <el-form-item :label="$t('user.email')">
          <el-input v-model="record.email" :placeholder="$t('user.email')" />
        </el-form-item>
        <el-form-item :label="$t('user.mobilePhone')">
          <el-input v-model="record.mobilePhone" :placeholder="$t('user.mobilePhone')" />
        </el-form-item>
        <el-form-item :label="$t('user.introduction')">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            :placeholder="$t('user.introduction')"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="$t('user.roles')" width="635px" center>
      <div style="text-align:left;margin-bottom: 20px">
        <el-transfer v-model="recordRoles" :data="roles" :titles="[$t('user.roles0'), $t('user.roles1')]" :props="{ key: 'id', label: 'name' }" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitAuth">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialogVisible2=false">{{ $t('btn.cancel') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import waves from '@/directive/waves/index.js' // 水波纹指令

import { handleClipboard2 } from '@/utils/clipboard' // use clipboard directly

import { pageUser, addUser, getUser, editUser, delUser, initPwd, getEnableRoles, getRoles, editRoles } from '@/api/upms/user'
import { treeDepartment, searchDepartmentPositions } from '@/api/upms/department'

export default {
  name: 'UpmsUser',
  directives: {
    waves
  },
  data() {
    return {
      tableA: {
        loading: true,
        num: 1,
        size: 10,
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
      roles: [],
      recordDepartments: [],
      recordPositions: undefined,
      options: { departments: [], positions: [] },
      departmentName: '',
      tableHeight: window.innerHeight - 270
    }
  },
  created() {
    this.getEnableRoles()
    this.getTreeDepartments()
    this.getList()
  },
  methods: {
    getTreeDepartments() {
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.departments = resp.rows
        }
      })
    },
    getDepartmentPositions(val) {
      let did = val
      if (did.length > 1) {
        did = val[val.length - 1]
      }
      this.options.positions = []
      searchDepartmentPositions(did).then(resp => {
        if (resp.success) {
          this.options.positions = resp.rows
        }
      })
    },
    filterDepartments(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleDepartmentClick(data) {
      this.tableA.params.department = data.value
      this.getList()
    },
    async getEnableRoles() {
      const resp = await getEnableRoles()
      if (resp && resp.success) this.roles = resp.rows
    },
    getList() {
      this.tableA.loading = true
      pageUser(this.tableA).then(response => {
        this.tableA.list = response.rows
        this.tableA.total = response.total
      }).finally(() => { this.tableA.loading = false })
    },
    handleAdd() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
      this.recordDepartments = []
      this.options.positions = []
      this.recordPositions = undefined
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
      this.recordDepartments = []
      this.recordPositions = undefined
      getUser(row.id).then(resp => {
        if (resp.success) {
          const duties = resp.rows[0].dutyList
          if (duties) {
            duties.forEach(e => {
              this.recordDepartments = e.department.split(',')
              this.getDepartmentPositions(this.recordDepartments)
              this.recordPositions = Number(e.duty)
            })
          } else {
            this.$message.error('未获取到组织信息')
          }
        }
      })
    },
    handleDel(row) {
      const _this = this
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await delUser(row.id)
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
            _this.$confirm(`初始化成功！ (${resp.rows[0]})`, `[${row.username}]用户密码`, {
              confirmButtonText: '复制',
              cancelButtonText: '关闭',
              callback: action => {
                if (action === 'confirm') {
                  handleClipboard2(resp.rows[0])
                }
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
      this.record.dutyList = []
      if (this.recordDepartments.length > 0) {
        // this.record.departmentId = this.recordDepartments.join(',')
        this.record.dutyList.push({ department: this.recordDepartments.join(','), duty: this.recordPositions })
      }
      // if (this.recordPositions.length > 0) {
      //   this.record.positionId = this.recordPositions.join(',')
      // }
      if (this.dialogType === 'new') {
        resp = await addUser(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editUser(this.record.id, this.record)
      }
      if (resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.username} 成功!`
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
          resp.rows.forEach(e => {
            this.recordRoles.push(e.id)
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
        title: '角色授权' + (resp && resp.success ? '成功!' : '失败...'),
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
.el-tree-node__label {
  font-size: 14px;
}
</style>
