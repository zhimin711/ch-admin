<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form ref="queryForm" :model="listQuery" :inline="true">
        <el-form-item label="Data ID">
          <el-input v-model="listQuery.dataId" placeholder="请输入Data ID" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="Group">
          <el-input v-model="listQuery.group" placeholder="请输入Group" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate()">创建配置</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="Data Id" min-width="200" prop="dataId" />
      <el-table-column label="Group" min-width="200" prop="group" />
      <el-table-column label="归属应用" min-width="100" prop="appName" />
      <el-table-column align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="{row}">
          <el-button type="text" @click.native="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="fetchData()" />
  </div>
</template>

<script>
import { pageNacosConfigs, addNacosConfigs, updateNacosConfigs, deleteNacosConfigs } from '@/api/nacos/configs'
import Pagination from '@/components/Pagination'

export default {
  name: 'NacosConfigs1',
  components: { Pagination },
  data() {
    return {
      list: null,
      instanceList: null,
      listLoading: true,
      listLoading2: true,
      serverIdTmp: null,
      canalClusters: [],
      count: 0,
      listQuery: {
        search: 'accurate',
        namespaceId: '',
        dataId: '',
        group: '',
        pageNo: 1,
        pageSize: 10
      },
      dialogFormVisible: false,
      dialogInstances: false,
      textMap: {
        create: '新建Server信息',
        update: '修改Server信息'
      },
      nodeModel: {
      },
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      pageNacosConfigs(this.listQuery).then(res => {
        this.list = res.pageItems
        this.count = res.totalCount
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.listQuery.pageNo = 1
          this.fetchData()
        }
      })
    },
    resetModel() {
      this.nodeModel = {
        id: undefined,
        clusterId: null,
        name: null,
        ip: null,
        adminPort: null,
        tcpPort: null,
        metricPort: null
      }
    },
    handleCreate() {
      this.$router.push('/nacos/configs/add?namespaceId=')
    },
    dataOperation() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            addNacosConfigs(this.nodeModel).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateNacosConfigs(this.nodeModel).then(res => {
              this.operationRes(res)
            })
          }
        }
      })
    },
    operationRes(res) {
      if (res.data === 'success') {
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
      this.$router.push(`/nacos/configs/detail?namespaceId=${row.namespaceId || ''}&dataId=${row.dataId}&group=${row.group}`)
    },
    handleUpdate(row) {
      this.resetModel()
      this.nodeModel = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除Server信息会导致节点服务停止', '确定删除Server信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNacosConfigs(row.id).then((res) => {
          if (res.data === 'success') {
            this.fetchData()
            this.$message({
              message: '删除Server信息成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除Server信息失败',
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
