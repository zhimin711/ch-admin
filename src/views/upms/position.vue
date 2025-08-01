<template>
  <div class="app-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-form ref="queryForm" :model="recordPage.params" :inline="true" label-width="80px" class="filter-form">
        <el-form-item label="职位编码" prop="code">
          <el-input
            v-model="recordPage.params.code"
            placeholder="请输入职位编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="职位名称" prop="name">
          <el-input
            v-model="recordPage.params.name"
            placeholder="请输入职位名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="recordPage.params.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option
              v-for="dict in dict.type.status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
          <el-button v-permission="['UPMS_POSITION_ADD']" type="success" icon="el-icon-plus" @click="handleAdd">{{ $t('btn.add') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="recordPage.loading"
        :data="recordPage.list"
        border
        fit
        highlight-current-row
        class="position-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="职位编码" align="center" prop="code" min-width="120" />
        <el-table-column label="职位名称" align="center" prop="name" min-width="150" />
        <el-table-column label="职位排序" align="center" prop="sort" width="100" />
        <el-table-column label="状态" align="center" width="100">
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
              v-permission="['UPMS_POSITION_EDIT']"
              type="text"
              size="small"
              @click.native="handleUpdate(row)"
            >
              {{ $t('btn.edit') }}
            </el-button>
            <el-button
              v-permission="['UPMS_POSITION_DEL']"
              type="text"
              size="small"
              @click.native="handleDelete(row)"
            >
              {{ $t('btn.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <pagination
          v-show="recordPage.total>0"
          :total="recordPage.total"
          :page.sync="recordPage.num"
          :limit.sync="recordPage.size"
          @pagination="getList"
        />
      </div>
    </div>

    <!-- 添加或修改职位对话框 -->
    <el-dialog
      :visible.sync="open"
      :title="title"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form ref="form" :model="record" :rules="rules" label-width="100px" label-position="left">
        <el-form-item label="职位名称" prop="name">
          <el-input v-model="record.name" placeholder="请输入职位名称" />
        </el-form-item>
        <el-form-item label="职位编码" prop="code">
          <el-input v-model="record.code" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="职位顺序" prop="sort">
          <el-input-number v-model="record.sort" controls-position="right" :min="0" style="width: 100%" />
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
        <el-form-item label="备注" prop="remark">
          <el-input v-model="record.remark" type="textarea" placeholder="请输入内容" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pagePosition, delPosition, addPosition, editPosition } from '@/api/upms/position'
import { deepClone } from '@/utils'

const defaultRecord = { pid: '0', sort: 1, status: '1' }

export default {
  name: 'UpmsPosition',
  dictionary: ['status'],
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

    .position-table {
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
