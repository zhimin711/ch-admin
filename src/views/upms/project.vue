<template>
  <div class="app-container">

    <!-- 筛选区域 -->
    <div class="filter-container">
      <el-form ref="queryForm" :model="listQuery.params" :inline="true" label-width="80px" class="filter-form">
        <el-form-item label="租户" prop="tenantId">
          <el-select
            v-model="listQuery.params.tenantId"
            filterable
            clearable
            :placeholder="$t('input.tips.select')"
            class="filter-select"
            prefix-icon="el-icon-office-building"
            @change="changeTenant"
          >
            <el-option v-for="item in options.tenants2" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input
            v-model="listQuery.params.name"
            placeholder="请输入项目名称"
            class="filter-input"
            prefix-icon="el-icon-s-cooperation"
          />
        </el-form-item>
        <el-form-item class="filter-buttons">
          <el-button
            v-permission="['UPMS_PROJECT_PAGE']"
            type="primary"
            icon="el-icon-search"
            class="search-btn"
            @click="getList"
          >
            查询
          </el-button>
          <el-button
            type="default"
            icon="el-icon-refresh"
            class="reset-btn"
            @click="listQuery.params = {}"
          >
            重置
          </el-button>
          <el-button
            v-permission="'UPMS_PROJECT_ADD'"
            type="success"
            icon="el-icon-plus"
            class="add-btn"
            @click="handleAdd"
          >
            添加项目
          </el-button>
          <el-button
            v-permission="'UPMS_PROJECTS_ADD_MEMBERS'"
            type="warning"
            icon="el-icon-user"
            class="member-btn"
            @click="handleMembers"
          >
            批量添加成员
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        :loading="listLoading"
        :data="listQuery.list"
        border
        fit
        highlight-current-row
        class="project-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="租户" prop="tenantName" min-width="120">
          <template slot-scope="scope">
            <div class="tenant-cell">
              <i class="el-icon-office-building" />
              <span>{{ scope.row.tenantName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" min-width="150">
          <template slot-scope="scope">
            <div class="project-name-cell">
              <i class="el-icon-s-cooperation" />
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="项目代码" min-width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small">
              <i class="el-icon-document" />
              <span v-if="scope.row.parentCode">{{ scope.row.parentCode + ':' + scope.row.code }}</span>
              <span v-else>{{ scope.row.code }}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" prop="manager" width="120">
          <template slot-scope="scope">
            <div class="manager-cell">
              <i class="el-icon-user" />
              <span>{{ scope.row.manager }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" align="center">
          <template slot-scope="scope">
            <el-tag type="warning" size="small">{{ scope.row.sort }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属部门" prop="departmentName" min-width="120">
          <template slot-scope="scope">
            <div class="department-cell">
              <i class="el-icon-s-grid" />
              <span>{{ scope.row.departmentName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-permission="['UPMS_PROJECT_EDIT']"
              type="primary"
              size="mini"
              icon="el-icon-edit"
              class="action-btn edit-btn"
              @click="handleEdit(scope.row, scope.$index)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="['UPMS_PROJECT_DEL']"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              class="action-btn delete-btn"
              @click="handleDel(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <pagination
        v-show="listQuery.total>0"
        :total="listQuery.total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </div>

    <!-- 添加/编辑项目对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'修改项目':'添加项目'"
      width="700px"
      class="project-dialog"
    >
      <el-form :model="record" :rules="rules" label-width="100px" label-position="left" class="project-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('user.department')" prop="recordDepartments">
              <el-cascader
                ref="deptCascader"
                v-model="recordDepartments"
                :options="options.departments"
                :show-all-levels="false"
                :props="{ checkStrictly: true }"
                clearable
                placeholder="请选择所属部门"
                @change="getDepartmentTenants"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户" prop="tenantId">
              <el-select
                v-model="record.tenantId"
                filterable
                placeholder="请选择租户"
                @change="changeTenant"
              >
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

        <el-form-item label="项目代码">
          <el-input
            v-model="record.code"
            placeholder="请输入项目代码"
            :disabled="dialogCodeEdit"
            prefix-icon="el-icon-document"
          >
            <template v-if="recordParents.length>0" slot="prepend">{{ record.parentCode }}</template>
          </el-input>
        </el-form-item>

        <el-form-item label="项目名称">
          <el-input
            v-model="record.name"
            placeholder="请输入项目名称"
            prefix-icon="el-icon-s-cooperation"
          />
        </el-form-item>

        <el-form-item label="负责人">
          <el-select
            v-model="record.manager"
            filterable
            placeholder="请选择负责人"
          >
            <el-option
              v-for="item in options.users"
              :key="item.username"
              :label="item.realName"
              :value="item.username"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开发人员">
          <el-select
            v-model="recordDevUsers"
            class="select-w"
            multiple
            placeholder="请选择开发人员"
            prefix-icon="el-icon-user"
          >
            <el-option
              v-for="item in options.users"
              :key="item.username"
              :label="item.realName"
              :value="item.username"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="测试人员">
          <el-select
            v-model="recordTestUsers"
            class="select-w"
            multiple
            placeholder="请选择测试人员"
            prefix-icon="el-icon-user"
          >
            <el-option
              v-for="item in options.users"
              :key="item.username"
              :label="item.realName"
              :value="item.username"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number
            v-model="record.sort"
            placeholder="请输入排序"
            :min="0"
            controls-position="right"
            class="sort-input"
          />
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 3, maxRows: 6}"
            type="textarea"
            placeholder="请输入项目描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button
          :loading="loadingSave"
          type="primary"
          class="save-btn"
          @click="handleSubmit"
        >
          <i class="el-icon-check" />
          保存
        </el-button>
        <el-button
          type="danger"
          class="cancel-btn"
          @click="dialogVisible=false"
        >
          <i class="el-icon-close" />
          取消
        </el-button>
      </div>
    </el-dialog>

    <!-- 批量添加成员对话框 -->
    <el-dialog
      :visible.sync="dialogMemberVisible"
      title="批量添加项目成员"
      width="600px"
      class="member-dialog"
    >
      <el-form :model="record" :rules="rules" label-width="100px" label-position="left" class="member-form">
        <el-form-item label="开发人员">
          <el-select
            v-model="recordDevUsers"
            class="select-w"
            multiple
            placeholder="请选择开发人员"
            prefix-icon="el-icon-user"
          >
            <el-option
              v-for="item in options.users"
              :key="item.username"
              :label="item.realName"
              :value="item.username"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="测试人员">
          <el-select
            v-model="recordTestUsers"
            class="select-w"
            multiple
            placeholder="请选择测试人员"
            prefix-icon="el-icon-user"
          >
            <el-option
              v-for="item in options.users"
              :key="item.username"
              :label="item.realName"
              :value="item.username"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button
          :loading="loadingSave"
          type="primary"
          class="save-btn"
          @click="handleSubmitUsers"
        >
          <i class="el-icon-check" />
          保存
        </el-button>
        <el-button
          type="danger"
          class="cancel-btn"
          @click="dialogMemberVisible=false"
        >
          <i class="el-icon-close" />
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { addUpmsProject, delUpmsProject, editUpmsProject, getUpmsProject, pageUpmsProject, saveUpmsProjectUsers } from '@/api/upms/project'
import { treeDepartment, getDepartmentTenants } from '@/api/upms/department'
import { findUserList } from '@/api/upms/user'
import { listUpmsTenantAvailable } from '@/api/upms/tenant'

export default {
  name: 'UpmsProject',
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
      loadingSave: false,
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      dialogMemberVisible: false,
      recordParents: [],
      recordDepartments: [],
      recordUsers: [],
      recordDevUsers: [],
      recordTestUsers: [],
      multipleSelection: [],
      recordTenant: '',
      options: {
        tenants: [],
        tenants2: [],
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
    this.listTenantAvailable()
    this.findUsers()
  },
  methods: {
    getTreeDepartments() {
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.departments = resp.rows
        }
      })
    },
    listTenantAvailable() {
      listUpmsTenantAvailable().then(resp => {
        if (resp.success) {
          this.options.tenants2 = resp.rows
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
    findUsers(s = '') {
      findUserList(s).then(resp => {
        if (resp.success) {
          this.options.users = resp.rows
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getList() {
      this.listLoading = true
      pageUpmsProject(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleAdd() {
      this.record = {}
      this.recordStatus = true
      this.recordParents = []
      this.recordDevUsers = []
      this.recordTestUsers = []
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

      getUpmsProject(row.id).then(resp => {
        if (resp.success) {
          this.recordDevUsers = resp.rows[0].devUserIds
          this.recordTestUsers = resp.rows[0].testUserIds
        }
      })
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
          await delUpmsProject(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
          })
        })
        .catch(err => { console.error(err) })
    },
    handleMembers() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择项目，至少选择一个')
        return
      }
      this.recordDevUsers = []
      this.recordTestUsers = []
      this.dialogMemberVisible = true
    },
    handleSubmitUsers() {
      this.loadingSave = true
      const record = {}
      record.projectIds = this.multipleSelection.map(item => item.id)
      if (this.recordDevUsers.length > 0) {
        record.devUserIds = this.recordDevUsers
      }
      if (this.recordTestUsers.length > 0) {
        record.testUserIds = this.recordTestUsers
      }
      saveUpmsProjectUsers(record).then(resp => {
        if (resp.success) {
          this.$message.success('批量添加成功！')
          this.dialogMemberVisible = false
        }
      }).finally(() => { this.loadingSave = false })
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
      if (this.recordDevUsers.length > 0) {
        this.record.devUserIds = this.recordDevUsers
      }
      if (this.recordTestUsers.length > 0) {
        this.record.testUserIds = this.recordTestUsers
      }
      this.loadingSave = true
      if (this.dialogType === 'new') {
        resp = await addUpmsProject(this.record).finally(() => { this.loadingSave = false })
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editUpmsProject(this.record.id, this.record).finally(() => { this.loadingSave = false })
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
      if (val && this.options.tenants && this.options.tenants.length > 0) {
        const tenant = this.options.tenants.find(item => item.id === val)
        if (tenant && tenant.name) {
          this.record.tenantName = tenant.name
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 20px;

  // 页面标题区域
  .page-header {
    margin-bottom: 24px;

    .header-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 24px;
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);

      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;

        i {
          font-size: 28px;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .page-description {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
        line-height: 1.5;
      }
    }
  }

  // 筛选区域
  .filter-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);

    .filter-form {
      .el-form-item {
        margin-bottom: 16px;

        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .filter-select,
        .filter-input {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }
      }

      .filter-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        .search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
        }

        .reset-btn {
          border-radius: 8px;
          padding: 10px 20px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
          }
        }

        .add-btn {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(103, 194, 58, 0.3);
          }
        }

        .member-btn {
          background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(230, 162, 60, 0.3);
          }
        }
      }
    }
  }

  // 表格区域
  .table-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);

    .project-table {
      ::v-deep .el-table__header-wrapper {
        .el-table__header {
          th {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            color: #495057;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
          }
        }
      }

      ::v-deep .el-table__body-wrapper {
        .el-table__body {
          tr {
            transition: all 0.3s;

            &:hover {
              background: rgba(102, 126, 234, 0.05);
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }

      .tenant-cell,
      .project-name-cell,
      .manager-cell,
      .department-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          color: #667eea;
          font-size: 14px;
        }

        span {
          color: #606266;
          font-weight: 500;
        }
      }

      .action-btn {
        margin: 0 4px;
        border-radius: 6px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
        }

        &.edit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;

          &:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }

        &.delete-btn {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          border: none;

          &:hover {
            box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
          }
        }
      }
    }
  }

  // 分页区域
  .pagination-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    // padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
  }

  // 对话框样式
  .project-dialog,
  .member-dialog {
    ::v-deep .el-dialog {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

      .el-dialog__header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;

        .el-dialog__title {
          color: white;
          font-weight: 600;
        }

        .el-dialog__headerbtn {
          .el-dialog__close {
            color: white;

            &:hover {
              color: rgba(255, 255, 255, 0.8);
            }
          }
        }
      }

      .el-dialog__body {
        padding: 24px;
      }
    }

    .project-form,
    .member-form {
      .el-form-item {
        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .el-input {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .el-select {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .sort-input {
          ::v-deep .el-input-number__decrease,
          ::v-deep .el-input-number__increase {
            border-radius: 4px;
          }

          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .el-textarea {
          ::v-deep .el-textarea__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }
      }
    }

    .dialog-footer {
      text-align: right;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
      display: flex;
      gap: 12px;
      justify-content: flex-end;

      .save-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
      }

      .cancel-btn {
        border-radius: 8px;
        padding: 10px 20px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;

    .page-header .header-content {
      padding: 20px;

      .page-title {
        font-size: 20px;
      }

      .page-description {
        font-size: 13px;
      }
    }

    .filter-container {
      padding: 16px;

      .filter-form {
        .filter-buttons {
          flex-direction: column;

          .el-button {
            width: 100%;
          }
        }
      }
    }

    .table-container {
      padding: 16px;
      overflow-x: auto;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-container {
  animation: fadeInUp 0.6s ease-out;

  .page-header,
  .filter-container,
  .table-container,
  .pagination-container {
    animation: fadeInUp 0.6s ease-out;
  }
}

// 修复原有样式
.edit-input {
  padding-right: 100px;
}

.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

::v-deep .select-w .el-input__inner {
  width: 360px;
}
</style>
