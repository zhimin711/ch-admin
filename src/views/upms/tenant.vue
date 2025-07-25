<template>
  <div class="app-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-form ref="queryForm" :model="tables.a.params" :inline="true" label-width="80px" class="filter-form">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="tables.a.params.name"
            placeholder="请输入租户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="tables.a.params.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option
              v-for="dict in options.status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">{{ $t('btn.search') }}</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">{{ $t('btn.reset') }}</el-button>
          <el-button v-permission="'UPMS_TENANT_ADD'" type="success" icon="el-icon-plus" @click="handleAdd">{{ $t('btn.add') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="tables.a.loading"
        :data="tables.a.data"
        border
        fit
        highlight-current-row
        class="tenant-table"
      >
        <el-table-column label="所属部门" prop="departmentName" min-width="120" />
        <el-table-column label="名称" prop="name" min-width="150" />
        <el-table-column label="负责人" prop="manager" width="120" />
        <el-table-column label="排序" prop="sort" width="80" align="center" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter" size="medium">
              {{ row.status | enableStatusNameFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createAt" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150" fixed="right">
          <template slot-scope="{row}">
            <el-button
              v-permission="'UPMS_TENANT_EDIT'"
              type="text"
              size="small"
              @click.native="handleEdit(row)"
            >
              {{ $t('btn.edit') }}
            </el-button>
            <el-button
              v-permission="'UPMS_TENANT_DELETE'"
              type="text"
              size="small"
              @click.native="handleDel(row)"
            >
              {{ $t('btn.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <pagination
          v-show="tables.a.total>0"
          :total="tables.a.total"
          :page.sync="tables.a.page"
          :limit.sync="tables.a.limit"
          @pagination="handleSearch"
        />
      </div>
    </div>

    <!-- 添加或修改业务-租户对话框 -->
    <el-dialog
      :visible.sync="dialogs.a.visible"
      :title="dialogs.a.type==='edit'?'修改租户':'创建租户'"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="record" :rules="rules" label-width="100px" label-position="left">
        <el-form-item :label="$t('user.department')" prop="recordDepartments">
          <el-cascader ref="categoryCascader" v-model="recordDepartments" :options="options.departments" :show-all-levels="false" :props="{ checkStrictly: true }" clearable />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" placeholder="请输入名称(默认部门名称)" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="record.manager" placeholder="请输入负责人(默认部门负责人)" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="record.sort" placeholder="请输入排序" />
        </el-form-item>
        <!--<el-form-item label="描述" prop="description">
          <el-input v-model="record.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>-->
        <el-form-item label="状态" prop="status">
          <el-select v-model="record.status" placeholder="请选择状态">
            <el-option
              v-for="dict in options.status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageTenant, addTenant, editTenant, delTenant } from '@/api/upms/tenant'
import { treeDepartment } from '@/api/upms/department'

const defaultRecord = {
  code: null,
  name: null,
  departmentId: null,
  manager: null,
  sort: 1,
  description: null,
  status: '1'
}
export default {
  name: 'UpmsTenant',
  data() {
    return {
      tables: {
        a: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        }
      },
      dialogs: {
        a: {
          loading: false,
          visible: false,
          title: '',
          type: ''
        }
      },
      record: Object.assign({}, defaultRecord),
      recordDepartments: [],
      list: {
        loading: false
      },
      options: {
        loading: false,
        departments: [],
        // 状态：0.失效 1.生效
        status: [
          { value: '1', label: '启用' },
          { value: '0', label: '禁用' }
        ]
      },
      rules: {

      }
    }
  },
  created() {
    this.handleSearch()
    this.getTreeDepartments()
  },
  methods: {
    getTreeDepartments() {
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.departments = resp.rows
        }
      })
    },
    handleSearch() {
      this.tables.a.loading = true
      pageTenant(this.tables.a).then(resp => {
        if (resp.success) {
          this.tables.a.data = resp.rows
          this.tables.a.total = resp.total
        }
      }).finally(() => { this.tables.a.loading = false })
    },
    handleReset() {
      this.tables.a.params = Object.assign({}, defaultRecord)
    },
    handleAdd() {
      this.record = Object.assign({}, defaultRecord)
      this.dialogs.a.visible = true
      this.dialogs.a.type = 'new'
    },
    handleEdit(row) {
      this.record = Object.assign({}, row)
      this.recordDepartments = []
      this.recordDepartments = row.departmentId.split(',')
      this.dialogs.a.visible = true
      this.dialogs.a.type = 'edit'
    },
    handleDel(row) {
      const _this = this
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      })
        .then(async() => {
          await delTenant(row.id)
          _this.handleSearch()
          this.$message({
            type: 'success',
            message: this.$t('message.deleteSuccess')
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'
      // this.record.dutyList = []
      if (this.recordDepartments.length > 0) {
        this.record.departmentId = this.recordDepartments.join(',')
      }
      if (this.dialogs.a.type === 'new') {
        resp = await addTenant(this.record)
      } else if (this.dialogs.a.type === 'edit') {
        opName = '修改'
        resp = await editTenant(this.record)
      }
      if (resp && resp.success) {
        this.dialogs.a.visible = false
        this.$message({
          type: 'success',
          message: `${opName} 成功!`
        })
        _this.handleSearch()
      }
    },
    handleCancel() {
      this.dialogs.a.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  // 搜索过滤区域
  .filter-container {
    margin-bottom: 20px;
    padding: 20px 5px 0px 5px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .filter-form {
      .el-form-item {
        margin-bottom: 16px;
        margin-right: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  // 数据表格区域
  .table-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .tenant-table {
      ::v-deep .el-table__header-wrapper {
        .el-table__header {
          th {
            background: #f5f7fa;
            color: #606266;
            font-weight: 600;
          }
        }
      }

      ::v-deep .el-table__body-wrapper {
        .el-table__body {
          tr {
            &:hover {
              background: #f5f7fa;
            }
          }
        }
      }
    }

    .pagination-wrapper {
      padding: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;

    .filter-container {
      padding: 16px;

      .filter-form {
        .el-form-item {
          margin-right: 0;
          margin-bottom: 12px;

          .el-input,
          .el-select {
            width: 100% !important;
          }
        }
      }
    }
  }
}
</style>
