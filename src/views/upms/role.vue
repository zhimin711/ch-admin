<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="tableA.params.code" :placeholder="$t('label.code')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="tableA.params.name" :placeholder="$t('label.name')" style="width: 200px;" class="filter-item" />
      <el-select v-model="tableA.params.status" :placeholder="$t('label.status')" class="filter-item" clearable>
        <el-option :label="$t('label.enable')" value="1" />
        <el-option :label="$t('label.disable')" value="0" />
      </el-select>
      <el-button v-loading="tableA.loading" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('btn.search') }}
      </el-button>
      <el-button class="filter-item" type="" icon="el-icon-refresh" @click="tableA.params={}">
        {{ $t('btn.reset') }}
      </el-button>
      <el-button v-permission="['UPMS_ROLE_ADD']" type="primary" class="filter-item" icon="el-icon-plus" @click="handleAdd">
        {{ $t('role.add') }}
      </el-button>
    </div>

    <el-table v-loading="tableA.loading" :data="tableA.list" style="width: 100%;" border>
      <el-table-column :label="$t('label.code')" width="220">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('label.name')" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" :label="$t('label.description')">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('label.status')" width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="warning">{{ $t('label.disable') }}</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="success">{{ $t('label.enable') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('label.actions')" width="300">
        <template v-if="scope.row.type !== '0'" slot-scope="scope">
          <el-link v-permission="['UPMS_ROLE_EDIT']" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">{{ $t('btn.edit') }}</el-link>
          <el-link v-if="scope.row.status === '1'" v-permission="['UPMS_ROLE_PERMISSION']" type="warning" icon="el-icon-menu" @click="handleAuth(scope.row)">{{ $t('role.permissions') }}</el-link>
          <el-link v-if="scope.row.status === '1'" v-permission="['UPMS_ROLE_PERMISSION_INTERFACE']" type="info" icon="el-icon-s-grid" @click="handleAuth(scope.row, '4')">接口授权</el-link>
          <el-link v-permission="['UPMS_ROLE_DELETE']" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">{{ $t('btn.delete') }}</el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="tableA.total>0" :total="tableA.total" :page.sync="tableA.num" :limit.sync="tableA.size" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?$t('role.edit'): $t('role.add')">
      <el-form :model="role" label-width="100px" label-position="left">
        <el-form-item :label="$t('label.code')" prop="code">
          <el-input v-model="role.code" :placeholder="$t('label.code')" :disabled="dataForm.codeDisabled" />
        </el-form-item>
        <el-form-item :label="$t('label.name')">
          <el-input v-model="role.name" :placeholder="$t('label.name')" />
        </el-form-item>
        <el-form-item :label="$t('label.description')">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            :placeholder="$t('label.description')"
          />
        </el-form-item>
        <el-form-item :label="$t('label.status')">
          <!--<el-select v-model="role.status" placeholder="请选择">
            <el-option key="enabled" label="启用" value="1" />
            <el-option key="disabled" label="禁用" value="0" />
          </el-select>-->

          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-text="$t('label.enable')"
            :inactive-text="$t('label.disable')"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:center;">
        <el-button type="primary" @click="confirmRole">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialogVisible=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="$t('role.permissions')">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item :label="$t('label.menu')">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            :empty-text="treeTip"
            show-checkbox
            node-key="value"
            :default-expanded-keys="expList"
            class="permission-tree"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span>
                <el-tag :type="fromPermissionKeyType(data.key)">{{ fromPermissionKeyName(data.key) }}</el-tag>
              </span>
            </span>
          </el-tree>
        </el-form-item>
      </el-form>
      <div style="text-align:center;">
        <el-button v-loading="treeLoading" type="primary" @click="confirmAuth">{{ $t('btn.save') }}</el-button>
        <el-button type="danger" @click="dialogVisible2=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { pageRole, addRole, editRole, delRole, getRolePermissions, editRolePermissions, editRolePermissionsInterface } from '@/api/upms/role'
import { treePermission } from '@/api/upms/permission'

