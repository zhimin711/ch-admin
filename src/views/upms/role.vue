<template>
  <div class="app-container">
    <!-- 页面标题区域 -->

    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-form :inline="true" class="filter-form" label-width="80px">
        <el-form-item label="角色代码">
          <el-input
            v-model="tableA.params.code"
            :placeholder="$t('label.code')"
            style="width: 200px;"
            class="filter-input"
            prefix-icon="el-icon-key"
          />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input
            v-model="tableA.params.name"
            :placeholder="$t('label.name')"
            style="width: 200px;"
            class="filter-input"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="tableA.params.status"
            :placeholder="$t('label.status')"
            class="filter-select"
            clearable
          >
            <el-option :label="$t('label.enable')" value="1" />
            <el-option :label="$t('label.disable')" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-buttons">
          <el-button
            v-loading="tableA.loading"
            class="search-btn"
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
          >
            {{ $t('btn.search') }}
          </el-button>
          <el-button
            class="reset-btn"
            type="default"
            icon="el-icon-refresh"
            @click="tableA.params={}"
          >
            {{ $t('btn.reset') }}
          </el-button>
          <el-button
            v-permission="['UPMS_ROLE_ADD']"
            type="success"
            class="add-btn"
            icon="el-icon-plus"
            @click="handleAdd"
          >
            {{ $t('role.add') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="tableA.loading"
        :data="tableA.list"
        class="role-table"
        border
        fit
        highlight-current-row
        :header-cell-style="{ background: '#f8f9fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column :label="$t('label.code')" width="220" align="center">
          <template slot-scope="scope">
            <div class="code-cell">
              <i class="el-icon-key" />
              <span>{{ scope.row.code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('label.name')" width="220" align="center">
          <template slot-scope="scope">
            <div class="name-cell">
              <i class="el-icon-user" />
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('label.description')" min-width="300">
          <template slot-scope="scope">
            <div class="description-cell">
              <i class="el-icon-document" />
              <span>{{ scope.row.description || '暂无描述' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('label.status')" width="100" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.status === '0'"
              type="danger"
              size="medium"
              effect="dark"
            >
              <i class="el-icon-close" />
              {{ $t('label.disable') }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.status === '1'"
              type="success"
              size="medium"
              effect="dark"
            >
              <i class="el-icon-check" />
              {{ $t('label.enable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('label.actions')" width="350" fixed="right">
          <template v-if="scope.row.type !== '0'" slot-scope="scope">
            <div class="action-buttons">
              <el-link
                v-permission="['UPMS_ROLE_EDIT']"
                type="primary"
                size="mini"
                icon="el-icon-edit"
                @click="handleEdit(scope.row, scope.$index)"
              >
                {{ $t('btn.edit') }}
              </el-link>
              <el-link
                v-if="scope.row.status === '1'"
                v-permission="['UPMS_ROLE_PERMISSION']"
                type="warning"
                size="mini"
                icon="el-icon-menu"
                @click="handleAuth(scope.row)"
              >
                {{ $t('role.permissions') }}
              </el-link>
              <el-link
                v-if="scope.row.status === '1'"
                v-permission="['UPMS_ROLE_PERMISSION_INTERFACE']"
                type="info"
                size="mini"
                icon="el-icon-s-grid"
                @click="handleAuth(scope.row, '4')"
              >
                接口授权
              </el-link>
              <el-link
                v-permission="['UPMS_ROLE_DELETE']"
                type="danger"
                size="mini"
                icon="el-icon-delete"
                @click="handleDel(scope.row)"
              >
                {{ $t('btn.delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <pagination
          v-show="tableA.total>0"
          :total="tableA.total"
          :page.sync="tableA.num"
          :limit.sync="tableA.size"
          @pagination="getList"
        />
      </div>
    </div>

    <!-- 角色编辑对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?$t('role.edit'): $t('role.add')"
      class="role-dialog"
      width="500px"
    >
      <el-form :model="role" label-width="100px" label-position="left" class="role-form">
        <el-form-item :label="$t('label.code')" prop="code">
          <el-input
            v-model="role.code"
            :placeholder="$t('label.code')"
            :disabled="dataForm.codeDisabled"
            prefix-icon="el-icon-key"
          />
        </el-form-item>
        <el-form-item :label="$t('label.name')">
          <el-input
            v-model="role.name"
            :placeholder="$t('label.name')"
            prefix-icon="el-icon-user"
          />
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
          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-text="$t('label.enable')"
            :inactive-text="$t('label.disable')"
          />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button type="primary" class="save-btn" @click="confirmRole">
          <i class="el-icon-check" />
          {{ $t('btn.save') }}
        </el-button>
        <el-button type="danger" class="cancel-btn" @click="dialogVisible=false">
          <i class="el-icon-close" />
          {{ $t('btn.cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      :visible.sync="dialogVisible2"
      :title="$t('role.permissions')"
      class="permission-dialog"
      width="600px"
    >
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
                <el-tag :type="fromPermissionKeyType(data.key)" size="mini">
                  {{ fromPermissionKeyName(data.key) }}
                </el-tag>
              </span>
            </span>
          </el-tree>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button
          :loading="treeLoading"
          type="primary"
          class="save-btn"
          @click="confirmAuth"
        >
          <i class="el-icon-check" />
          {{ $t('btn.save') }}
        </el-button>
        <el-button
          type="danger"
          class="cancel-btn"
          @click="dialogVisible2=false"
        >
          <i class="el-icon-close" />
          {{ $t('btn.cancel') }}
        </el-button>
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
      this.role.status = this.recordStatus ? '1' : '0'
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
      let types = '2,3'
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
      this.treeLoading = true
      let checkedKeys = this.$refs.tree.getCheckedKeys()
      const checkedKeys1 = this.$refs.tree.getHalfCheckedKeys()
      checkedKeys = [...checkedKeys, ...checkedKeys1]
      // this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)
      let resp
      if (this.dialogType === 'AUTH') {
        resp = await editRolePermissions(this.role.id, checkedKeys).finally(() => { this.treeLoading = false })
      } else {
        resp = await editRolePermissionsInterface(this.role.id, checkedKeys).finally(() => { this.treeLoading = false })
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 20px;

  // 页面标题区域
  .page-header {
    margin-bottom: 24px;

    .header-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 24px;
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);

      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;

        i {
          font-size: 28px;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .page-description {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
        line-height: 1.5;
      }
    }
  }

  // 搜索过滤区域
  .filter-container {
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-end;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;

        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .filter-input {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .filter-select {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }
      }

      .filter-buttons {
        margin-left: auto;
        display: flex;
        gap: 12px;

        .search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
        }

        .reset-btn {
          border-radius: 8px;
          padding: 10px 20px;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
            transform: translateY(-1px);
          }
        }

        .add-btn {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(103, 194, 58, 0.3);
          }
        }
      }
    }
  }

  // 数据表格区域
  .table-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 0px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);

    .role-table {
      border-radius: 8px;
      overflow: hidden;

      ::v-deep .el-table__header-wrapper {
        .el-table__header {
          th {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: #495057;
          }
        }
      }

      ::v-deep .el-table__body-wrapper {
        .el-table__body {
          tr {
            transition: all 0.3s;

            &:hover {
              background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
              transform: scale(1.01);
            }
          }
        }
      }

      .code-cell,
      .name-cell,
      .description-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          color: #667eea;
          font-size: 14px;
          flex-shrink: 0;
        }

        span {
          color: #606266;
          font-weight: 500;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;

        .el-button {
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }

    .pagination-wrapper {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
  }

  // 对话框样式
  .role-dialog,
  .permission-dialog {
    ::v-deep .el-dialog {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

      .el-dialog__header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;

        .el-dialog__title {
          color: white;
          font-weight: 600;
        }

        .el-dialog__headerbtn {
          .el-dialog__close {
            color: white;

            &:hover {
              color: rgba(255, 255, 255, 0.8);
            }
          }
        }
      }

      .el-dialog__body {
        padding: 24px;
      }
    }

    .role-form {
      .el-form-item {
        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .el-input {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .el-textarea {
          ::v-deep .el-textarea__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
          }
        }
      }
    }

    .permission-tree {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 16px;

      ::v-deep .el-tree-node__content {
        padding: 8px 0;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background: rgba(102, 126, 234, 0.1);
        }
      }
    }

    .dialog-footer {
      text-align: right;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
      display: flex;
      gap: 12px;
      justify-content: flex-end;

      .save-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
      }

      .cancel-btn {
        border-radius: 8px;
        padding: 10px 20px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;

    .page-header .header-content {
      padding: 20px;

      .page-title {
        font-size: 20px;
      }

      .page-description {
        font-size: 13px;
      }
    }

    .filter-container {
      padding: 20px;

      .filter-form {
        flex-direction: column;
        gap: 12px;

        .el-form-item {
          width: 100%;

          .el-input,
          .el-select {
            width: 100% !important;
          }
        }

        .filter-buttons {
          margin-left: 0;
          justify-content: center;

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .table-container {
      padding: 16px;
      overflow-x: auto;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-container {
  animation: fadeInUp 0.6s ease-out;

  .page-header,
  .filter-container,
  .table-container {
    animation: fadeInUp 0.6s ease-out;
  }
}

.permission-tree {
  margin-bottom: 30px;
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
