<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form ref="queryForm" :model="tables.a.params" :inline="true" label-width="180px">
        <el-form-item label="表名称" prop="tableName">
          <el-input
            v-model="tables.a.params.tableName"
            placeholder="请输入表名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="字段名称" prop="columnName">
          <el-input
            v-model="tables.a.params.columnName"
            placeholder="请输入字段名称"
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
      <el-table-column label="系统代码" prop="sysCode" />
      <el-table-column label="上级ID" prop="dsId" />
      <el-table-column label="表名称" prop="tableName" />
      <el-table-column label="字段名称" prop="columnName" />
      <el-table-column label="类型" prop="type" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="备注" prop="originRemark" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="创建时间" align="center" prop="createAt" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createBy" />
      <el-table-column label="更新时间" align="center" prop="updateAt" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.updateAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新人" prop="updateBy" />
      <el-table-column align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="{row}">
          <el-button v-permission="'SysTableColumnRemarkEdit'" type="text" @click.native="handleEdit(row)">{{ $t('btn.edit') }}</el-button>
          <el-button v-permission="'SysTableColumnRemarkDelete'" type="text" @click.native="handleDel(row)">{{ $t('btn.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="tables.a.total>0" :total="tables.a.total" :page.sync="tables.a.page" :limit.sync="tables.a.limit" />

    <!-- 添加或修改业务-数据库列备注对话框 -->
    <el-dialog :visible.sync="dialogs.a.visible" :title="dialogs.a.type==='edit'?'修改业务-数据库列备注':'创建业务-数据库列备注'">
      <el-form ref="form" :model="record" :rules="rules" label-width="100px" label-position="left">
        <el-form-item label="系统代码" prop="sysCode">
          <el-input v-model="record.sysCode" placeholder="请输入系统代码" />
        </el-form-item>
        <el-form-item label="上级ID" prop="dsId">
          <el-input-number v-model="record.dsId" placeholder="请输入上级ID" />
        </el-form-item>
        <el-form-item label="表名称" prop="tableName">
          <el-input v-model="record.tableName" placeholder="请输入表名称" />
        </el-form-item>
        <el-form-item label="字段名称" prop="columnName">
          <el-input v-model="record.columnName" placeholder="请输入字段名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="record.type" placeholder="请选择类型">
            <el-option
              v-for="dict in options.type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="originRemark">
          <el-input v-model="record.originRemark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="状态：0.失效 1.生效 2.删除" prop="status">
          <el-select v-model="record.status" placeholder="请选择状态：0.失效 1.生效 2.删除">
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
import { pageTableColumnRemark, addTableColumnRemark, editTableColumnRemark, delTableColumnRemark } from '@/api/sys/IaaS/table-column-remark'

const defaultRecord = {
  sysCode: null,
  dsId: null,
  tableName: null,
  columnName: null,
  type: null,
  remark: null,
  originRemark: null,
  status: 0
}
export default {
  name: 'TableColumnRemark',
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
        // 类型
        type: [],
        // 状态：0.失效 1.生效 2.删除
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
      pageTableColumnRemark(this.tables.a).then(resp => {
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
          await delTableColumnRemark(row.id)
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
        resp = await addTableColumnRemark(this.record)
      } else if (this.dialogs.a.type === 'edit') {
        opName = '修改'
        resp = await editTableColumnRemark(this.record.id, this.record)
      }
      if (resp.success) {
        this.dialogs.a.visible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.username} 成功!`
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
