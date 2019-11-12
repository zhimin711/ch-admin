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
        添加应用实例
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="120px" label="项目名称">
        <template slot-scope="scope">
          <el-tag>
            {{ scope.row.sysName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="120px" label="应用类型">
        <template slot-scope="scope">
          <!--<span>{{ scope.row.type }}</span>-->
          <el-tag>
            {{ scope.row.type | convertTypeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="应用名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | enableStatusNameFilter}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <!--<el-button type="primary" size="small" @click="handleEdit(scope.row)">Edit</el-button>-->
          <!--<el-button type="danger" size="small" @click="handleDel(scope.row)">Delete</el-button>-->
          <el-link v-if="checkPermission2(['UPMS_USER_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['UPMS_USER_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改 实例':'添加 实例'">
      <el-form :model="record" label-width="80px" label-position="left">
        <el-form-item label="项目">
          <el-cascader ref="projectsSelect" v-model="recordProjectCodes" :options="options.projectCodes" :show-all-levels="false" :props="{checkStrictly: true}" clearable />
        </el-form-item>
        <el-form-item label="实例类型">
          <el-select v-model="record.type" placeholder="请选择">
            <el-option key="1" label="JettyWeb" value="1" />
            <el-option key="2" label="Dubbo应用" value="2" />
            <el-option key="3" label="数据库" value="3" />
            <el-option key="4" label="Nginx" value="4" />
            <el-option key="5" label="Redis" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="实例代码">
          <el-input v-model="record.code" placeholder="实例代码" />
        </el-form-item>
        <el-form-item label="实例名称">
          <el-input v-model="record.name" placeholder="实例名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="实例 描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="record.status" placeholder="请选择">
            <el-option key="enabled" label="启用" value="1" />
            <el-option key="disabled" label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list, add, edit, del } from '@/api/sys/app/instance'
import { getCurrentUserTree } from '@/api/sys/project/code'

export default {
  name: 'SysAppInstanceManager',
  components: { Pagination },
  filters: {
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
      recordProjectCodes: ['SHIVA-TRTMS-GROUND', 'SHIVA-TRTMS-GROUND:REQUIRE'],
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      options: {
        projectCodes: []
      }
    }
  },
  created() {
    this.getList()
    this.getAuthProjectCodes()
  },
  methods: {
    checkPermission2,
    async getAuthProjectCodes(type) {
      const resp = await getCurrentUserTree()
      if (resp && resp.success) this.options.projectCodes = resp.rows
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
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
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
      if (this.recordProjectCodes.length > 0) {
        this.record.projectCode = this.recordProjectCodes.join(',')
      } else this.record.projectCode = null
      const typeLabels = this.$refs['projectsSelect'].currentLabels
      if (typeLabels && typeLabels.length > 0) {
        this.record.projectName = typeLabels.join('/')
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
          message: `${opName} ${this.record.username} success!`
        })
        _this.getList()
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
