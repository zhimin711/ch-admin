<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-permission="['UPMS_PROJECT_PAGE_SEARCH']" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-permission="'UPMS_PROJECT_ADD'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加项目
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="所属部门" prop="departmentName" />
      <el-table-column label="租户" prop="tenantName" />
      <el-table-column label="项目代码">
        <template slot-scope="scope">
          <span v-if="scope.row.parentCode">{{ scope.row.parentCode + ':' + scope.row.code }}</span>
          <span v-else>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
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
          <el-link v-permission="['UPMS_PROJECT_NAMESPACES_EDIT']" type="primary" icon="el-icon-menu" @click="handleProjectNamespaces(scope.row)">分配空间</el-link>
          <el-link v-permission="['UPMS_PROJECT_EDIT']" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-permission="['UPMS_PROJECT_DEL']" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改 项目':'添加 项目'">
      <el-form :model="record" :rules="rules" label-width="80px" label-position="left">
        <!--<el-form-item label="归属部门">
          <el-cascader ref="deptCascader" v-model="recordDepartments" :options="options.departments" :show-all-levels="false" :props="{ checkStrictly: true }" clearable />
        </el-form-item>-->

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.department')" prop="recordDepartments">
              <el-cascader ref="deptCascader" v-model="recordDepartments" :options="options.departments" :show-all-levels="false" :props="{ checkStrictly: true }" clearable @change="getDepartmentTenants" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户" prop="tenantId">
              <el-select v-model="record.tenantId" filterable :placeholder="$t('input.tips.select')" @change="changeTenant">
                <el-option
                  v-for="item in options.tenants"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="代码">
          <el-input v-model="record.code" placeholder="项目代码" :disabled="dialogCodeEdit">
            <template v-if="recordParents.length>0" slot="prepend">{{ record.parentCode }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="record.name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="record.manager" placeholder="负责人" />
        </el-form-item>
        <el-form-item label="开发用户">
          <el-input v-model="record.dev" placeholder="开发用户" />
        </el-form-item>
        <el-form-item label="测试用户">
          <el-input v-model="record.test" placeholder="测试用户" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="record.sort" placeholder="排序" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="项目 描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="开启"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'分配空间'" width="635px">
      <div style="text-align:left;margin-bottom: 20px">
        <el-transfer
          v-model="recordNamespaces"
          filterable
          :filter-method="filterNamespacesMethod"
          filter-placeholder="请输入空间"
          :data="options.namespaces"
          :titles="['未分配空间', '已分配空间']"
          :props="{ key: 'value', label: 'label' }"
        />
      </div>
      <div style="text-align:left;padding-left:220px">
        <el-button type="primary" @click="handleSubmitNamespaces">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { add, del, edit, editProjectNamespaces, getProjectNamespaces, getUsers, list } from '@/api/upms/project'
import { treeDepartment, getDepartmentTenants } from '@/api/upms/department'
import { getAvailableList } from '@/api/upms/namespace'

export default {
  name: 'UpmsProject1',
  filters: {
    statusFilter(type) {
      return ['待审核', '正常', '远程终端(SSH)', '(FTP)'][type]
    }
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
      recordStatus: true,
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      recordParents: [],
      recordDepartments: [],
      recordUsers: [],
      recordNamespaces: [],
      recordTenant: '',
      options: {
        tenants: [],
        parents: [],
        departments: [],
        users: []
      },
      rules: {
        // recordDepartments: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
        tenantId: [{ required: true, message: '租户不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getTreeDepartments()
    this.getNamespaces()
    // this.getUsers()
  },
  methods: {
    getTreeDepartments() {
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.departments = resp.rows
        }
      })
    },
    getDepartmentTenants(val) {
      this.options.tenants = []
      if (val.length <= 0) {
        return
      }
      getDepartmentTenants(val[val.length - 1]).then(resp => {
        if (resp.success) {
          this.options.tenants = resp.rows
        }
      })
    },
    async getNamespaces(s) {
      const resp = await getAvailableList(s || '')
      if (resp && resp.success) this.options.namespaces = resp.rows
    },
    async getUsers() {
      const resp = await getUsers()
      if (resp && resp.success) this.options.users = resp.rows
    },
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleAdd() {
      this.record = {}
      this.recordStatus = true
      this.recordParents = []
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
      this.recordStatus = (this.record.status === '1')
      this.recordParents = []
      if (this.record.parentCode) {
        this.recordParents = [this.record.parentCode]
      }
      this.recordDepartments = []
      if (row.department) {
        this.recordDepartments = row.department.split(',')
        this.getDepartmentTenants(this.recordDepartments)
      }
      // if (row.tenantId) this.getDepartmentTenants([row.tenantId])
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
      this.record.status = '0'
      if (this.recordStatus) {
        this.record.status = '1'
      }
      if (this.recordDepartments.length > 0) {
        this.record.department = this.recordDepartments.join(',')
      }
      if (this.dialogType === 'new') {
        resp = await add(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await edit(this.record.id, this.record)
      }
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} 项目 ${this.record.name} success!`
        })
        _this.getList()
      }
    },
    handleProjectNamespaces(row) {
      //
      this.dialogVisible2 = true

      this.record = deepClone(row)
      this.recordUsers = []
      getProjectNamespaces(row.id).then(resp => {
        if (resp.success) {
          resp.rows.forEach(e => {
            this.recordNamespaces.push(e)
          })
        }
      })
    },
    async handleSubmitNamespaces() {
      const resp = await editProjectNamespaces(this.record.id, this.recordNamespaces)
      if (resp && resp.success) {
        this.dialogVisible2 = false
      }
      this.$notify({
        title: '授权空间',
        dangerouslyUseHTMLString: true,
        message: `授权空间 ` + (resp && resp.success ? 'success!' : 'error...'),
        type: resp && resp.success ? 'success' : 'error'
      })
    },
    filterNamespacesMethod(query, item) {
      if (query === '') return true
      return item.label.indexOf(query) > -1
    },
    changeParent(val) {
      this.record.parentCode = ''
      if (val.length > 0) {
        this.record.parentCode = val[0]
        let obj = {}
        obj = this.options.parents.find((item) => {
          return item.value === val[0]
        })
        this.record.parentName = obj.label
      }
    },
    changeTenant(val) {
      this.record.tenantName = ''
      if (val) {
        const tenant = this.options.tenants.find(item => item.id === val)
        this.record.tenantName = tenant.name
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
