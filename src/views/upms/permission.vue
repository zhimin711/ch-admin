<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="tableA.params.code" :placeholder="$t('label.code')" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-input v-model="tableA.params.name" :placeholder="$t('label.name')" style="width: 200px;" class="filter-item" />
      <el-select v-model="tableA.params.status" :placeholder="$t('label.status')" class="filter-item" clearable>
        <el-option :label="$t('label.enable')" value="1" />
        <el-option :label="$t('label.disable')" value="0" />
      </el-select>
      <el-button v-loading="tableA.loading" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        {{ $t('btn.search') }}
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="tableA.params = {}">
        {{ $t('btn.reset') }}
      </el-button>
      <el-button v-permission="['UPMS_PERMISSION_ADD']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        {{ $t('permission.add') }}
      </el-button>
    </div>

    <el-table
      v-loading="tableA.loading"
      :data="tableA.list"
      style="width: 100%;margin-bottom: 20px;"
      :row-key="tableKey"
      border
      lazy
      :load="loadChildren"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column :label="$t('label.name')" prop="name" min-width="220" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="type" :label="$t('label.type')" width="130">
        <template slot-scope="{row}">
          <el-tag v-if="row.type === '1'" type="warning">{{ $t('label.catalog') }}</el-tag>
          <el-tag v-else-if="row.type === '2'" type="success">{{ row.hidden? '['+$t('label.hidden')+']':'' }}{{ $t('label.menu') }}</el-tag>
          <el-tag v-else-if="row.type === '3'" type="primary">{{ $t('label.btn') }}</el-tag>
          <el-tag v-else-if="row.type === '4'" type="danger">授权{{ $t('label.interface') }}</el-tag>
          <el-tag v-else-if="row.type === '5'" type="info">开放{{ $t('label.interface') }}{{ row.hidden? '[用户]':'' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.code')" prop="code" min-width="280" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.address')" min-width="280" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <el-tag v-if="row.type === '3' || row.type === '4' || row.type === '5'">{{ row.method || 'ALL' }}</el-tag>
          <span v-if="row.type === '3' || row.type === '4' || row.type === '5'">{{ row.url }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('label.icon')" width="70">
        <template slot-scope="{row}">
          <!--<i v-if="row.icon" :class="row.icon" />-->
          <svg-icon v-if="row.icon" :icon-class="row.icon" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sort" :label="$t('label.status')" width="69" />
      <el-table-column align="center" prop="status" :label="$t('label.status')" width="69">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | enableStatusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('label.actions')" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="['UPMS_PERMISSION_EDIT']" type="text" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">
            {{ $t('btn.edit') }}
          </el-button>
          <el-link v-permission="['UPMS_PERMISSION_COPY']" type="success" icon="el-icon-document-copy" @click="handleCopy(scope.row)">{{ $t('btn.copy') }}</el-link>
          <el-link v-permission="['UPMS_PERMISSION_DELETE']" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">{{ $t('btn.delete') }}</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="tableA.total>0" :total="tableA.total" :page.sync="tableA.num" :limit.sync="tableA.size" @pagination="getList(0)" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?$t('permission.edit'): $t('permission.add')" :close-on-click-modal="false">
      <el-form ref="baseForm" :model="record" :rules="rules" label-width="100px">
        <el-form-item :label="$t('label.type')">
          <el-radio-group v-model="record.type" @change="changeType">
            <el-radio-button label="1">{{ $t('label.catalog') }}</el-radio-button>
            <el-radio-button label="2">{{ $t('label.menu') }}</el-radio-button>
            <el-radio-button label="3">{{ $t('label.btn') }}</el-radio-button>
            <el-radio-button label="4">授权{{ $t('label.interface') }}</el-radio-button>
            <el-radio-button label="5">开放{{ $t('label.interface') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('label.parent')">
          <el-cascader ref="categoryCascader" v-model="recordParents" :options="options.parents" :show-all-levels="false" :props="recordParentsProps" clearable />
          <el-icon v-show="dialogLoadingVisible" class="el-icon-loading" />
        </el-form-item>
        <el-form-item :label="$t('label.code')" prop="code">
          <el-input v-model="record.code" :disabled="recordForm.codeDisabled" placeholder="目录或菜单代码需与前端路由一致" />
        </el-form-item>
        <el-form-item :label="$t('label.name')" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item v-if="record.type === '1' || record.type === '2'" :label="$t('label.icon')" prop="icon">
          <!--<el-input v-model="record.icon" placeholder="仅支持SVG" />-->
          <icon-selector v-model="record.icon" />
        </el-form-item>
        <el-form-item v-if="record.type === '3' || record.type === '4' || record.type === '5'" :label="$t('label.address')">
          <el-input v-model="record.url" placeholder="按钮或接口必填" />
        </el-form-item>
        <!--<el-form-item v-show="recordForm.redirectShow" label="重定向地址">
          <el-input v-model="record.redirect" placeholder="目录与隐藏地址" />
        </el-form-item>-->
        <el-form-item v-if="record.type === '3' || record.type === '4' || record.type === '5'" :label="$t('label.method')">
          <el-radio-group :key="'method-' + record.id" v-model="methodValue">
            <el-radio-button label="">ALL</el-radio-button>
            <el-radio-button label="GET" />
            <el-radio-button label="POST" />
            <el-radio-button label="PUT" />
            <el-radio-button label="DELETE" />
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="record.type === '4'" :label="recordHiddenName[record.type]">
          <el-radio v-model="record.hidden" :label="true">角色</el-radio>
          <el-radio v-model="record.hidden" :label="false">授权码</el-radio>
        </el-form-item>
        <el-form-item v-if="record.type === '2' || record.type === '5'" :label="recordHiddenName[record.type]">
          <!--<el-radio v-model="record.hidden" :label="false">{{ record.type === '2'?'否':'是' }}</el-radio>
          <el-radio v-model="record.hidden" :label="true">{{ record.type === '2'?'是':'否' }}</el-radio>-->
          <el-radio v-model="record.hidden" :label="false">否</el-radio>
          <el-radio v-model="record.hidden" :label="true">是</el-radio>
        </el-form-item>
        <el-form-item v-if="record.hidden && (record.type === '3' || record.type === '5')" label="Cookie访问">
          <el-radio v-model="record.enableCookie" :label="false">否</el-radio>
          <el-radio v-model="record.enableCookie" :label="true">是</el-radio>
        </el-form-item>
        <el-form-item :label="$t('label.sort')">
          <el-input-number v-model="record.sort" />
        </el-form-item>
        <el-form-item :label="$t('label.status')">
          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-text="$t('label.enable')"
            :inactive-text="$t('label.disable')"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" :loading="dialogLoading" @click="dialogVisible = false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import IconSelector from '@/components/IconSelector'
import { deepClone } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { treePermission, pagePermission, addPermission, editPermission, delPermission, getPermissionChildren } from '@/api/upms/permission'

const defaultRecord = {
  type: '1',
  code: '',
  sort: 1,
  hidden: false,
  name: '',
  method: ''
}
export default {
  name: 'UpmsPermission',
  components: { IconSelector },
  data() {
    return {
      recordHiddenName: {
        '2': '是否隐藏',
        '4': '授权类型',
        '5': '需用户登录'
      },
      treeData1: [],
      tableA: {
        loading: true,
        num: 1,
        size: 10,
        total: 0,
        list: [],
        params: {}
      },
      expandData: {},
      isRefreshExpand: false,
      origRecord: null,
      record: {},
      recordType: '',
      recordStatus: true,
      recordParents: [],
      recordParentsProps: {
        checkStrictly: false
      },
      recordForm: {
        codeDisabled: false,
        descDisabled: false,
        redirectShow: false,
        urlDisabled: false
      },
      dialogVisible: false,
      dialogType: false,
      dialogLoadingVisible: false,
      dialogLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '权限代码不能为空' },
          {
            pattern: /^[A-Za-z0-9_]+$/,
            message: '请输入正确的权限代码',
            trigger: 'blur'
          }
        ]
      },
      options: {
        parents: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getTree(type) {
      // this.options.parents = []
      this.dialogLoadingVisible = true
      treePermission(type).then(response => {
        this.dialogLoadingVisible = false
        this.options.parents = response.rows

        if (this.record.parentId && this.recordType === type) {
          // this.recordParents = this.record.parentId.split(',')
          // console.log(this.recordParents)
        }
      })
    },
    handleNodeClick(data) {
      console.log(data)
      // this.getList()
    },
    tableKey(row) {
      return row.parentId + ',' + row.id
    },
    async loadChildren(tree, treeNode, resolve) {
      // const isExpanded = this.expandData[tree.id] !== undefined
      const params = {
        id: tree.id,
        parentId: tree.parentId,
        code: this.tableA.params.code,
        name: this.tableA.params.name,
        status: this.tableA.params.status
      }
      await getPermissionChildren(params).then(resp => {
        if (resp.success) {
          // if (isExpanded) debugger
          resolve(resp.rows)
          this.expandData[tree.id] = {}
          this.expandData[tree.id].row = tree
          // this.expandData[tree.id].node = treeNode
          this.expandData[tree.id].resolve = resolve
        }
      })
    },
    getList(op) {
      if (op === 0) this.expandData = {}
      this.tableA.loading = true
      pagePermission(this.tableA).then(response => {
        this.tableA.list = response.rows
        this.tableA.total = response.total
        if (this.isRefreshExpand) {
          this.refreshExpand()
        }
      }).finally(() => { this.tableA.loading = false })
    },
    refreshExpand() {
      this.isRefreshExpand = false
      const pids = new Set()
      let pidStr = '0'
      if (this.origRecord) {
        pidStr = this.origRecord.parentId
      }
      if (this.record.parentId) {
        pidStr += ',' + this.record.parentId
      }
      const pidArr = pidStr.split(',')
      // pidArr.reverse()
      pidArr.forEach(async(pid) => {
        if (!pids.has(pid) && this.expandData[pid]) {
          pids.add(pid)
          await this.loadChildren(this.expandData[pid].row, this.expandData[pid].node, this.expandData[pid].resolve)
        }
      })
    },
    handleAdd() {
      this.getTree('1')
      this.origRecord = null
      this.record = Object.assign({}, defaultRecord)
      this.recordStatus = true
      this.recordParents = []
      this.dialogType = 'new'
      this.dialogVisible = true
      this.recordForm.codeDisabled = false
      this.recordForm.urlDisabled = false
      this.recordForm.descDisabled = true
      this.recordForm.redirectShow = true

      this.$nextTick(() => {
        this.$refs['baseForm'].clearValidate()
      })
    },
    handleEdit(row, index) {
      this.origRecord = Object.assign({}, row)
      this.record = deepClone(row)
      if (this.record.method === null || this.record.method === undefined) {
        this.record.method = ''
      }
      this.recordType = row.type
      this.recordParents = this.record.parentId.split(',')
      if (this.record.parentId === '0') this.record.parentId = undefined
      this.recordStatus = (this.record.status === '1')
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.changeType(row.type)
    },
    handleCopy(row, index) {
      this.origRecord = null
      this.record = deepClone(row)
      this.record.id = null
      this.record.sort += 1
      if (this.record.method === null || this.record.method === undefined) {
        this.record.method = ''
      }
      this.recordType = row.type
      this.recordParents = this.record.parentId.split(',')
      if (this.record.parentId === '0') this.record.parentId = undefined
      this.recordStatus = (this.record.status === '1')
      this.dialogType = 'copy'
      this.dialogVisible = true
      this.changeType(row.type)
    },
    handleDel(row) {
      const _this = this
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      })
        .then(async() => {
          await delPermission(row.id).then(resp => {
            if (resp.success) {
              this.origRecord = Object.assign({}, row)
              this.record = Object.assign({}, defaultRecord)
              this.isRefreshExpand = true
              _this.getList()
              this.$message({
                type: 'success',
                message: this.$t('message.deleteSuccess')
              })
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      // this.record = {}
      if ((this.record.type === '3' || this.record.type === '4') && isEmpty(this.record.url)) {
        this.$message.error(`地址不能为空!`)
        return
      } /* else if ((this.record.type === '1' || this.record.type === '2') && !validAlphabetsAndNumber(this.record.url)) {
        this.$message.error(`地址格式错误，目录或菜单地址只能是字母数字!`)
        return
      }*/
      // this.isRefreshExpand = false
      if (this.recordParents.length > 0) {
        this.record.parentId = this.recordParents.join(',')
      } else {
        this.record.parentId = null
      }
      this.record.status = '0'
      if (this.recordStatus) {
        this.record.status = '1'
      }
      let resp = null
      let opName = '添加'
      this.dialogLoading = true
      if (this.dialogType === 'new' || this.dialogType === 'copy') {
        resp = await addPermission(this.record).finally(() => { this.dialogLoading = false })
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        this.record.children = []
        resp = await editPermission(this.record.id, this.record).finally(() => { this.dialogLoading = false })
      }
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.name} 成功!`
        })
        this.isRefreshExpand = true
        _this.getList()
      }
    },
    changeType(value) {
      let type = value
      this.recordForm.urlDisabled = value <= 1
      this.recordForm.descDisabled = true
      this.recordForm.redirectShow = value === '1'
      this.recordParentsProps.checkStrictly = false
      if (value === '4' || value === '5') {
        type = '3'
        this.record.method = 'GET'
      } else if (value === '3') {
        this.recordForm.descDisabled = false
      } else if (value === '2') {
        this.recordParentsProps.checkStrictly = true
      }
      this.getTree(type)
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
