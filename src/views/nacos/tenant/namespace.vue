<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input v-model="listQuery.namespaceShowName" placeholder="命名空间名称" style="width: 200px;" class="filter-item" />-->
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate()">创建</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="命名空间名称" min-width="200" prop="namespaceShowName">
        <template slot-scope="{row}">
          {{ row.namespaceShowName }}
          <span v-if="!row.namespace">(保留空间)</span>
        </template>
      </el-table-column>
      <el-table-column label="命名空间ID" prop="namespace" />
      <el-table-column label="配置数" width="80" align="center" prop="configCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(row)"
          >详情</el-button>
          <el-button
            v-if="row.namespace"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >修改</el-button>
          <el-button
            v-if="row.namespace"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="120px" style="width: 400px; margin-left:30px;">
        <el-form-item v-if="dialogStatus === 'create'" label="命名空间ID:">
          <el-input v-model="record.namespace" placeholder="不填则自动生成" />
        </el-form-item>
        <el-form-item label="命名空间名：" prop="namespaceShowName">
          <el-input v-model="record.namespaceShowName" />
        </el-form-item>
        <el-form-item label="描述：" prop="namespaceDesc">
          <el-input v-model="record.namespaceDesc" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="命名空间详情"
      :visible.sync="dialogDetailVisible"
      width="30%"
    >
      <el-card class="box-card">
        <el-form ref="form" :model="record" label-width="150px">
          <el-form-item label="命名空间名称:">
            {{ record.namespaceShowName }}
          </el-form-item>
          <el-form-item label="命名空间ID:">
            {{ record.namespace }}
          </el-form-item>
          <el-form-item label="配置数:">
            {{ record.configCount + ' / ' + record.quota }}
          </el-form-item>
          <el-form-item label="描述:">
            {{ record.namespaceDesc }}
          </el-form-item>
        </el-form>
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogDetailVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { pageNacosNamespaces, addNacosNamespaces, getNacosNamespace, updateNacosNamespaces, deleteNacosNamespaces } from '@/api/nacos/namespace'
import Pagination from '@/components/Pagination'

export default {
  name: 'NacosClusterNamespace',
  components: { Pagination },
  data() {
    return {
      list: null,
      listLoading: true,
      listLoading2: true,
      count: 0,
      listQuery: {
        page: 1,
        size: 20
      },
      dialogFormVisible: false,
      dialogDetailVisible: false,
      textMap: {
        create: '新建命名空间',
        update: '编辑命名空间'
      },
      record: {},
      rules: {
        namespaceShowName: [{ required: true, message: '命名空间名称不能为空', trigger: 'change' }],
        namespaceDesc: [{ required: true, message: '命名空间描述不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      pageNacosNamespaces(this.listQuery).then(res => {
        this.list = res.data
        this.count = res.data.count || 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetModel() {
      this.record = {}
    },
    handleCreate() {
      this.resetModel()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            const formData = new FormData()
            formData.append('customNamespaceId', this.record.namespace || '')
            formData.append('namespaceName', this.record.namespaceShowName)
            formData.append('namespaceDesc', this.record.namespaceDesc)
            // formData.append('namespaceId', '')
            addNacosNamespaces(formData).then(res => {
              this.handleResult(res)
            })
          }
          if (this.dialogStatus === 'update') {
            const formData = new FormData()
            formData.append('namespace', this.record.namespace)
            formData.append('namespaceShowName', this.record.namespaceShowName)
            formData.append('namespaceDesc', this.record.namespaceDesc)
            updateNacosNamespaces(formData).then(res => {
              this.handleResult(res)
            })
          }
        }
      })
    },
    handleResult(res) {
      if (res) {
        this.fetchData()
        this.dialogFormVisible = false
        this.$message({
          message: this.textMap[this.dialogStatus] + '成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: this.textMap[this.dialogStatus] + '失败',
          type: 'error'
        })
      }
    },
    handleDetail(row) {
      const params = { show: 'all', namespaceId: row.namespace }
      getNacosNamespace(params).then(resp => {
        if (resp) {
          this.dialogDetailVisible = true
          this.record = resp
        }
      })
    },
    handleUpdate(row) {
      this.resetModel()
      const params = { show: 'all', namespaceId: row.namespace }
      getNacosNamespace(params).then(resp => {
        if (resp) {
          this.record = Object.assign({}, resp)
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定要删除该命名空间[${row.namespaceShowName}]吗？`, '删除命名空间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNacosNamespaces(row.namespace).then((res) => {
          if (res) {
            this.fetchData()
            this.$message({
              message: `删除命名空间[${row.namespaceShowName}]成功`,
              type: 'success'
            })
          } else {
            this.$message({
              message: `删除命名空间[${row.namespaceShowName}]失败`,
              type: 'error'
            })
          }
        })
      })
    },
    handleLog(row) {
      this.$router.push('nodeServer/log?id=' + row.id)
    }
  }
}
</script>