const defaultRole = {
  code: '',
  name: '',
  description: '',
  routes: []
}
const PERMISSION_TYPE = {
  CATALOG: { type: 'warning', name: '目录' },
  MENU: { type: 'success', name: '菜单' },
  MENU_HIDE: { type: 'info', name: '隐藏菜单' },
  BUTTON: { type: 'primary', name: '按钮' },
  AUTH_INTERFACE: { type: 'info', name: '接口' },
  INTERFACE: { type: 'primary', name: '接口' }
}
export default {
  name: 'UpmsRole',
  data() {
    return {
      tableA: {
        loading: true,
        num: 1,
        size: 10,
        total: 0,
        list: [],
        params: {}
      },
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      treeLoading: false,
      treeTip: '正在加载数据...',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      expList: [],
      dialogVisible2: false,
      recordStatus: true,
      dataForm: {
        codeDisabled: false
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getList()
    // Mock: get all routes and roles list from server
  },
  methods: {
    fromPermissionKeyType(key) {
      const idx = key.lastIndexOf('|')
      if (idx > 0) {
        return PERMISSION_TYPE[key.substring(idx + 1)].type
      }
      return ''
    },
    fromPermissionKeyName(key) {
      const idx = key.lastIndexOf('|')
      if (idx > 0) {
        return PERMISSION_TYPE[key.substring(idx + 1)].name
      }
      return '-'
    },
    async getRoutes(type = '9') {
      this.treeLoading = true
      this.routes = []
      this.treeTip = '正在加载数据...'
      const res = await treePermission(type).finally(() => { this.treeLoading = false })
      // this.serviceRoutes = res.rows
      this.routes = res.rows
      if (this.routes.length === 0) this.treeTip = '未加载到数据！'
    },
    getList() {
      this.tableA.loading = true
      pageRole(this.tableA).then(response => {
        this.tableA.list = response.rows
        this.tableA.total = response.total
      }).finally(() => { this.tableA.loading = false })
    },
    handleFilter() {
      this.getList()
    },
    handleAdd() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dataForm.codeDisabled = false
      this.recordStatus = true
    },
    handleEdit(row, $index) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dataForm.codeDisabled = true
      this.checkStrictly = true
      this.role = deepClone(row)
      this.recordStatus = (this.role.status === '1')
      this.$nextTick(() => {
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDel(row) {
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      })
        .then(async() => {
          await delRole(row.id)
          this.getList()
          this.$message({
            type: 'success',
            message: this.$t('message.deleteSuccess')
          })
        }).catch(err => { console.error(err) })
    },
    generateMap(routes) {
      const map = {}
      routes.forEach(route => {
        if (map[route.parentId]) {
          map[route.parentId].push(route)
        } else {
          map[route.parentId] = [route]
        }
      })
      return map
    },
    generateTree(map) {
      const res = []
      for (const key in map) {
        map[key].forEach(route => {
          if (route.type === '2') {
            route.children = map[route.parentId + ',' + route.id]
            res.push(route)
          }
        })
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        } else {
          data.push(route.id)
        }
      })
      return data
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      let resp = null
      if (isEdit) {
        resp = await editRole(this.role.id, this.role)
      } else {
        resp = await addRole(this.role).catch(() => {})
        if (resp && resp.success) {
          const role = deepClone(this.role)
          this.rolesList.push(role)
        }
      }
      this.dialogVisible = false
      let type = 'error'
      if (resp && resp.success) {
        type = 'success'
        this.getList()
      }

      this.$notify({
        title: (isEdit ? '修改' : '创建') + '角色',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色代码: ${this.role.code}</div>
            <div>角色名称: ${this.role.name}</div>
          `,
        type: type
      })
    },
    async handleAuth(row, type) {
      let types = '2,3,4'
      this.dialogType = 'AUTH'
      if (type) {
        this.dialogType = 'AUTH_INT'
        types = '4'
      }
      await this.getRoutes(type)
      this.dialogVisible2 = true
      this.role = deepClone(row)
      getRolePermissions(row.id, { types: types }).then(resp => {
        if (resp.success) {
          if (this.dialogType === 'AUTH_INT') {
            const authList = resp.rows.map(item => item.id)
            this.$refs.tree.setCheckedKeys(authList)
            return
          }
          const authMap = this.generateMap(resp.rows)
          const authTree = this.generateTree(authMap)
          const authList = this.generateArr(authTree)
          this.expList = authList.length > 0 ? authList : [this.routes[0].value]
          this.$refs.tree.setCheckedKeys(authList)
        }
      })
    },
    async confirmAuth() {
      let checkedKeys = this.$refs.tree.getCheckedKeys()
      const checkedKeys1 = this.$refs.tree.getHalfCheckedKeys()
      checkedKeys = [...checkedKeys, ...checkedKeys1]
      // this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)
      let resp
      if (this.dialogType === 'AUTH') {
        resp = await editRolePermissions(this.role.id, checkedKeys)
      } else {
        resp = await editRolePermissionsInterface(this.role.id, checkedKeys)
      }
      if (resp && resp.success) {
        this.dialogVisible2 = false
        /* this.$message({
          type: 'success',
          message: 'Auth permission success!'
        }) */
      }
      this.$notify({
        title: '角色授权',
        dangerouslyUseHTMLString: true,
        message: `Auth permission ` + (resp && resp.success ? 'success!' : 'error...'),
        type: resp && resp.success ? 'success' : 'error'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 15px;
  }
</style>
