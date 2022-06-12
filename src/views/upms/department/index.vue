<template>
  <div style="height: 100%;width: 100%;overflow:hidden">
    <el-card class="box-card">
      <div class="clearfix">
        <span>组织结构</span>
        <el-button style="float: right; padding: 3px 0" type="text" :loading="loading" @click="getDepartmentData">{{ $t('btn.refresh') }}</el-button>
      </div>
      <div class=" department-outer">
        <div class="zoom-box">
          <zoom-controller v-model="zoom" :min="20" :max="200" />
        </div>
        <div class="view-box">
          <org-view
            v-if="data"
            :data="data"
            :zoom-handled="zoomHandled"
            @on-menu-click="handleMenuClick"
          />
        </div>
      </div>
    </el-card>
    <!-- 添加或修改组织对话框 -->
    <el-dialog :title="dialogType === 'add'? '添加组织':'修改组织'" :visible.sync="dialogVisible" width="600px" append-to-body>
      <el-form ref="recordForm" :model="record" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="record.parentId !== '0'" :span="24">
            <el-form-item label="上级组织" prop="recordParents">
              <el-cascader
                ref="parentCascader"
                v-model="recordParents"
                :options="options.parents"
                :show-all-levels="false"
                :props="recordParentsProps"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="组织类型">
              <el-radio-group v-model="record.deptType">
                <el-radio-button label="0">集团</el-radio-button>
                <el-radio-button label="1">公司</el-radio-button>
                <el-radio-button label="2">部门</el-radio-button>
                <el-radio-button label="3">团队</el-radio-button>
                <!--                <el-radio-button label="4">小组</el-radio-button>-->
              </el-radio-group>
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
            <el-form-item label="组织排序" prop="sort">
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
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
        <el-button @click="cancelRecord">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPositions" :title="'分配组织职位'" width="635px" center>
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
        <el-button type="primary" @click="submitPositions">保存</el-button>
        <el-button type="danger" @click="dialogPositions=false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import OrgView from './components/org-view.vue'
import ZoomController from './components/zoom-controller.vue'
import {
  treeDepartment,
  getDepartment,
  addDepartment,
  editDepartment,
  delDepartment,
  getDepartmentPositions,
  editDepartmentPositions
} from '@/api/upms/department'
import { searchPosition } from '@/api/upms/position'
import './index.less'
import { findUserList } from '@/api/upms/user'
import { isEmpty } from '@/utils/validate'

