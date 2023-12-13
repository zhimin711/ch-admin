<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="recordPage.params" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="name">
        <el-input
          v-model="recordPage.params.name"
          placeholder="请输入字典名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典代码" prop="code">
        <el-input
          v-model="recordPage.params.code"
          placeholder="请输入字典代码"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="recordPage.params.status"
          placeholder="字典状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <!--<el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_DICT_ADD']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_DICT_EDIT']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate()"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_DICT_DEL']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_DICT_EXPORT']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['UPMS_DICT_CACHE']"
          type="danger"
          icon="el-icon-refresh"
          size="mini"
          @click="handleClearCache"
        >清理缓存</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="recordPage.loading"
      :data="recordPage.list"
      row-key="id"
      lazy
      :load="loadChildren"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
      <el-table-column label="名称" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="代码" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | enableStatusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createAt" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.pid === 0"
            v-permission="['UPMS_DICT_EDIT']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-if="scope.row.pid === 0"
            v-permission="['UPMS_DICT_DEL']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="recordPage.total>0" :total="recordPage.total" :page.sync="recordPage.num" :limit.sync="recordPage.size" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="record" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="record.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典代码" prop="code">
          <el-input v-model="record.code" placeholder="请输入字典代码" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="record.remark" type="textarea" placeholder="请输入内容" />
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
        <el-form-item label="字典数据" style="margin-bottom: 0">
          <el-button size="small" @click="handleAddNode">添加</el-button>
        </el-form-item>
        <el-table
          v-loading="recordNodesLoading"
          :data="recordNodes"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column prop="code" label="代码">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.code" class="edit-input" size="small" placeholder="代码" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.name" class="edit-input" size="small" placeholder="名称" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.sort" class="edit-input" size="small" placeholder="22" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="110">
            <template slot-scope="{row}">
              <el-select v-model="row.status" placeholder="请选择" size="small">
                <el-option key="1" label="开启" value="1" />
                <el-option key="0" label="禁用" value="0" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link v-if="scope.$index>0" type="danger" @click="handleDelNode(scope.$index)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageDict, getDict, delDict, addDict, editDict } from '@/api/upms/dict'
import { deepClone } from '@/utils'
import { isEmpty } from '@/utils/validate'

const defaultRecord = { pid: '0', sort: 1, status: '1' }
const defaultRecordNode = { sort: 1, status: '1' }

export default {
  name: 'UpmsDict', // 用于页面缓存
  dictionary: ['status'],
  data() {
    return {
      // 查询参数与结果
      recordPage: {
        // 遮罩层
        loading: false,
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
      // recordNode: {},
      recordNodesLoading: false,
      recordNodes: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      selectRows: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 字典表格数据
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 表单校验
      rules: {
        name: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '字典代码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    // this.getDicts('sys_normal_disable').then(response => {
    //   this.statusOptions = response.data
    // })
  },
  methods: {
    /** 查询字典代码列表 */
    getList() {
      this.recordPage.loading = true
      this.recordPage.list = []
      // this.recordPage.total = 0
      pageDict(this.recordPage).then(resp => {
        if (resp.success) {
          this.recordPage.list = resp.rows
          this.recordPage.total = resp.total
          if (resp.rows.length > 0) {
            this.recordPage.list.forEach(row => {
              row.hasChildren = true
            })
          }
        }
      }).finally(() => {
        this.recordPage.loading = false
      })
    },
    handleAddNode() {
      const node = Object.assign({}, defaultRecordNode)
      node.sort = this.recordNodes.length + 1
      this.recordNodes.push(node)
    },
    handleDelNode(index) {
      this.recordNodes.splice(index, 1)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.record = Object.assign({}, defaultRecord)
      this.recordNodes = []
      if (this.$refs['form']) this.$refs['form'].resetFields()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.recordPage.num = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      if (this.$refs['queryForm']) this.$refs['queryForm'].resetFields()
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加字典'
      this.handleAddNode()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.selectRows = selection
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.open = true
      this.title = '修改字典'
      const item = row || this.selectRows[0]
      this.record = deepClone(item)
      this.recordStatus = (this.record.status === '1')
      getDict(this.record.id).then(resp => {
        if (resp.success) {
          this.recordNodes = resp.rows[0].children
        }
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          let ok = true
          const msgList = []
          this.recordNodes.forEach((e, i) => {
            if (isEmpty(e.code) || isEmpty(e.name)) {
              msgList.push(`第${i + 1}行代码或名称不能为空`)
              ok = false
            }
          })
          if (!ok) {
            this.$message.error(msgList.join('<br>'))
            return
          }
          this.record.status = this.recordStatus ? '1' : '0'
          this.record.children = this.recordNodes
          if (this.record.id !== undefined) {
            editDict(this.record.id, this.record).then(resp => {
              if (resp.success) {
                this.$message.success('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            addDict(this.record).then(resp => {
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
      const dictIds = row.id || this.ids
      this.$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delDict(dictIds)
      }).then(() => {
        this.$message.success('删除成功')
        this.getList()
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      // const recordPage = this.recordPage
      this.$confirm('是否确认导出所有代码数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        // return exportDict(recordPage)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {})
    },
    /** 清理缓存按钮操作 */
    handleClearCache() {
      // clearCache().then(response => {
      //   if (response.code === 200) {
      //     this.msgSuccess('清理成功')
      //   }
      // })
    },
    loadChildren(tree, treeNode, resolve) {
      getDict(tree.id).then(resp => {
        if (resp.success) {
          resolve(resp.rows[0].children)
        }
      })
    },
    checkSelectable(row) {
      return row.pid === 0
    }
  }
}
</script>
