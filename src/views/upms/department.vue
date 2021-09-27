<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item :label="$t('label.name')">
        <el-input
          v-model="tableA.params.deptName"
          placeholder="请输入组织名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('label.status')">
        <el-select v-model="tableA.params.status" :placeholder="$t('label.status')" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >{{ $t('btn.search') }}</el-button>
        <el-button
          v-permission="['UPMS_DEPARTMENT_ADD']"
          class="filter-item"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >{{ $t('btn.add') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="tableA.loading"
      :data="tableA.list"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" :label="$t('label.name')" width="260" />
      <el-table-column prop="sort" :label="$t('label.sort')" width="200" />
      <el-table-column :label="$t('label.status')" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | enableStatusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.createTime')" align="center" prop="createAt" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.actions')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['UPMS_DEPARTMENT_EDIT']"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >{{ $t('btn.edit') }}</el-button>
          <el-button
            v-permission="['UPMS_DEPARTMENT_ADD']"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >{{ $t('department.addChild') }}</el-button>
          <el-button
            v-permission="['UPMS_DEPARTMENT_POSITIONS']"
            type="text"
            icon="el-icon-menu"
            @click="handlePosition(scope.row)"
          >{{ $t('department.positions') }}</el-button>
          <el-button
            v-if="scope.row.pid !== 0"
            v-permission="['UPMS_DEPARTMENT_DEL']"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >{{ $t('btn.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改组织对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="record" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="record.pid !== '0'" :span="24">
            <el-form-item label="上级组织" prop="recordParents">
              <el-cascader ref="parentCascader" v-model="recordParents" :options="options.parents" :show-all-levels="false" :props="recordParentsProps" clearable />
              <!--<treeselect v-model="record.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级组织" />-->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组织名称" prop="name">
              <el-input v-model="record.name" placeholder="请输入组织名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <!--              <el-input v-model="record.leader" placeholder="请输入负责人" maxlength="20" />-->

              <el-select v-model="record.leader" filterable :placeholder="$t('input.tips.select')">
                <el-option
                  v-for="item in options.users"
                  :key="item.username"
                  :label="item.realName"
                  :value="item.username"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="record.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="record.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number v-model="record.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch
                v-model="recordStatus"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="开启"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('btn.save') }}</el-button>
        <el-button @click="cancel">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'分配组织职位'" width="635px" center>
      <div style="text-align:left;margin-bottom: 20px">
        <el-transfer
          v-model="recordPositions"
          filterable
          :filter-method="searchPositions"
          filter-placeholder="请输入职位名称"
          :data="options.positions"
          :titles="['未分配职位', '已分配职位']"
          :props="{ key: 'value', label: 'label' }"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitPositions">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { pageDepartment, delDepartment, addDepartment, editDepartment, treeDepartment, getDepartmentPositions, editDepartmentPositions } from '@/api/upms/department'
import { searchPosition } from '@/api/upms/position'
import { findUserList } from '@/api/upms/user'

const defaultRecord = { pid: '0', sort: 1, status: '1' }

export default {
  name: 'UpmsDepartment',
  // components: { Treeselect },
  data() {
    return {
      // 查询参数与结果
      tableA: {
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
      recordParents: [],
      recordParentsProps: { checkStrictly: true },
      recordPositions: [],
      // 表格树数据
      options: { parents: [], positions: [], users: [] },
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      dialogVisible2: false,
      // 状态数据字典
      statusOptions: [],
      // 表单校验
      rules: {
        pid: [
          { required: true, message: '上级组织不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '组织名称不能为空', trigger: 'blur' }
        ],
        leader: [
          { required: true, message: '负责人不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          // { required: true, message: '手机号码不能为空' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
  },
  methods: {
    /** 查询组织列表 */
    getList() {
      this.tableA.loading = true
      pageDepartment(this.tableA).then(response => {
        this.tableA.list = response.rows
        this.tableA.total = response.total
      }).finally(() => { this.tableA.loading = false })
    },
    getUserList() {
      findUserList('').then(resp => {
        if (resp.success) {
          this.options.users = resp.rows
        }
      })
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
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.open = true
      this.title = '添加组织'
      this.reset()
      this.recordParents = []
      if (row) {
        this.record.pid = (row.pid !== '0' ? (row.pid + ',') : '') + row.id
        this.recordParents = this.record.pid.split(',')
      }
      this.recordStatus = true
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.parents = resp.rows
        }
      })
    },
    async handlePosition(row) {
      //
      this.dialogVisible2 = true
      this.record = deepClone(row)
      await searchPosition().then(resp => {
        if (resp.success) {
          this.options.positions = resp.rows
        }
      })
      await getDepartmentPositions(row.id).then(resp => {
        if (resp.success) {
          this.recordPositions = resp.rows.map(item => {
            return item.id + ''
          })
        }
      })
    },
    searchPositions(query, item) {
      if (isEmpty(query)) return true
      return item.label.indexOf(query) > -1
    },
    async handleSubmitPositions() {
      const resp = await editDepartmentPositions(this.record.id, this.recordPositions)
      if (resp && resp.success) {
        this.dialogVisible2 = false
      }
      this.$notify({
        title: '分配职位' + (resp && resp.success ? '成功!' : '失败'),
        dangerouslyUseHTMLString: true,
        type: resp && resp.success ? 'success' : 'error'
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      // this.reset()
      this.open = true
      this.title = '修改组织'
      this.record = deepClone(row)
      this.recordParents = []
      if (this.record.pid && this.record.pid !== '0') this.recordParents = this.record.pid.split(',')
      this.recordStatus = (this.record.status === '1')
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.parents = resp.rows
        }
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.record.pid !== '0' && this.recordParents.length === 0) {
            this.$message.error('上级组织不能为空')
            return false
          } else if (this.recordParents.length > 0) {
            this.record.pid = this.recordParents[this.recordParents.length - 1]
            this.record.parentId = this.recordParents.join(',')
            const checkedNodes = this.$refs['parentCascader'].getCheckedNodes()
            if (checkedNodes && checkedNodes.length > 0) {
              this.record.parentName = ''
              checkedNodes.forEach(item => {
                this.record.parentName += item.label
              })
            }
          }
          this.record.status = this.recordStatus ? '1' : '0'
          if (this.record.id > 0) {
            editDepartment(this.record.id, this.record).then(resp => {
              if (resp.success) {
                this.$message.success('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            addDepartment(this.record).then(resp => {
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
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delDepartment(row.id)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(function() {})
    }
  }
}
</script>
