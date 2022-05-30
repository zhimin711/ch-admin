<template>
  <div class="app-container">
    <sticky :z-index="10" :class-name="'sub-navbar3 '">
      <tenant v-model="namespaceId" @change="queryData" />
    </sticky>
    <div class="query-container">
      <el-form ref="queryForm" :model="listQuery" :inline="true" :rules="rules">
        <el-form-item label="服务名称" prop="serviceName">
          <el-input v-model="listQuery.serviceName" placeholder="服务名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="listQuery.groupName" placeholder="分组名称" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="地址" min-width="200" prop="addrStr" />
      <el-table-column label="客户端版本" min-width="200" prop="agent" />
      <el-table-column label="应用名" prop="app" />
      <el-table-column label="服务名" prop="serviceName" />
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />
  </div>
</template>

<script>
import { pageNacosSubscribes } from '@/api/devops/nacos/subscribers'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/clusterNamespaces' // 粘性header组件

export default {
  name: 'NacosServiceSubscribers',
  components: { Sticky, Tenant },
  data() {
    return {
      namespaceId: null,
      list: null,
      listLoading: false,
      count: 0,
      listQuery: {
        groupName: 'DEFAULT_GROUP',
        pageNo: 1,
        pageSize: 20
      },
      rules: {
        serviceName: [{ required: true, message: '服务名称不能为空', trigger: 'change' }],
        groupName: [{ required: true, message: '分组名称不能为空', trigger: 'change' }]
      }
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
  },
  methods: {
    fetchData() {
      this.listLoading = true
      this.listQuery.namespaceId = this.namespaceId
      pageNacosSubscribes(this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.count = resp.total
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      if (this.namespaceId <= 0) {
        this.$message.error('请选择空间')
        return
      }
      this.listQuery.pageNo = 1
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.fetchData()
        }
      })
    }
  }
}
</script>
