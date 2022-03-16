<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="listQuery.params.keywords" placeholder="关键字" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.params.status" clearable placeholder="状态">
            <el-option key="1" label="启用" value="1" />
            <el-option key="2" label="禁用" value="0" />
          </el-select>

        </el-form-item>
      </el-form>
      <div class="handle-box">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="listQuery.params = {}">重置</el-button>
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="handleAdd">新增</el-button>
            <!--<el-button type="primary" icon="el-icon-download" class="handle-del mr10">导出</el-button>-->
          </el-col>
        </el-row>
      </div>
      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column label="名称">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="代码" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === '0'" type="warning">禁用</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="success">启用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button v-if="checkPermission2(['WIKI_CATEGORY_EDIT'])" type="text" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑
            </el-button>
            <el-button v-if="checkPermission2(['WIKI_CATEGORY_DEL'])" type="text" icon="el-icon-delete" class="red" @click="handleDel(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    </div>

    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改分类':'新增分类'">
      <el-form ref="baseForm" :model="record" :rules="rules" label-width="100px">
        <el-form-item label="上级">
          <el-cascader ref="categoryCascader" v-model="recordParents" :options="options.parents" :show-all-levels="false" :props="recordParentsProps" clearable />
          <el-icon v-show="dialogLoadingVisible" class="el-icon-loading" />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="record.code" :disabled="recordForm.codeDisabled" placeholder="不区分大小写（自动转换大写：EXAMPLE）" />
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-col :span="12">
            <el-input v-model="record.name" />
          </el-col>
        </el-form-item>
        <el-form-item label="标签" prop="keywords">
          <el-input v-model="record.keywords" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="record.sort" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="record.description" type="textarea" />
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
        <el-form-item prop="image" style="margin-bottom: 30px;" label-width="100px" label="分类图:">
          <el-row>
            <el-col :span="24">
              <UploadImageCrop v-model="record.image" title="分类图裁剪及上传" :data="{srcType: 'CLASSIFY_COVER', action: 'scale'}" :append-to-body="true" :aspect-ratio="1.6" height="200px" />
            </el-col>
            <el-col :span="24" style="margin-left: 50px; margin-top: 5px;">
              <el-button icon="el-icon-folder-checked" @click="imageSelectVisible = true">图片选择</el-button>
              <ImageSelector v-model="record.image" title="分类图选择" :show.sync="imageSelectVisible" type="CLASSIFY_COVER" image-height="275px" :append-to-body="true" />
            </el-col>
          </el-row>
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

import UploadImageCrop from '@/components/Upload/SingleImageCrop'
import ImageSelector from '@/components/ImageSelector'

import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { fetchClassifyTree, fetchClassifyList, addClassify, editClassify, delClassify } from '@/api/wiki/category'

export default {
  name: 'WikiCategory',
  components: { Pagination, UploadImageCrop, ImageSelector },
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
      recordStatus: true,
      recordParents: [],
      recordParentsProps: {
        checkStrictly: true
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
      imageSelectVisible: false,
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
    this.getTree('0')
  },
  methods: {
    checkPermission2,
    getTree(type) {
      // this.options.parents = []
      this.dialogLoadingVisible = true
      fetchClassifyTree(type).then(response => {
        this.dialogLoadingVisible = false
        this.options.parents = response.rows

        if (this.record.pid && this.recordType === type) {
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
      fetchClassifyList(this.listQuery).then(response => {
        this.list = response.rows
        this.listQuery.total = response.total
        this.loading = false
      }).finally(() => { this.loading = false })
    },
    handleAdd() {
      this.record = { sort: 1 }
      this.recordParents = []

      this.dialogType = 'new'
      this.dialogVisible = true
      this.recordStatus = true
      this.recordForm.codeDisabled = false
      this.recordForm.urlDisabled = false
      this.recordForm.descDisabled = true
      this.recordForm.redirectShow = true
    },
    handleEdit(row, index) {
      this.record = deepClone(row)
      this.recordType = row.type
      this.recordParents = this.record.pid.split(',')
      if (this.record.pid === '0') this.record.pid = undefined
      this.recordStatus = (this.record.status === '1')
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
          await delClassify(row.id)
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
      if (this.recordParents.length > 0) {
        this.record.pid = this.recordParents.join(',')
      } else this.record.pid = null
      this.record.status = '0'
      if (this.recordStatus) this.record.status = '1'
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        resp = await addClassify(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        this.record.children = []
        resp = await editClassify(this.record.id, this.record).catch(() => {})
      }
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.record.name} success!`
        })
        _this.getList()
        _this.getTree('0')
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
