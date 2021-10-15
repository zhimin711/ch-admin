<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input v-model="listQuery.namespaceShowName" placeholder="命名空间名称" style="width: 200px;" class="filter-item" />-->
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      <el-button v-permission="'UPMS_NAMESPACE_ADD'" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate()">创建</el-button>
      <el-button v-permission="'UPMS_NAMESPACE_SYNC_NACOS'" class="filter-item" type="success" icon="el-icon-refresh" @click="handleSyncNacos()">同步Nacos</el-button>
    </div>
    <el-table
      v-loading="tables.a.loading"
      :data="tables.a.data"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="命名空间名称" min-width="200" prop="namespaceShowName">
        <template slot-scope="{row}">
          {{ row.name }}
          <span v-if="!row.uid">(保留空间)</span>
        </template>
      </el-table-column>
      <el-table-column label="命名空间ID" prop="uid" min-width="280" />
      <!--      <el-table-column label="配置数" width="80" align="center" prop="configCount" />-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
        <template slot-scope="{row}">
          <el-button
            v-permission="'UPMS_NAMESPACE_DETAIL'"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(row)"
          >详情</el-button>
          <el-button
            v-if="row.uid"
            v-permission="'UPMS_NAMESPACE_EDIT'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >修改</el-button>
          <el-button
            v-if="row.namespace"
            v-permission="'UPMS_NAMESPACE_DEL'"
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
        <el-form-item label="空间名称：" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item label="描述：" prop="description">
          <el-input v-model="record.description" type="textarea" />
        </el-form-item>
        <el-form-item label="同步：">
          <el-checkbox v-model="record.syncNacos">注册中心[Nacos]</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-loading="listLoading2" type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="命名空间详情"
      :visible.sync="dialogDetailVisible"
      width="40%"
    >
      <el-card class="box-card">
        <el-form ref="form" :model="record" label-width="150px">
          <el-form-item label="空间名称:">
            {{ record.name }}
          </el-form-item>
          <el-form-item label="命名空间ID:">
            {{ record.uid }}
          </el-form-item>
          <el-form-item label="配置数:">
            {{ record.configCount + ' / ' + record.quota }}
          </el-form-item>
          <el-form-item label="描述:">
            {{ record.description }}
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
import { pageNamespace, addNamespace, getNamespace, editNamespace, delNamespace, syncNacosNamespaces } from '@/api/upms/namespace'

const defaultRecord = {
  uid: null,
  name: null,
  syncNacos: true,
  description: null
}
export default {
  name: 'UpmsNamespace',
  data() {
    return {
      tables: {
        a: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        }
      },
      list: null,
      listLoading: true,
      listLoading2: false,
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
      record: Object.assign({}, defaultRecord),
      rules: {
        name: [{ required: true, message: '命名空间名称不能为空', trigger: 'change' }],
        description: [{ required: true, message: '命名空间描述不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.tables.a.loading = true
      pageNamespace(this.tables.a).then(resp => {
        if (resp.success) {
          this.tables.a.data = resp.rows
          this.tables.a.total = resp.total
        }
      }).finally(() => { this.tables.a.loading = false })
    },
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetModel() {
      this.record = Object.assign({}, defaultRecord)
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
          this.listLoading2 = true
          if (this.dialogStatus === 'create') {
            addNamespace(this.record).then(res => {
              this.handleResult(res)
            }).finally(() => { this.listLoading2 = false })
          }
          if (this.dialogStatus === 'update') {
            editNamespace(this.record).then(res => {
              this.handleResult(res)
            }).finally(() => { this.listLoading2 = false })
          }
        }
      })
    },
    handleSyncNacos() {
      this.$confirm(`确定开始同步注册中心[Nacos]的命名空间吗？`, '同步命名空间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        syncNacosNamespaces().then((res) => {
          if (res) {
            this.fetchData()
            this.$message({
              message: `同步注册中心[Nacos]命名空间成功`,
              type: 'success'
            })
          } else {
            this.$message({
              message: `同步注册中心[Nacos]命名空间失败`,
              type: 'error'
            })
          }
        })
      })
    },
    handleResult(res) {
      if (res) {
        this.dialogFormVisible = false
        this.$message({
          message: this.textMap[this.dialogStatus] + '成功',
          type: 'success'
        })
        this.fetchData()
      } else {
        this.$message({
          message: this.textMap[this.dialogStatus] + '失败',
          type: 'error'
        })
      }
    },
    handleDetail(row) {
      getNamespace(row.id).then(resp => {
        if (resp.success) {
          this.dialogDetailVisible = true
          this.record = resp.rows[0]
        }
      })
    },
    handleUpdate(row) {
      this.resetModel()
      this.record = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm(`确定要删除该命名空间[${row.namespaceShowName}]吗？`, '删除命名空间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delNamespace(row.namespace).then((res) => {
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
