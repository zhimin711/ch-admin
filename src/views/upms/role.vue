<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="recordPage.params.code" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="recordPage.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="recordPage.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button v-if="checkPermission2(['UPMS_ROLE_SEARCH'])" v-loading="recordPage.loading" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="" icon="el-icon-refresh" @click="recordPage.params={}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['UPMS_ROLE_ADD'])" type="primary" class="filter-item" icon="el-icon-plus" @click="handleAdd">添加角色</el-button>
    </div>

    <el-table v-loading="recordPage.loading" :data="recordPage.list" style="width: 100%;" border>
      <el-table-column label="角色代码" width="220">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="warning">禁用</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="success">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="250">
        <template v-if="scope.row.type !== '0'" slot-scope="scope">
          <el-link v-if="checkPermission2(['UPMS_ROLE_PERMISSION'])" type="primary" icon="el-icon-menu" @click="handleAuth(scope.row)">分配权限</el-link>
          <el-link v-if="checkPermission2(['UPMS_ROLE_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['UPMS_ROLE_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="recordPage.total>0" :total="recordPage.total" :page.sync="recordPage.num" :limit.sync="recordPage.size" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit 角色':'New 角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="代码" prop="code">
          <el-input v-model="role.code" placeholder="Role 代码" :disabled="dataForm.codeDisabled" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="role.name" placeholder="Role 名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Role 描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <!--<el-select v-model="role.status" placeholder="请选择">
            <el-option key="enabled" label="启用" value="1" />
            <el-option key="disabled" label="禁用" value="0" />
          </el-select>-->

          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="开启"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:center;">
        <el-button type="primary" @click="confirmRole">保存</el-button>
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'分配角色权限'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="value"
            :default-expanded-keys="expList"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:center;">
        <el-button type="primary" @click="confirmAuth">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { pageRole, addRole, editRole, delRole, getRolePermissions, editRolePermissions } from '@/api/upms/role'
import { fetchTree } from '@/api/upms/permission'

const defaultRole = {
  code: '',
  name: '',
  description: '',
  routes: []
}

export default {
  data() {
    return {
      recordPage: {
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
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getList()
  },
  methods: {
    checkPermission2,
    async getRoutes() {
      const res = await fetchTree('9')
      // this.serviceRoutes = res.rows
      this.routes = res.rows
      // this.generateRoutes(res.rows)
    },
    getList() {
      this.recordPage.loading = true
      pageRole(this.recordPage).then(response => {
        this.recordPage.list = response.rows
        this.recordPage.total = response.total
      }).finally(() => { this.recordPage.loading = false })
    },
    handleFilter() {
      this.getList()
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title,
          label: route.label
        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route.id)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
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
        // const routes = this.generateRoutes(this.role.routes)
        // this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDel(row) {
      this.$confirm('Confirm to remove the role?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await delRole(row.id)
          this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
          })
        }).catch(err => { console.error(err) })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
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
    handleAuth(row) {
      this.dialogVisible2 = true
      this.role = deepClone(row)
      getRolePermissions(row.id, { types: '3,4' }).then(resp => {
        if (resp.success) {
          const authList = this.generateArr(resp.rows)
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
      const resp = await editRolePermissions(this.role.id, checkedKeys)
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
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
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
