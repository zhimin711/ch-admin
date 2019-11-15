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
            {{ scope.row.projectName }}
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
            {{ row.status | enableStatusNameFilter }}
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
      <el-form ref="recordForm" :model="record" label-width="80px" label-position="left" :rules="rules">
        <el-form-item label="所属项目">
          <el-cascader ref="projectsSelect" v-model="recordProjectCodes" :options="options.projectCodes" :show-all-levels="false" :props="{checkStrictly: true}" clearable />
        </el-form-item>
        <el-form-item label="实例类型" prop="type">
          <el-select v-model="record.type" placeholder="请选择">
            <el-option key="1" label="JettyWeb" value="1" />
            <el-option key="2" label="Dubbo应用" value="2" />
            <el-option key="3" label="数据库" value="3" />
            <el-option key="4" label="Nginx" value="4" />
            <el-option key="5" label="Redis" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="实例代码" prop="code">
          <el-input v-model="record.code" placeholder="实例代码" />
        </el-form-item>
        <el-form-item label="实例名称" prop="name">
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
          <el-switch
            v-model="recordStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="开启"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="实例节点" style="margin-bottom: 0">
          <el-button size="small" @click="handleAddNode">添加节点</el-button>
        </el-form-item>
        <el-table
          v-loading="listNodeLoading"
          :data="recordNodes"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column prop="env" label="环境" width="110">
            <template slot-scope="{row}">
              <!--<el-input v-model="row.env" class="edit-input" size="small" />-->
              <el-select v-model="row.env" placeholder="请选择" size="small">
                <el-option key="1" label="DEV" value="1" />
                <el-option key="2" label="TEST" value="2" />
                <el-option key="3" label="PROD" value="3" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" width="180">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.name" class="edit-input" size="small" placeholder="节点名称" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="host" label="地址">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.host" class="edit-input" size="small" placeholder="IP或域名" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="port" label="端口" width="80" align="center">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.port" class="edit-input" size="small" placeholder="22" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" width="120">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.username" class="edit-input" size="small" placeholder="appdeploy" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="password" label="密码" width="120">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.password" class="edit-input" size="small" placeholder="******" />
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link v-if="checkPermission2(['UPMS_USER_DELETE']) && scope.$index>0" type="danger" @click="handleDelNode(scope.$index)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button type="danger" @click="resetForm('recordForm')">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list, add, edit, del, getNodes } from '@/api/sys/app/instance'
import { getCurrentUserTree } from '@/api/sys/project/code'

export default {
  name: 'SysAppInstanceManager',
  components: { Pagination },
  filters: {
    convertTypeFilter(type) {
      return ['', 'JettyWeb', 'Dubbo应用', '数据库', 'Nginx', 'Redis'][type]
    }
  },
  data() {
    return {
      listLoading: true,
      listNodeLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      record: {},
      recordStatus: true,
      recordProjectCodes: [],
      recordNode: { env: '1', name: null, host: null, username: null, password: null },
      recordNodes: [],
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      options: {
        projectCodes: []
      },
      rules: {
        project: [
          { type: 'array', required: true, message: '请选择一个项目', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择实例类型', trigger: 'change' }
        ],
        code: [
          { required: true, message: '请输入实例代码', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入实例名称', trigger: 'blur' },
          { min: 3, max: 150, message: '长度在 3 到 150 个字符', trigger: 'blur' }
        ]
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
      }).catch(() => { this.listLoading = false })
    },
    handleAdd() {
      this.record = { type: '1' }
      this.recordStatus = true
      this.recordProjectCodes = []
      this.recordNodes = [deepClone(this.recordNode)]
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.recordStatus = (this.record.status === '1')
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
      if (this.record.projectCode) {
        this.recordProjectCodes = this.record.projectCode.split(',')
      }
      this.recordNodes = []
      this.listNodeLoading = true
      getNodes(row.id).then(response => {
        this.listNodeLoading = false
        this.recordNodes = response.rows
        if (this.recordNodes.length === 0) {
          this.recordNodes.push(deepClone(this.recordNode))
        }
      })
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
      if (_this.recordProjectCodes.length > 0) {
        _this.record.projectCode = this.recordProjectCodes.join(',')
      } else {
        _this.$message.error('项目代码不能为空！')
        return
      }
      const checkedNodes = _this.$refs['projectsSelect'].getCheckedNodes()
      if (checkedNodes && checkedNodes.length > 0) {
        this.record.projectName = checkedNodes[0].label
      }
      this.record.status = '0'
      if (this.recordStatus) {
        this.record.status = '1'
      }
      this.$refs['recordForm'].validate(async(valid) => {
        if (!valid) {
          return false
        }
        this.record.nodes = deepClone(this.recordNodes)
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
      })
    },
    resetForm(formName) {
      this.dialogVisible = false
      this.$refs[formName].resetFields()
    },
    handleAddNode() {
      const node = deepClone(this.recordNode)
      this.recordNodes.push(node)
    },
    handleDelNode(index) {
      this.recordNodes.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.edit-input {
  /*padding-right: 100px;*/
}

.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
