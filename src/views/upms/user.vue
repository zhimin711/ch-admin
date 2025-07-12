<template>
  <div class="app-container">

    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="5" :xs="24">
        <el-card class="department-card" shadow="never">
          <div slot="header" class="department-header">
            <span class="department-title">
              <i class="el-icon-office-building" />
              部门管理
            </span>
          </div>
          <div class="department-search">
            <el-input
              v-model="departmentName"
              :placeholder="$t('input.tips.departmentName')"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              @clear="clearDepartmentFilter"
            />
          </div>
          <div class="department-tree">
            <el-tree
              ref="tree"
              :data="options.departments"
              :expand-on-click-node="false"
              :filter-node-method="filterDepartments"
              :props="{ children: 'children', label: 'label' }"
              default-expand-all
              node-key="value"
              highlight-current
              @node-click="handleDepartmentClick"
            >
              <span slot-scope="{ node }" class="custom-tree-node">
                <i v-if="!node.isLeaf" class="el-icon-folder" />
                <i v-else class="el-icon-document" />
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>
      <!--用户数据-->
      <el-col :span="19" :xs="24">
        <!-- 搜索筛选区域 -->
        <div class="search-filter-container">
          <el-card class="filter-card" shadow="never">
            <div slot="header" class="filter-header">
              <span class="filter-title">
                <i class="el-icon-search" />
                用户筛选
              </span>
              <div class="filter-actions">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-refresh"
                  :disabled="tableA.loading"
                  @click="resetFilters"
                >
                  重置
                </el-button>
              </div>
            </div>

            <div class="filter-content">
              <el-row :gutter="15">
                <el-col :span="6">
                  <div class="filter-item-wrapper">
                    <label class="filter-label">用户ID</label>
                    <el-input
                      v-model="tableA.params.userId"
                      :placeholder="$t('input.tips.userId')"
                      class="filter-input"
                      clearable
                      @keyup.enter.native="getList"
                      @clear="getList"
                    >
                      <i slot="prefix" class="el-input__icon el-icon-user" />
                    </el-input>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="filter-item-wrapper">
                    <label class="filter-label">用户名</label>
                    <el-input
                      v-model="tableA.params.username"
                      :placeholder="$t('input.tips.username')"
                      class="filter-input"
                      clearable
                      @keyup.enter.native="getList"
                      @clear="getList"
                    >
                      <i slot="prefix" class="el-input__icon el-icon-user-solid" />
                    </el-input>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="filter-item-wrapper">
                    <label class="filter-label">真实姓名</label>
                    <el-input
                      v-model="tableA.params.realName"
                      :placeholder="$t('input.tips.realName')"
                      class="filter-input"
                      clearable
                      @keyup.enter.native="getList"
                      @clear="getList"
                    >
                      <i slot="prefix" class="el-input__icon el-icon-edit-outline" />
                    </el-input>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="filter-item-wrapper">
                    <label class="filter-label">状态</label>
                    <el-select
                      v-model="tableA.params.status"
                      :placeholder="$t('label.status')"
                      class="filter-select"
                      clearable
                      @change="getList"
                    >
                      <el-option :label="$t('label.enable')" value="1">
                        <span style="float: left">
                          <i class="el-icon-success" style="color: #67C23A; margin-right: 5px;" />
                          {{ $t('label.enable') }}
                        </span>
                      </el-option>
                      <el-option :label="$t('label.disable')" value="0">
                        <span style="float: left">
                          <i class="el-icon-error" style="color: #F56C6C; margin-right: 5px;" />
                          {{ $t('label.disable') }}
                        </span>
                      </el-option>
                    </el-select>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-container">
          <el-button
            v-permission="['UPMS_USER_ADD']"
            type="primary"
            icon="el-icon-plus"
            class="action-btn"
            @click="handleAdd"
          >
            {{ $t('user.add') }}
          </el-button>
        </div>
        <el-table :loading="tableA.loading" :data="tableA.list" border fit highlight-current-row style="width: 100%">
          <el-table-column width="180px" :label="$t('user.department')" prop="department">
            <template slot-scope="{row}">
              <span><el-tag v-if="row.department==='1'">附属部门</el-tag>{{ row.departmentName }}</span>
            </template>
          </el-table-column>
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

          <el-table-column align="center" :label="$t('table.actions')" width="200" fixed="right">
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
      <el-form :model="record" :rules="rules" label-width="110px" label-position="left">

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
        <el-form-item label="附属部门">
          <el-button type="primary" @click="handleAddNode()">
            添加
          </el-button>
        </el-form-item>
        <el-table
          :data="currDeptList"
          border
          size="mini"
          style="width: 100%; margin-bottom: 20px;"
        >
          <el-table-column prop="departmentName" label="部门" />
          <el-table-column prop="dutyName" label="职位" width="180" />
          <el-table-column align="center" label="操作" width="100">
            <template slot-scope="scope">
              <el-link type="danger" @click="handleDelNode(scope.$index)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        <el-form-item :label="$t('user.userId')">
          <el-input v-model="record.userId" :placeholder="$t('user.userId2')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('user.username')" prop="username">
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
        <el-button :loading="loadingSave" type="primary" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="$t('user.roles')" width="635px" center>
      <div style="text-align:left;margin-bottom: 20px">
        <el-transfer v-model="recordRoles" :data="roles" :titles="[$t('user.roles0'), $t('user.roles1')]" :props="{ key: 'id', label: 'name' }" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loadingSave" type="primary" @click="handleSubmitAuth">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialogVisible2=false">{{ $t('btn.cancel') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="dialogDeptVisible" title="添加附属部门" width="635px" center>
      <div style="text-align:left;margin-bottom: 20px">
        <el-form>
          <el-row>
            <el-col :span="12">
              <el-form-item :label="$t('user.department')">
                <el-cascader
                  ref="categoryCascader2"
                  v-model="recordDepartments2"
                  :options="options.departments"
                  :show-all-levels="false"
                  :props="{ checkStrictly: true }"
                  clearable
                  @change="getDepartmentPositions2"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('user.position')">
                <el-select v-model="recordPositions2" filterable :placeholder="$t('input.tips.select')">
                  <el-option
                    v-for="item in options.positions2"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleAddDept">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialogDeptVisible=false">{{ $t('btn.cancel') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { containtSpecial } from '@/utils/validate'
import waves from '@/directive/waves/index' // 水波纹指令

import { handleClipboard2 } from '@/utils/clipboard' // use clipboard directly

import { pageUser, addUser, getUser, editUser, delUser, initPwd, getEnableRoles, getRoles, editRoles } from '@/api/upms/user'
import { treeDepartment, searchDepartmentPositions } from '@/api/upms/department'

export default {
  name: 'UpmsUser',
  directives: {
    waves
  },
  data() {
    const validateSpecial = (rule, value, callback) => {
      if (containtSpecial(value)) {
        callback(new Error('不能含有特殊字符'))
      } else {
        callback()
      }
    }
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
      loadingSave: false,
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      dialogDeptVisible: false,
      roles: [],
      currDeptList: [],
      recordDepartments: [],
      recordDepartments2: [],
      recordPositions: undefined,
      recordPositions2: undefined,
      options: { departments: [], positions: [], positions2: [] },
      departmentName: '',
      rules: {
        username: [
          { required: true, validator: validateSpecial, trigger: 'blur' }
        ]
      },
      tableHeight: window.innerHeight - 270
    }
  },
  watch: {
    departmentName(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getEnableRoles()
    this.getTreeDepartments()
    this.getList()
  },
  methods: {
    handleAddNode() {
      this.dialogDeptVisible = true
    },
    handleAddDept() {
      if (this.recordDepartments2.length > 0 && this.recordPositions2) {
        const deptName = this.getDeptNames()
        const dutyName = this.options.positions2.find(item => item.id === this.recordPositions2).name
        this.currDeptList.push({ department: this.recordDepartments2.join(','), departmentName: deptName, duty: this.recordPositions2, dutyName: dutyName })
        this.dialogDeptVisible = false
      } else {
        this.$message.error('请选择部门和职位...')
      }
    },
    getDeptNames() {
      // return list.find(item => item.id === i)
      const arr = []
      const names = []
      for (let i = 0; i < this.recordDepartments2.length; i++) {
        let r
        if (i === 0) r = this.options.departments.find(item => item.value === this.recordDepartments2[i])
        else {
          r = arr[i - 1].children.find(item => item.value === this.recordDepartments2[i])
        }
        arr.push(r)
        names.push(r.label)
      }
      return names.join(',')
    },
    handleDelNode(index) {
      this.currDeptList.splice(index, 1)
    },
    getTreeDepartments() {
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.departments = resp.rows
        }
      })
    },
    getDepartmentPositions(val) {
      if (val === '' || val.length === 0) {
        this.options.positions = []
        return
      }
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
    getDepartmentPositions2(val) {
      if (val === '' || val.length === 0) {
        this.options.positions2 = []
        this.recordPositions2 = undefined
        return
      }
      let did = val
      if (did.length > 1) {
        did = val[val.length - 1]
      }
      this.options.positions2 = []
      this.recordPositions2 = undefined
      searchDepartmentPositions(did).then(resp => {
        if (resp.success) {
          this.options.positions2 = resp.rows
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
      this.currDeptList = []
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
      this.recordDepartments = []
      this.recordPositions = row.positionId
      getUser(row.id).then(resp => {
        this.currDeptList = []
        if (resp.success) {
          const duties = resp.rows[0].dutyList
          if (duties) {
            duties.forEach(e => {
              const orgId = e.orgId || e.department
              if (row.departmentId !== orgId && this.record.positionId !== e.duty) {
                this.currDeptList.push(e)
              }
              this.recordDepartments = orgId.split(',')
              this.getDepartmentPositions(this.recordDepartments)
              // this.recordPositions = Number(e.duty)
            })
          } else {
            this.$message.error('未获取到组织信息')
          }
        }
      })
    },
    handleDel(row) {
      const _this = this
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      })
        .then(async() => {
          await delUser(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: this.$t('message.deleteSuccess')
          })
        })
        .catch(err => { console.error(err) })
    },
    handleInitPwd(row) {
      const _this = this
      _this.$confirm(`请确认是否初始化用户[${row.username}]密码，操作不可回退?`, '', {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      })
        .then(async() => {
          const resp = await initPwd(row.id)
          if (resp.success) {
            _this.$confirm(`初始化成功！ (${resp.rows[0]})`, `[${row.username}]用户密码`, {
              confirmButtonText: this.$t('btn.copy'),
              cancelButtonText: this.$t('btn.close'),
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
        this.record.departmentId = this.recordDepartments.join(',')
        this.record.positionId = this.recordPositions
        this.record.dutyList.push({ department: this.recordDepartments.join(','), duty: this.recordPositions })
      }
      if (this.currDeptList.length > 0) {
        this.currDeptList.forEach(item => {
          this.record.dutyList.push(item)
        })
      }
      this.loadingSave = true
      if (this.dialogType === 'new') {
        resp = await addUser(this.record).finally(() => { this.loadingSave = false })
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editUser(this.record.id, this.record).finally(() => { this.loadingSave = false })
      }
      if (resp && resp.success) {
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
      this.loadingSave = true
      const resp = await editRoles(this.record.id, this.recordRoles).finally(() => { this.loadingSave = false })
      if (resp && resp.success) {
        this.dialogVisible2 = false
      }
      this.$notify({
        title: '角色授权' + (resp && resp.success ? '成功!' : '失败...'),
        type: resp && resp.success ? 'success' : 'error'
      })
    },

    // 重置筛选条件
    resetFilters() {
      this.tableA.params = {}
      this.getList()
    },

    // 清除部门筛选
    clearDepartmentFilter() {
      this.departmentName = ''
      this.$refs.tree.filter('')
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

/* 部门卡片样式 */
.department-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.department-card .el-card__header {
  padding: 12px 15px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.department-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.department-title i {
  margin-right: 5px;
  color: #409eff;
}

.department-search {
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.department-tree {
  padding: 10px;
  height: calc(100vh - 320px);
  overflow-y: auto;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.custom-tree-node i {
  margin-right: 5px;
  color: #909399;
}

.custom-tree-node .el-icon-folder {
  color: #e6a23c;
}

.custom-tree-node .el-icon-document {
  color: #409eff;
}

/* 搜索筛选区域样式 */
.search-filter-container {
  margin-bottom: 15px;
}

.filter-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-card .el-card__header {
  padding: 8px 15px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.filter-title i {
  margin-right: 5px;
  color: #409eff;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.filter-content {
  padding: 0px;
}

.filter-item-wrapper {
  margin-bottom: 8px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.filter-input,
.filter-select {
  width: 100%;
}

.filter-input .el-input__inner,
.filter-select .el-input__inner {
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
}

/* 操作按钮区域样式 */
.action-container {
  margin-bottom: 15px;
  padding: 10px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  border-radius: 4px;
  font-weight: 500;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

.el-tree-node__label {
  font-size: 14px;
}
</style>
