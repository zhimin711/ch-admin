<template>
  <div class="app-container">
    <!-- 搜索筛选区域 -->
    <div class="search-filter-container">
      <el-card class="filter-card" shadow="never">
        <div slot="header" class="filter-header">
          <span class="filter-title">
            <i class="el-icon-search" />
            搜索筛选
          </span>
          <div class="filter-actions">
            <el-button
              type="text"
              size="small"
              icon="el-icon-refresh"
              :disabled="tableA.loading"
              class="header-btn"
              @click="resetFilters"
            >
              重置
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-arrow-up"
              class="header-btn"
              @click="toggleFilterCollapse"
            >
              {{ filterCollapsed ? '展开' : '收起' }}
            </el-button>
          </div>
        </div>

        <div v-show="!filterCollapsed" class="filter-content">
          <div class="filter-row">
            <div class="filter-item">
              <el-input
                v-model="tableA.params.code"
                :placeholder="$t('label.code')"
                class="filter-input"
                clearable
                @keyup.enter.native="getList"
                @clear="getList"
              >
                <i slot="prefix" class="el-input__icon el-icon-document" />
              </el-input>
            </div>
            <div class="filter-item">
              <el-input
                v-model="tableA.params.name"
                :placeholder="$t('label.name')"
                class="filter-input"
                clearable
                @keyup.enter.native="getList"
                @clear="getList"
              >
                <i slot="prefix" class="el-input__icon el-icon-edit-outline" />
              </el-input>
            </div>
            <div class="filter-item">
              <el-select
                v-model="tableA.params.status"
                :placeholder="$t('label.status')"
                class="filter-select"
                clearable
                @change="getList"
              >
                <el-option :label="$t('label.enable')" value="1">
                  <span style="float: left">
                    <i class="el-icon-success" style="color: #67C23A; margin-right: 5px;" />
                    {{ $t('label.enable') }}
                  </span>
                </el-option>
                <el-option :label="$t('label.disable')" value="0">
                  <span style="float: left">
                    <i class="el-icon-error" style="color: #F56C6C; margin-right: 5px;" />
                    {{ $t('label.disable') }}
                  </span>
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <el-button
                v-loading="tableA.loading"
                type="primary"
                icon="el-icon-search"
                class="search-btn"
                @click="getList"
              >
                {{ $t('btn.search') }}
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-container">
      <el-button
        v-permission="['UPMS_PERMISSION_ADD']"
        type="primary"
        icon="el-icon-plus"
        class="action-btn"
        @click="handleAdd"
      >
        {{ $t('permission.add') }}
      </el-button>
      <el-button
        v-permission="['UPMS_PERMISSION_ADD']"
        type="success"
        icon="el-icon-download"
        class="action-btn"
        @click="handleImportInterface"
      >
        {{ $t('permission.importInterface') }}
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
          <el-radio-group v-model="record.method">
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

    <!-- 导入接口对话框 -->
    <el-dialog :visible.sync="importDialogVisible" :title="$t('permission.importInterface')" width="800px" :close-on-click-modal="false" class="import-dialog">
      <!-- 第一步：选择接口 -->
      <div v-if="importStep === 1">
        <el-steps :active="1" finish-status="success" simple style="margin-bottom: 20px;">
          <el-step title="选择接口" />
          <el-step title="配置权限" />
        </el-steps>

        <el-form :model="importForm" label-width="100px">
          <el-form-item label="选择项目">
            <el-select v-model="importForm.projectId" placeholder="请选择项目" style="width: 100%;" @change="handleProjectChange">
              <el-option
                v-for="item in importOptions.projects"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="选择模块">
            <el-select v-model="importForm.moduleId" placeholder="请选择模块" style="width: 100%;" :disabled="!importForm.projectId" @change="handleModuleChange">
              <el-option
                v-for="item in importOptions.modules"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="选择接口">
            <el-select
              v-model="importForm.interfaceId"
              placeholder="请选择接口"
              style="width: 100%;"
              :disabled="!importForm.moduleId"
              @change="handleInterfaceChange"
            >
              <el-option
                v-for="item in importOptions.interfaces"
                :key="item.code"
                :label="`${item.name} (${item.method} ${item.url})`"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div style="text-align: right; margin-top: 20px;">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="!importForm.interfaceId || !importPermissionRecord.name || !importPermissionRecord.url"
            @click="nextStep"
          >
            下一步
          </el-button>
        </div>
      </div>

      <!-- 第二步：配置权限 -->
      <div v-if="importStep === 2">
        <el-steps :active="2" finish-status="success" simple style="margin-bottom: 20px;">
          <el-step title="选择接口" />
          <el-step title="配置权限" />
        </el-steps>

        <el-form ref="importPermissionForm" :model="importPermissionRecord" :rules="importRules" label-width="100px">
          <el-form-item :label="$t('label.type')">
            <el-radio-group v-model="importPermissionRecord.type" @change="changeImportType">
              <el-radio-button label="3">{{ $t('label.btn') }}</el-radio-button>
              <el-radio-button label="4">授权{{ $t('label.interface') }}</el-radio-button>
              <el-radio-button label="5">开放{{ $t('label.interface') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('label.parent')">
            <el-cascader ref="importCategoryCascader" v-model="importRecordParents" :options="options.parents" :show-all-levels="false" :props="recordParentsProps" clearable />
            <el-icon v-show="dialogLoadingVisible" class="el-icon-loading" />
          </el-form-item>

          <el-form-item :label="$t('label.code')" prop="code">
            <el-input v-model="importPermissionRecord.code" placeholder="权限代码" />
          </el-form-item>

          <el-form-item :label="$t('label.name')" prop="name">
            <el-input v-model="importPermissionRecord.name" />
          </el-form-item>

          <el-form-item :label="$t('label.address')">
            <el-input v-model="importPermissionRecord.url" :disabled="true" placeholder="接口地址" />
          </el-form-item>

          <el-form-item :label="$t('label.method')">
            <el-input v-model="importPermissionRecord.method" :disabled="true" placeholder="请求方法" />
          </el-form-item>

          <el-form-item v-if="importPermissionRecord.type === '4'" :label="recordHiddenName[importPermissionRecord.type]">
            <el-radio v-model="importPermissionRecord.hidden" :label="true">角色</el-radio>
            <el-radio v-model="importPermissionRecord.hidden" :label="false">授权码</el-radio>
          </el-form-item>

          <el-form-item v-if="importPermissionRecord.type === '5'" :label="recordHiddenName[importPermissionRecord.type]">
            <el-radio v-model="importPermissionRecord.hidden" :label="false">否</el-radio>
            <el-radio v-model="importPermissionRecord.hidden" :label="true">是</el-radio>
          </el-form-item>

          <el-form-item v-if="importPermissionRecord.hidden && importPermissionRecord.type === '5'" label="Cookie访问">
            <el-radio v-model="importPermissionRecord.enableCookie" :label="false">否</el-radio>
            <el-radio v-model="importPermissionRecord.enableCookie" :label="true">是</el-radio>
          </el-form-item>

          <el-form-item :label="$t('label.sort')">
            <el-input-number v-model="importPermissionRecord.sort" />
          </el-form-item>
        </el-form>

        <div style="text-align: right; margin-top: 20px;">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" :loading="importDialogLoading" @click="handleImportSubmit">保存</el-button>
          <el-button @click="importDialogVisible = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import IconSelector from '@/components/IconSelector'
import { deepClone } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { treePermission, pagePermission, addPermission, editPermission, delPermission, getPermissionChildren } from '@/api/upms/permission'
import { getProjects, getModules, getInterfaces } from '@/api/upms/interface'

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
      },
      // 导入接口相关数据
      importDialogVisible: false,
      importStep: 1,
      importDialogLoading: false,
      importForm: {
        projectId: null,
        moduleId: null,
        interfaceId: null
      },
      importOptions: {
        projects: [],
        modules: [],
        interfaces: []
      },
      importPermissionRecord: {
        type: '3',
        code: '',
        sort: 1,
        hidden: false,
        name: '',
        method: '',
        url: '',
        enableCookie: false
      },
      importRecordParents: [],
      importRules: {
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
      // 筛选相关
      filterCollapsed: false
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
    // 重置筛选条件
    resetFilters() {
      this.tableA.params = {}
      this.getList()
    },
    // 切换筛选区域展开/收起
    toggleFilterCollapse() {
      this.filterCollapsed = !this.filterCollapsed
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
        this.record.hidden = value === '4'
      } else if (value === '3') {
        this.recordForm.descDisabled = false
      } else if (value === '2') {
        this.recordParentsProps.checkStrictly = true
      }
      this.getTree(type)
    },

    // 导入接口相关方法
    handleImportInterface() {
      this.importDialogVisible = true
      this.importStep = 1
      this.resetImportForm()
      this.loadProjects()

      // 确保在对话框打开后清除验证错误
      this.$nextTick(() => {
        if (this.$refs['importPermissionForm']) {
          this.$refs['importPermissionForm'].clearValidate()
        }
      })
    },

    resetImportForm() {
      this.importForm = {
        projectId: null,
        moduleId: null,
        interfaceId: null
      }
      this.importOptions.modules = []
      this.importOptions.interfaces = []
      this.importPermissionRecord = {
        type: '3',
        code: '',
        sort: 1,
        hidden: false,
        name: '',
        method: '',
        url: '',
        enableCookie: false
      }
      this.importRecordParents = []

      // 清除表单验证错误
      this.$nextTick(() => {
        if (this.$refs['importPermissionForm']) {
          this.$refs['importPermissionForm'].clearValidate()
        }
      })
    },

    async loadProjects() {
      try {
        const response = await getProjects()
        if (response.success) {
          this.importOptions.projects = response.rows || []
        }
      } catch (error) {
        console.error('加载项目列表失败:', error)
        this.$message.error('加载项目列表失败')
      }
    },

    async handleProjectChange(projectId) {
      this.importForm.moduleId = null
      this.importForm.interfaceId = null
      this.importOptions.modules = []
      this.importOptions.interfaces = []

      if (!projectId) return

      try {
        const response = await getModules(projectId)
        if (response.success) {
          this.importOptions.modules = response.rows || []
        }
      } catch (error) {
        console.error('加载模块列表失败:', error)
        this.$message.error('加载模块列表失败')
      }
    },

    async handleModuleChange(moduleId) {
      this.importForm.interfaceId = null
      this.importOptions.interfaces = []

      if (!moduleId) return

      try {
        const response = await getInterfaces(moduleId)
        if (response.success) {
          this.importOptions.interfaces = response.rows || []
        }
      } catch (error) {
        console.error('加载接口列表失败:', error)
        this.$message.error('加载接口列表失败')
      }
    },

    async handleInterfaceChange(interfaceCode) {
      if (!interfaceCode) {
        // 清空权限记录
        this.importPermissionRecord.name = ''
        this.importPermissionRecord.url = ''
        this.importPermissionRecord.method = ''
        this.importPermissionRecord.code = ''
        return
      }

      // 从接口列表中查找对应的接口数据
      const selectedInterface = this.importOptions.interfaces.find(item => item.code === interfaceCode)

      if (selectedInterface) {
        // 直接使用接口列表中的数据，不需要再调用API
        this.importPermissionRecord.name = selectedInterface.name || ''
        this.importPermissionRecord.url = selectedInterface.url || ''
        this.importPermissionRecord.method = selectedInterface.method || 'GET'
        this.importPermissionRecord.code = selectedInterface.code || selectedInterface.name || ''

        // 清除表单验证错误（如果已经在第二步）
        this.$nextTick(() => {
          if (this.importStep === 2 && this.$refs['importPermissionForm']) {
            this.$refs['importPermissionForm'].clearValidate()
          }
        })
      } else {
        this.$message.error('未找到对应的接口数据')
        // 清空权限记录
        this.importPermissionRecord.name = ''
        this.importPermissionRecord.url = ''
        this.importPermissionRecord.method = ''
        this.importPermissionRecord.code = ''
      }
    },

    nextStep() {
      if (!this.importForm.interfaceId) {
        this.$message.warning('请先选择接口')
        return
      }

      // 检查是否已获取到接口详情
      if (!this.importPermissionRecord.name || !this.importPermissionRecord.url) {
        this.$message.warning('接口信息不完整，请重新选择接口')
        return
      }

      this.importStep = 2
      // 加载权限树
      this.getTree('3')

      // 清除表单验证错误
      this.$nextTick(() => {
        if (this.$refs['importPermissionForm']) {
          this.$refs['importPermissionForm'].clearValidate()
        }
      })
    },

    prevStep() {
      this.importStep = 1
    },

    changeImportType(value) {
      let type = value
      this.recordParentsProps.checkStrictly = false
      if (value === '4' || value === '5') {
        type = '3'
      }
      this.getTree(type)
    },

    async handleImportSubmit() {
      const _this = this

      try {
        await this.$refs['importPermissionForm'].validate()
      } catch (error) {
        return
      }

      if (this.importRecordParents.length > 0) {
        this.importPermissionRecord.parentId = this.importRecordParents.join(',')
      } else {
        this.importPermissionRecord.parentId = null
      }

      // 设置状态为启用
      this.importPermissionRecord.status = '1'

      this.importDialogLoading = true

      try {
        const resp = await addPermission(this.importPermissionRecord)
        if (resp && resp.success) {
          this.importDialogVisible = false
          this.$message({
            type: 'success',
            message: `导入接口 ${this.importPermissionRecord.name} 成功!`
          })
          this.isRefreshExpand = true
          _this.getList()
        }
      } catch (error) {
        console.error('导入接口失败:', error)
        this.$message.error('导入接口失败')
      } finally {
        this.importDialogLoading = false
      }
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

/* 搜索筛选区域样式 */
.search-filter-container {
  margin-bottom: 15px;
}

.filter-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-card .el-card__header {
  padding: 8px 8px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.filter-title i {
  margin-right: 5px;
  color: #409eff;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.header-btn {
  font-size: 13px;
  padding: 4px 8px;
}

.filter-content {
  padding: 0px 0px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-item {
  flex: 1;
  min-width: 0;
}

.filter-item:last-child {
  flex: 0 0 auto;
  width: 100px;
}

.filter-input,
.filter-select {
  width: 100%;
}

.filter-input .el-input__inner,
.filter-select .el-input__inner {
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
}

.search-btn {
  width: 100%;
  height: 40px;
  border-radius: 4px;
}

/* 操作按钮区域样式 */
.action-container {
  margin-bottom: 15px;
  padding: 10px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  border-radius: 4px;
  font-weight: 500;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-table th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
}

/* 导入接口对话框样式 */
.import-dialog .el-steps {
  margin-bottom: 20px;
}

.import-dialog .el-form-item {
  margin-bottom: 18px;
}

.import-dialog .el-select {
  width: 100%;
}
</style>
