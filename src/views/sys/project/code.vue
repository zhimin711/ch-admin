<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-if="checkPermission2(['UPMS_USER_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['UPMS_USER_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加项目
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="120px" label="上级项目">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.parentCode">
            {{ scope.row.parentName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="项目代码">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-link v-if="checkPermission2(['UPMS_USER_ROLE'])" type="primary" icon="el-icon-menu" @click="handleAuthUsers(scope.row)">分配用户</el-link>
          <el-link v-if="checkPermission2(['UPMS_USER_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['UPMS_USER_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改 项目代码':'添加 项目代码'">
      <el-form :model="record" label-width="80px" label-position="left">
        <el-form-item label="上级项目">
          <el-cascader ref="parentsSelect" v-model="recordParents" :options="options.parents" :show-all-levels="false" clearable @change="changeParent" />
        </el-form-item>
        <el-form-item label="代码">
          <el-input v-model="record.code" placeholder="项目代码" :disabled="dialogCodeEdit">
            <template v-if="recordParents.length>0" slot="prepend">{{ record.parentCode }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="record.name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="record.sort" placeholder="排序" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="项目 描述"
          />
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
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'分配用户'" width="544px">
      <div style="text-align:left;margin-bottom: 20px">
        <el-transfer v-model="recordUsers" filterable :filter-method="filterUsersMethod" filter-placeholder="请输入城市拼音" :render-content="renderUserShow" :data="options.users" :titles="['未分配用户', '已分配用户']" :props="{ key: 'username', label: 'realName' }" />
      </div>
      <div style="text-align:left;padding-left:170px">
        <el-button type="primary" @click="handleSubmitUsers">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list, add, edit, del, getParents, getUsers, getProjectUsers } from '@/api/sys/project/code'

export default {
  name: 'SysProjectCodeManager',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      let s = 'draft'
      if (status === '1') {
        s = 'published'
      } else if (status === '3') {
        s = 'deleted'
      }
      return statusMap[s]
    },
    convertTypeFilter(type) {
      return ['', 'DB(数据库)', '远程终端(SSH)', '(FTP)'][type]
    }
  },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      record: {},
      recordStatus: true,
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      recordParents: [],
      recordUsers: [],
      options: {
        parents: [],
        users: []
      }
    }
  },
  created() {
    this.getList()
    this.getParents('1')
    this.getUsers()
  },
  methods: {
    checkPermission2,
    async getParents(type) {
      const resp = await getParents(type)
      if (resp && resp.success) this.options.parents = resp.rows
    },
    async getUsers() {
      const resp = await getUsers()
      if (resp && resp.success) this.options.users = resp.rows
    },
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      })
    },
    handleAdd() {
      this.record = {}
      this.recordStatus = true
      this.recordParents = []
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
      this.recordStatus = (this.record.status === '1')
      this.recordParents = []
      if (this.record.parentCode) {
        this.recordParents = [this.record.parentCode]
      }
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
            message: 'Delete success!'
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'
      this.record.status = '0'
      if (this.recordStatus) {
        this.record.status = '1'
      }
      const typeLabels = _this.$refs['parentsSelect'].currentLabels
      if (typeLabels && typeLabels.length > 0) {
        this.record.parentName = typeLabels.join('/')
      }
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
          message: `${opName} 项目 ${this.record.name} success!`
        })
        _this.getList()
      }
    },
    handleAuthUsers(row) {
      //
      this.dialogVisible2 = true

      this.record = deepClone(row)
      this.recordUsers = []
      getProjectUsers(row.id).then(resp => {
        if (resp.success) {
          resp.rows.forEach(e => {
            this.recordUsers.push(e)
          })
        }
      })
    },
    handleSubmitUsers() {
    },
    filterUsersMethod(query, item) {
      if (query === '') return true
      let hasQuery = item.username.indexOf(query) > -1
      if (!hasQuery) {
        hasQuery = item.realName.indexOf(query) > -1
      }
      return hasQuery
    },
    renderUserShow(h, option) {
      // return `<span>${option.username} - ${option.realName}</span>`
      return <span>{ option.username } - { option.realName }</span>
    },
    changeParent(val) {
      this.record.parentCode = ''
      if (val.length > 0) {
        this.record.parentCode = val[0]
        let obj = {}
        obj = this.options.parents.find((item) => {
          return item.value === val[0]
        })
        this.record.parentName = obj.label
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
</style>
