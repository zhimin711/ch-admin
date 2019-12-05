<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="listQuery.params.keywords" placeholder="关键字"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.params.status" clearable placeholder="状态">
            <el-option key="1" label="启用" value="1"></el-option>
            <el-option key="2" label="禁用" value="0"></el-option>
          </el-select>

        </el-form-item>
      </el-form>
      <div class="handle-box">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="listQuery.params = {}">重置</el-button>
            <!--<el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="baseAdd()">新增</el-button>-->
            <!--<el-button type="primary" icon="el-icon-download" class="handle-del mr10">导出</el-button>-->
          </el-col>
        </el-row>
      </div>
      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column label="名称">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keywords" label="关键字">
        </el-table-column>
        <el-table-column prop="showMode" label="显示模式" width="110">
          <template slot-scope="scope">
            <el-tag type="info" v-if="scope.row.showMode === '0'">隐藏</el-tag>
            <el-tag type="success" v-if="scope.row.showMode === '1'">公开</el-tag>
            <el-tag type="danger" v-if="scope.row.showMode === '2'">私有</el-tag>
            <el-tag type="default" v-if="scope.row.showMode === '3'">固定</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80">
        </el-table-column>
        <!--<el-table-column label="地址">
            <template slot-scope="scope">
                <span>{{ scope.row.url }}</span>
            </template>
        </el-table-column>-->
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑
            </el-button>
            <el-button type="text" icon="el-icon-delete" class="red" @click="handleDel(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    </div>

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改分类':'新增分类'">
      <el-form ref="baseForm" :model="record" :rules="rules" label-width="100px">
        <!--<el-form-item label="上级目录" v-show="baseForm.parentVisible">
          <div class="linkage">
            <el-select v-for="(list, index) in options.parentList"
                       v-model="record.pidList[index]"
                       :key="index"
                       :placeholder="levelNames[index]"
                       @change="(value) => fetchChild(index, value)" clearable>
              <el-option v-for="item in list" :key="item.value" :label="item.label"
                         :value="item.value"
                         :disabled="item.disabled">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
          </div>
        </el-form-item>-->

        <el-form-item label="名称" prop="name">
          <el-col :span="12">
            <el-input v-model="record.name"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="关键字" prop="keywords">
          <el-input v-model="record.keywords"></el-input>
        </el-form-item>
        <el-form-item label="显示模式">
          <el-radio-group v-model="record.showMode">
            <el-radio-button label="0">隐藏</el-radio-button>
            <el-radio-button label="1">公开</el-radio-button>
            <el-radio-button label="2">私有</el-radio-button>
            <el-radio-button label="3" disabled>固定</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="record.sort"></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="record.description"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="record.status" placeholder="请选择">
            <el-option key="disabled" label="禁用" value="0"></el-option>
            <el-option key="enabled" label="启用" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleSubmit('baseForm')">确 定</el-button>
				<el-button @click="dialogVisible=false">取 消</el-button>
			</span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { validAlphabetsAndNumber } from '@/utils/validate'
import { fetchTree, fetchList, add, edit, del } from '@/api/wiki/category'

export default {
  name: 'WikiCategory',
  components: { Pagination },
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
          // console.log(this.recordParents)
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
      this.getTree('1')
      this.record = { 'type': '1', sort: 1 }
      this.recordParents = []
      this.dialogType = 'new'
      this.dialogVisible = true
      this.recordForm.codeDisabled = false
      this.recordForm.urlDisabled = false
      this.recordForm.descDisabled = true
      this.recordForm.redirectShow = true
    },
    handleEdit(row, index) {
      this.record = deepClone(row)
      this.recordType = row.type
      // this.recordParents = this.record.parentId.split(',')
      // if (this.record.parentId === '0') this.record.parentId = undefined
      this.dialogType = 'edit'
      this.dialogVisible = true
      // this.recordForm.codeDisabled = true
      // this.recordForm.redirectShow = row.type === '1'
      // this.changeType(row.type)
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
      // this.record = {}
      /*if ((this.record.type === '1' || this.record.type === '2') && !validAlphabetsAndNumber(this.record.url)) {
        this.$message.error(`地址格式错误，目录或菜单地址只能是字母数字!`)
        return
      }
      if (this.recordParents.length > 0) {
        this.record.parentId = this.recordParents.join(',')
      } else this.record.parentId = null
      const typeLabels = this.$refs['categoryCascader'].currentLabels
      if (typeLabels && typeLabels.length > 0) {
        this.record.parentName = typeLabels.join('/')
      }*/
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        resp = await add(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        this.record.children = []
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
  .handle-box {
    margin-bottom: 10px;
  }

  .handle-box .el-row {
    margin-bottom: 10px;
  }

  .handle-select {
    width: 120px;
  }

  .search-input {
    width: 180px;
    display: inline-block;
  }

  .del-dialog-cnt {
    font-size: 16px;
    text-align: center
  }

  .table {
    width: 100%;
    font-size: 14px;
  }

  .red {
    color: #ff0000;
  }
</style>
