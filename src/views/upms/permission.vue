<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.userId" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-input v-model="listQuery.params.username" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button v-if="checkPermission2(['ADMIN_PERMISSION_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['ADMIN_PERMISSION_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加权限
      </el-button>
      <!--<el-button type="primary" class="filter-item" icon="el-icon-plus" @click="handleAddRole">New Role</el-button>-->
    </div>

    <el-table v-loading="loading" :data="list" style="width: 100%;margin-bottom: 20px;" row-key="id" border :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" prop="name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="type" label="类型" width="70">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === '1'" type="warning">目录</el-tag>
          <el-tag v-else-if="scope.row.type === '2'" type="success">菜单</el-tag>
          <el-tag v-else-if="scope.row.type === '3'" type="primary">按钮</el-tag>
          <el-tag v-else-if="scope.row.type === '4'" type="default">链接</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代码" prop="code">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="图标" width="70">
        <template slot-scope="scope">
          <i v-if="scope.row.icon" :class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sort" label="排序" width="69" />
      <el-table-column align="center" prop="status" label="状态" width="69">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="warning">禁用</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="success">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="160">
        <template slot-scope="scope">
          <el-button v-if="checkPermission2(['ADMIN_PERMISSION_EDIT'])" type="text" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑
          </el-button>
          <el-button v-if="checkPermission2(['ADMIN_PERMISSION_DELETE'])" type="text" icon="el-icon-delete" class="red" @click="handleDel(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改权限':'新增权限'">
      <el-form ref="baseForm" :model="record" :rules="rules" label-width="100px">
        <el-form-item label="类型">
          <el-radio-group v-model="record.type" @change="changeType">
            <el-radio-button label="1">目录</el-radio-button>
            <el-radio-button label="2">菜单</el-radio-button>
            <el-radio-button label="3">按钮</el-radio-button>
            <el-radio-button label="4">链接</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级">
          <el-cascader ref="categoryCascader" v-model="recordParents" :options="options.parents" :show-all-levels="false" />
          <el-icon v-show="dialogLoadingVisible" class="el-icon-loading" />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="record.code" :disabled="recordForm.codeDisabled" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="record.icon" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="record.url" :disabled="recordForm.urlDisabled" />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-radio-group v-model="record.description" :disabled="recordForm.descDisabled">
            <el-radio-button label="">ALL</el-radio-button>
            <el-radio-button label="GET"></el-radio-button>
            <el-radio-button label="POST"></el-radio-button>
            <el-radio-button label="PUT"></el-radio-button>
            <el-radio-button label="DELETE"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="record.sort" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="record.status" placeholder="请选择">
            <el-option key="enabled" label="启用" value="1" />
            <el-option key="disabled" label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { fetchTree, fetchList, add, edit, del } from '@/api/upms/permission'

export default {
  name: 'PermissionManager',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      treeData1: [],
      loading: true,
      list: [],
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        params: {}
      },
      record: {},
      recordType: '',
      recordParents: [],
      recordForm: {
        codeDisabled: false,
        descDisabled: false,
        urlDisabled: false
      },
      dialogVisible: false,
      dialogType: false,
      dialogLoadingVisible: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      rules: {},
      options: {
        parents: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission2,
    getTree(type) {
      // this.options.parents = []
      this.dialogLoadingVisible = true
      fetchTree(type).then(response => {
        this.dialogLoadingVisible = false
        this.options.parents = response.rows

        if (this.record.parentId && this.recordType === type) {
          // this.recordParents = this.record.parentId.split(',')
          console.log(this.recordParents)
        }
      })
    },
    handleNodeClick(data) {
      console.log(data)
      // this.getList()
    },
    getList() {
      this.loading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.rows
        this.listQuery.total = response.total
        this.loading = false
      })
    },
    handleAdd() {
      this.getTree('0')
      this.record = {}
      this.recordParents = []
      this.dialogType = 'new'
      this.dialogVisible = true
      this.recordForm.codeDisabled = false
      this.recordForm.urlDisabled = false
    },
    handleEdit(row, index) {
      this.record = deepClone(row)
      this.recordType = row.type
      this.recordParents = this.record.parentId.split(',')
      if (this.record.parentId === '0') this.record.parentId = undefined
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.recordForm.codeDisabled = true
      this.recordForm.descDisabled = row.type !== '3'
      this.getTree(row.type)
    },
    handleDel(row) {
      const _this = this
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await del(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      // this.record = {}
      if (this.recordParents.length > 0) {
        this.record.parentId = this.recordParents.join(',')
      } else this.record.parentId = null
      const typeLabels = this.$refs['categoryCascader'].currentLabels
      if (typeLabels && typeLabels.length > 0) {
        this.record.parentName = typeLabels.join('/')
      }
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        resp = await add(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await edit(this.record.id, this.record)
      }
      if (resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.name} success!`
        })
        _this.getList()
      }
    },
    changeType(value) {
      this.recordForm.urlDisabled = value <= 1
      let type = value
      this.recordForm.descDisabled = true
      this.record.description = ''
      if (value === '4') {
        type = '3'
        this.record.description = 'GET'
      } else if (value === '3') {
        this.recordForm.descDisabled = false
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
