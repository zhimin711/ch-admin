<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form ref="queryForm" :model="tables.a.params" :inline="true" label-width="120px">
        <el-form-item label="代码" prop="code">
          <el-input
            v-model="tables.a.params.code"
            placeholder="请输入代码"
            clearable
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="tables.a.params.name"
            placeholder="请输入名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="tables.a.params.status" placeholder="请选择状态" clearable>
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
          <el-button v-permission="'SysTenantAdd'" icon="el-icon-plus" @click="handleAdd">{{ $t('btn.add') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="tables.a.loading"
      :data="tables.a.data"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="代码" prop="code" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="所属部门" prop="department" />
      <el-table-column label="负责人" prop="manager" />
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="描述" prop="description" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="创建时间" align="center" prop="createAt" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="150">
        <template slot-scope="{row}">
          <el-button v-permission="'SysTenantEdit'" type="text" @click.native="handleEdit(row)">{{ $t('btn.edit') }}</el-button>
          <el-button v-permission="'SysTenantDelete'" type="text" @click.native="handleDel(row)">{{ $t('btn.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="tables.a.total>0" :total="tables.a.total" :page.sync="tables.a.page" :limit.sync="tables.a.limit" @pagination="handleSearch" />

    <!-- 添加或修改业务-租户对话框 -->
    <el-dialog :visible.sync="dialogs.a.visible" :title="dialogs.a.type==='edit'?'修改业务-租户':'创建业务-租户'">
      <el-form ref="form" :model="record" :rules="rules" label-width="100px" label-position="left">
        <el-form-item label="代码" prop="code">
          <el-input v-model="record.code" placeholder="请输入代码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="所属部门" prop="department">
          <el-input v-model="record.department" placeholder="请输入所属部门" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="record.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="record.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="record.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.confirm') }}</el-button>
        <el-button @click="handleCancel">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageTenant, addTenant, editTenant, delTenant } from '@/api/upms/tenant'

const defaultRecord = {
  code: null,
  name: null,
  department: null,
  manager: null,
  sort: null,
  description: null,
  status: 0,
  deleted: 0
}
export default {
  name: 'UpmsTenant1',
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
      list: {
        loading: false
      },
      options: {
        loading: false,
        // 状态：0.失效 1.生效
        status: []
      },
      rules: {

      }
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
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
      // if (this.recordDepartments.length > 0) {
      // this.record.departmentId = this.recordDepartments.join(',')
      // }
      if (this.dialogs.a.type === 'new') {
        resp = await addTenant(this.record)
      } else if (this.dialogs.a.type === 'edit') {
        opName = '修改'
        resp = await editTenant(this.record)
      }
      if (resp.success) {
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
