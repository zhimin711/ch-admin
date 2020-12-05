<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="recordPage.params.userId" placeholder="代码" style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-input v-model="recordPage.params.username" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="recordPage.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button v-loading="recordPage.loading" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="recordPage.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['UPMS_PERMISSION_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加权限
      </el-button>
      <!--<el-button type="primary" class="filter-item" icon="el-icon-plus" @click="handleAddRole">New Role</el-button>-->
    </div>

    <el-table v-loading="recordPage.loading" :data="recordPage.list" style="width: 100%;margin-bottom: 20px;" row-key="id" border :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" prop="name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="type" label="类型" width="100">
        <template slot-scope="{row}">
          <el-tag v-if="row.type === '1'" type="warning">目录</el-tag>
          <el-tag v-else-if="row.type === '2'" type="success">{{ row.hidden? '[隐藏]':'' }}菜单</el-tag>
          <el-tag v-else-if="row.type === '3'" type="primary">按钮</el-tag>
          <el-tag v-else-if="row.type === '4'" type="info">隐藏菜单</el-tag>
          <el-tag v-else-if="row.type === '5'" type="danger">{{ row.hidden? '[私有]':'[开放]' }}接口</el-tag>
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
        <template slot-scope="{row}">
          <!--<i v-if="row.icon" :class="row.icon" />-->
          <svg-icon v-if="row.icon" :icon-class="row.icon" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sort" label="排序" width="69" />
      <el-table-column align="center" prop="status" label="状态" width="69">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | enableStatusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button v-if="checkPermission2(['UPMS_PERMISSION_EDIT'])" type="text" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑
          </el-button>
          <el-link v-if="checkPermission2(['UPMS_PERMISSION_COPY'])" type="success" icon="el-icon-document-copy" @click="handleCopy(scope.row)">复制</el-link>
          <el-link v-if="checkPermission2(['UPMS_PERMISSION_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="recordPage.total>0" :total="recordPage.total" :page.sync="recordPage.num" :limit.sync="recordPage.size" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改权限':'新增权限'" :close-on-click-modal="false">
      <el-form ref="baseForm" :model="record" :rules="rules" label-width="100px">
        <el-form-item label="类型">
          <el-radio-group v-model="record.type" @change="changeType">
            <el-radio-button label="1">目录</el-radio-button>
            <el-radio-button label="2">菜单</el-radio-button>
            <!--<el-radio-button label="4">隐藏菜单</el-radio-button>-->
            <el-radio-button label="3">按钮</el-radio-button>
            <el-radio-button label="5">接口</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级">
          <el-cascader ref="categoryCascader" v-model="recordParents" :options="options.parents" :show-all-levels="false" :props="recordParentsProps" clearable />
          <el-icon v-show="dialogLoadingVisible" class="el-icon-loading" />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="record.code" :disabled="recordForm.codeDisabled" placeholder="目录或菜单代码需与前端路由一致" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <!--<el-input v-model="record.icon" placeholder="仅支持SVG" />-->
          <icon-selector v-model="record.icon" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="record.url" placeholder="按钮或接口必填" />
        </el-form-item>
        <!--<el-form-item v-show="recordForm.redirectShow" label="重定向地址">
          <el-input v-model="record.redirect" placeholder="目录与隐藏地址" />
        </el-form-item>-->
        <el-form-item v-if="record.type === '3' || record.type === '5'" label="请求方法">
          <el-radio-group v-model="record.method">
            <el-radio-button label="">ALL</el-radio-button>
            <el-radio-button label="GET" />
            <el-radio-button label="POST" />
            <el-radio-button label="PUT" />
            <el-radio-button label="DELETE" />
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="record.type === '2' || record.type === '5'" :label="record.type === '2'?'是否隐藏':'是否开放'">
          <el-radio v-model="record.hidden" :label="false">{{ record.type === '2'?'否':'是' }}</el-radio>
          <el-radio v-model="record.hidden" :label="true">{{ record.type === '2'?'是':'否' }}</el-radio>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="record.sort" />
        </el-form-item>
        <el-form-item label="权限状态">
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
        <el-button type="danger" @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import IconSelector from '@/components/IconSelector'
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { validAlphabetsAndNumber, isEmpty } from '@/utils/validate'
import { treePermission, pagePermission, addPermission, editPermission, delPermission } from '@/api/upms/permission'

const defaultRecord = {
  type: '1',
  code: '',
  sort: 1,
  name: ''
}
export default {
  name: 'UpmsPermission',
  components: { IconSelector },
  data() {
    return {
      treeData1: [],
      recordPage: {
        loading: true,
        num: 1,
        size: 10,
        total: 0,
        list: [],
        params: {}
      },
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
            pattern: /^[A-Za-z0-9]+$/,
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
    checkPermission2,
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
    getList() {
      this.recordPage.loading = true
      pagePermission(this.recordPage).then(response => {
        this.recordPage.list = response.rows
        this.recordPage.total = response.total
      }).finally(() => { this.recordPage.loading = false })
    },
    handleAdd() {
      this.getTree('1')
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
      this.record = deepClone(row)
      this.recordType = row.type
      this.recordParents = this.record.parentId.split(',')
      if (this.record.parentId === '0') this.record.parentId = undefined
      this.recordStatus = (this.record.status === '1')
      this.dialogType = 'edit'
      this.dialogVisible = true
      // this.recordForm.codeDisabled = true
      // this.recordForm.redirectShow = (row.type === '1' || row.type === '4')
      this.changeType(row.type)
    },
    handleCopy(row, index) {
      this.record = deepClone(row)
      this.record.id = null
      this.record.sort += 1
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
      this.$confirm('确认删除选择权限，操作不可回退?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await delPermission(row.id).then(resp => {
            if (resp.success) {
              _this.getList()
              this.$message({
                type: 'success',
                message: 'Delete success!'
              })
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      // this.record = {}
      if (isEmpty(this.record.url)) {
        this.$message.error(`地址不能为空!`)
        return
      } else if ((this.record.type === '1' || this.record.type === '2') && !validAlphabetsAndNumber(this.record.url)) {
        this.$message.error(`地址格式错误，目录或菜单地址只能是字母数字!`)
        return
      }
      if (this.recordParents.length > 0) {
        this.record.parentId = this.recordParents.join(',')
      } else this.record.parentId = null
      this.record.status = '0'
      if (this.recordStatus) {
        this.record.status = '1'
      }
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new' || this.dialogType === 'copy') {
        resp = await addPermission(this.record).catch(() => {})
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        this.record.children = []
        resp = await editPermission(this.record.id, this.record)
      }
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.name} 成功!`
        })
        _this.getList()
      }
    },
    changeType(value) {
      let type = value
      this.recordForm.urlDisabled = value <= 1
      this.recordForm.descDisabled = true
      this.recordForm.redirectShow = (value === '1' || value === '4')
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