const defaultRecord = {
  name: '',
  deptType: '2',
  leader: '',
  phone: '',
  email: '',
  sort: 1,
  status: '1'
}
export default {
  name: 'UpmsDepartment1',
  components: {
    OrgView,
    ZoomController
  },
  data() {
    return {
      loading: false,
      loadingModal: false,
      data: null,
      title: '',
      zoom: 100,
      tableData: [],
      positions: [],
      positionValues: [],
      positionModal: false,
      listStyle: {
        width: '200px',
        height: '300px'
      },
      dialogType: 'add',
      dialogVisible: false,
      recordParents: [],
      recordParentsProps: { checkStrictly: true },
      disabledProps: {
        parent: false
      },
      record: {},
      dialogPositions: false,
      recordPositions: [],
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
      },
      recordStatus: false,
      options: {
        parents: [],
        positions: []
      },
      values: {
        parent: [],
        label: []
      }
    }
  },
  computed: {
    zoomHandled() {
      return this.zoom / 100
    }
  },
  mounted() {
    this.getDepartmentData()
    this.getUserList()
  },
  methods: {
    getUserList() {
      findUserList('').then(resp => {
        if (resp.success) {
          this.options.users = resp.rows
        }
      })
    },
    searchPositions(query, item) {
      if (isEmpty(query)) return true
      return item.label.indexOf(query) > -1
    },
    async handlePosition(row) {
      //
      this.dialogPositions = true
      this.record = { id: row.value, label: row.label }
      await searchPosition().then(resp => {
        if (resp.success) {
          this.options.positions = resp.rows
        }
      })
      await getDepartmentPositions(this.record.id).then(resp => {
        if (resp.success) {
          this.recordPositions = resp.rows.map(item => {
            return item.id + ''
          })
        }
      })
    },
    submitPositions() {
      editDepartmentPositions(this.record.id, this.recordPositions).then(resp => {
        this.dialogPositions = !resp.success
        this.$notify({
          title: '分配职位' + (resp.success ? '成功!' : '失败'),
          dangerouslyUseHTMLString: true,
          type: resp.success ? 'success' : 'error'
        })
      })
    },
    setDepartmentData(data) {
      data.isRoot = true
      return data
    },
    handleMenuClick({ data, key }) {
      this.disabledProps.parent = data.isRoot || false
      if (key === 'delete') {
        if (data.children && data.children.length > 0) {
          this.$message.warning('存在下级部门不允许删除，请先删除下级部门！')
        } else {
          this.handleDelete(data)
        }
        return
      } else if (key === 'post') {
        this.handlePosition(data)
        return
      }
      this.values.parent = []
      const sort = data.children ? (data.children.length + 1) : 1
      const _that = this
      getDepartment(data.value).then(resp => {
        if (resp.success) {
          const row = resp.rows[0]
          _that.values.parent = row.parentId === '0' ? [] : row.parentId.split(',').map(id => Number(id))
          if (key === 'new') {
            _that.handleAdd(row)
            _that.record.pid = row.id
            _that.record.sort = sort
            _that.values.parent.push((row.id))
          } else if (key === 'edit') {
            _that.handleEdit(row)
          }
        }
      })
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      if (row && row.deptType === 3) {
        this.$message.error('团队不允许添加下级')
        return
      }
      this.dialogType = 'add'
      this.dialogVisible = true
      this.resetRecordForm()
      this.recordParents = []
      if (row) {
        this.record.parentId = (row.parentId !== '0' ? (row.parentId + ',') : '') + row.id
        this.recordParents = this.record.parentId.split(',')
      }
      this.recordStatus = true
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.parents = resp.rows
        }
      })
    },
    handleEdit(row) {
      this.dialogVisible = true
      this.dialogType = 'edit'
      this.record = row
      this.recordParents = []
      if (this.record.pid && this.record.parentId !== '0') this.recordParents = this.record.parentId.split(',')
      this.recordStatus = (this.record.status === '1')
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.parents = resp.rows
        }
      })
    },
    cancelRecord() {
      this.dialogVisible = false
      this.resetRecordForm()
    },
    // 表单重置
    resetRecordForm() {
      this.record = Object.assign({}, defaultRecord)
      if (this.$refs['recordForm']) this.$refs['recordForm'].resetFields()
    },
    /** 提交按钮 */
    handleSubmit() {
      this.$refs['recordForm'].validate(valid => {
        if (valid) {
          if (this.record.pid !== 0 && this.recordParents.length === 0) {
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
                this.cancelRecord()
                this.getDepartmentData()
              }
            })
          } else {
            addDepartment(this.record).then(resp => {
              if (resp.success) {
                this.$message.success('新增成功')
                this.cancelRecord()
                this.getDepartmentData()
              }
            })
          }
        }
      })
    },
    getDetail(id) {
      // getDepartment(id)
    },
    handleDelete(row) {
      this.$confirm('删除不可恢复，是否继续?', '' + this.$t('label.tip'), {
        confirmButtonText: this.$t('btn._confirm'),
        cancelButtonText: this.$t('btn._cancel'),
        type: 'warning'
      })
        .then(async() => {
          delDepartment(row.value).then(resp => {
            if (resp.success) {
              this.$message.success(`删除部门 [${row.label}] 成功！`)
              this.getDepartmentData()
            }
          })
        })
        .catch(() => {})
    },
    parentFormat(label) {
      this.values.label = label
      return label.join('/')
    },
    getParents() {
      treeDepartment(2).then(resp => {
        const { rows } = resp
        this.options.parent = rows
      })
    },
    getDepartmentData() {
      treeDepartment(1).then(resp => {
        if (resp.success) {
          this.data = resp.rows[0]
        }
      })
    }
  }
}
</script>

<style lang="less">
  .ivu-transfer-list-with-footer{
    padding-bottom: 0;
  }
</style>
