<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.params.clusterId" placeholder="Nacos集群" class="filter-item" clearable>
        <el-option v-for="item in clusters" :key="item.value" :value="item.value" :label="item.label">{{ item.label }}</el-option>
      </el-select>
      <!--      <el-input v-model="listQuery.paramss.name" placeholder="命名空间名称" style="width: 200px;" class="filter-item" />-->
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      <el-button v-permission="'NacosTenantNamespaceAdd'" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate()">创建</el-button>
      <el-button v-permission="'NacosTenantNamespaceSync'" class="filter-item" type="success" icon="el-icon-refresh" @click="handleSyncNacos()">同步Nacos命名空间</el-button>
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
          {{ row.name }}
          <span v-if="!row.uid">(保留空间)</span>
        </template>
      </el-table-column>
      <el-table-column label="命名空间ID" prop="uid" />
      <el-table-column label="配置数" width="80" align="center" prop="configCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
        <template slot-scope="{row}">
          <el-button
            v-permission="'NacosTenantNamespaceDetail'"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(row)"
          >详情</el-button>
          <el-button
            v-if="row.uid"
            v-permission="'NacosTenantNamespaceEdit'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >修改</el-button>
          <el-button
            v-if="row.uid"
            v-permission="'NacosTenantNamespaceDelete'"
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
        <el-form-item label="Nacos集群：">
          <el-select v-model="record.clusterId" placeholder="Nacos集群" class="filter-item" clearable>
            <el-option v-for="item in clusters" :key="item.value" :value="item.value" :label="item.label">
              {{ item.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="命名空间ID:">
          <el-input v-model="record.uid" placeholder="不填则自动生成" />
        </el-form-item>
        <el-form-item label="命名空间名：" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item label="描述：" prop="description">
          <el-input v-model="record.description" type="textarea" />
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
      width="60%"
    >
      <el-card class="box-card">
        <el-form ref="form" :model="record" label-width="150px">
          <el-form-item label="命名空间名称:">
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
    <el-dialog :visible.sync="dialogSyncVisible" title="同步Nacos命名空间" width="600px">
      <el-form ref="dataForm" :model="record" label-position="left" label-width="120px" style="width: 400px; margin-left:30px;">
        <el-form-item label="Nacos集群：">
          <el-select v-model="record.clusterId" placeholder="Nacos集群" class="filter-item" clearable>
            <el-option v-for="item in clusters" :key="item.value" :value="item.value" :label="item.label">
              {{ item.label }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert
        :closable="false"
        title="注意：将同步选择Nacos集群所有命名空间"
        type="info"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSyncVisible = false">取消</el-button>
        <el-button v-loading="listLoading2" type="primary" @click="submitSyncNacos">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageNacosNamespaces,
  addNacosNamespace,
  getNacosNamespace,
  updateNacosNamespace,
  deleteNacosNamespace,
  syncNacosNamespaces
} from '@/api/devops/nacos/namespaces'

import { listNacosCluster } from '@/api/devops/nacos/cluster'

export default {
  name: 'NacosClusterNamespace',
  data() {
    return {
      list: null,
      listLoading: true,
      listLoading2: false,
      count: 0,
      listQuery: {
        params: {},
        page: 1,
        size: 20
      },
      dialogFormVisible: false,
      dialogDetailVisible: false,
      dialogSyncVisible: false,
      textMap: {
        create: '新建命名空间',
        update: '编辑命名空间'
      },
      record: {},
      clusters: [],
      rules: {
        name: [{ required: true, message: '命名空间名称不能为空', trigger: 'change' }],
        description: [{ required: true, message: '命名空间描述不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  created() {
    this.loadData()
    this.fetchData()
  },
  methods: {
    loadData() {
      listNacosCluster().then(resp => {
        if (resp.success) {
          this.clusters = resp.rows
        }
      })
    },
    fetchData() {
      this.listLoading = true
      pageNacosNamespaces(this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.count = resp.total
        }
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
          this.listLoading2 = true
          if (this.dialogStatus === 'create') {
            addNacosNamespace(this.record).then(res => {
              this.handleResult(res)
            }).finally(() => { this.listLoading2 = false })
          }
          if (this.dialogStatus === 'update') {
            updateNacosNamespace(this.record).then(res => {
              this.handleResult(res)
            }).finally(() => { this.listLoading2 = false })
          }
        }
      })
    },
    handleResult(res) {
      if (res.success) {
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
      getNacosNamespace(row.id).then(resp => {
        if (resp.success) {
          this.dialogDetailVisible = true
          this.record = resp.rows[0]
        }
      })
    },
    handleUpdate(row) {
      this.resetModel()
      getNacosNamespace(row.id).then(resp => {
        if (resp.success) {
          this.record = Object.assign({}, resp.rows[0])
          this.record.clusterId = this.record.clusterId + ''
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定要删除该命名空间[${row.name}]吗？`, '删除命名空间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNacosNamespace(row.id).then((resp) => {
          if (resp.success) {
            this.fetchData()
            this.$message({
              message: `删除命名空间成功`,
              type: 'success'
            })
          } else {
            this.$message({
              message: `删除命名空间失败`,
              type: 'error'
            })
          }
        })
      })
    },
    handleSyncNacos() {
      this.dialogSyncVisible = true
      this.record = {}
    },
    submitSyncNacos() {
      if (!this.record.clusterId) {
        this.$message.warning('请选择集群...')
        return
      }
      this.$confirm(`确定开始同步注册中心[Nacos]的命名空间吗？`, '同步命名空间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading2 = true
        syncNacosNamespaces(this.record.clusterId).then((resp) => {
          if (resp) {
            this.dialogSyncVisible = false
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
        }).finally(() => {
          this.listLoading2 = false
        })
      })
    }
  }
}
</script>
