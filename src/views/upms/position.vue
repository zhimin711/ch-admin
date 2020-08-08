<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="recordPage.params" :inline="true" label-width="68px">
      <el-form-item label="职位编码" prop="code">
        <el-input
          v-model="recordPage.params.code"
          placeholder="请输入职位编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="职位名称" prop="name">
        <el-input
          v-model="recordPage.params.name"
          placeholder="请输入职位名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="recordPage.params.status" placeholder="职位状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_POSITION_ADD']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_POSITION_EDIT']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_POSITION_DEL']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_POSITION_EXPORT']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="recordPage.loading" :data="recordPage.list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="职位编码" align="center" prop="code" />
      <el-table-column label="职位名称" align="center" prop="name" />
      <el-table-column label="职位排序" align="center" prop="sort" />
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | enableStatusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createAt" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['UPMS_POSITION_EDIT']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-permission="['UPMS_POSITION_DEL']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="recordPage.total>0" :total="recordPage.total" :page.sync="recordPage.num" :limit.sync="recordPage.size" @pagination="getList" />

    <!-- 添加或修改职位对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="record" :rules="rules" label-width="80px">
        <el-form-item label="职位名称" prop="name">
          <el-input v-model="record.name" placeholder="请输入职位名称" />
        </el-form-item>
        <el-form-item label="职位编码" prop="code">
          <el-input v-model="record.code" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="职位顺序" prop="sort">
          <el-input-number v-model="record.sort" controls-position="right" :min="0" />
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
        <el-form-item label="备注" prop="remark">
          <el-input v-model="record.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pagePosition, delPosition, addPosition, editPosition } from '@/api/upms/position'

import { deepClone } from '@/utils'

const defaultRecord = { pid: '0', sort: 1, status: '1' }

export default {
  name: 'UMPSPosition',
  data() {
    return {
      // 查询参数与结果
      recordPage: {
        // 遮罩层
        loading: true,
        num: 1,
        size: 10,
        total: 0,
        list: [],
        // 查询参数
        params: {}
      },
      // 表单参数
      record: {},
      // 组织树选项
      recordStatus: true,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 职位表格数据
      postList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 表单校验
      rules: {
        name: [
          { required: true, message: '职位名称不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '职位编码不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '职位顺序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询职位列表 */
    getList() {
      this.recordPage.loading = true
      pagePosition(this.recordPage).then(response => {
        this.recordPage.list = response.rows
        this.recordPage.total = response.total
      }).finally(() => { this.recordPage.loading = false })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.record = Object.assign({}, defaultRecord)

      if (this.$refs['form']) this.$refs['form'].resetFields()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.recordPage.num = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs['queryForm']) this.$refs['queryForm'].resetFields()
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加职位'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.open = true
      this.title = '修改职位'
      this.record = deepClone(row)
      this.recordStatus = (this.record.status === '1')
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.record.status = this.recordStatus ? '1' : '0'
          if (this.record.id !== undefined) {
            editPosition(this.record.id, this.record).then(resp => {
              if (resp.success) {
                this.$message.success('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            addPosition(this.record).then(resp => {
              if (resp.success) {
                this.$message.success('新增成功')
                this.open = false
                this.getList()
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const postIds = row.code || this.ids
      this.$confirm('是否确认删除职位编号为"' + postIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delPosition(postIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有职位数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        // return exportPost(queryParams)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {})
    }
  }
}
</script>
