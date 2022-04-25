<template>
  <div class="app-container">
    <el-tabs v-model="clusterView" type="card">
      <el-tab-pane
        v-for="(item) in clusters"
        :key="item.id"
        :label="item.name"
        :name="item.id"
      >
        {{ item.name }}
      </el-tab-pane>
      <el-tab-pane name="0">
        <span slot="label">添加集群 <i class="el-icon-plus" /></span>
        <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="120px" style="margin-left:30px;">
          <el-form-item label="集群名称">
            <el-input v-model="record.name" placeholder="集群名称" />
          </el-form-item>
          <el-form-item label="集群地址" prop="url">
            <el-input v-model="record.url" placeholder="localhost:8848" />
          </el-form-item>
          <el-form-item label="描述：" prop="description">
            <el-input v-model="record.description" type="textarea" />
          </el-form-item>
          <el-form-item>
            <el-button v-loading="loading2" type="primary" @click="handleSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <el-table
      v-if="list.length>0"
      ref="table"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="节点IP" prop="address" />
      <el-table-column label="节点状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.state }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="节点元数据" width="150">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-view" @click="toggleExpand(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="1">
        <template slot-scope="{row}">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>节点元数据</span>
            </div>
            <div class="text item">
              <pre>{{ row.extendInfo }}</pre>
            </div>
          </el-card>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { pageNacosCluster, getNacosCluster, addNacosCluster, editNacosCluster } from '@/api/upms/nacos/cluster'

export default {
  name: 'NacosClusterNodes1',
  filters: {
    statusFilter(status) {
      const statusMap = {
        'UP': 'success',
        'DOWN': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      clusters: [],
      rules: [],
      clusterView: '',
      record: {},
      list: [],
      listLoading: true,
      loading2: false,
      isEdit: false,
      listQuery: {
        page: 1,
        size: 10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      pageNacosCluster(this.listQuery).then(resp => {
        if (resp.success) {
          this.clusters = resp.rows
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    fetchDetail(id) {
      getNacosCluster(id).then(resp => {})
    },
    toggleExpand(row) {
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.address !== item.address) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    handleSubmit() {
      if (this.isEdit) {
        editNacosCluster(this.record).then(resp => {
          if (resp.success) {
            this.fetchData()
            this.clusterView = resp.rows[0]
          }
        })
      } else {
        addNacosCluster(this.record)
      }
    }
  }
}
</script>
<style scoped>
  .el-card pre {
    display: block;
    padding: 9.5px;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.428571429;
    color: #333333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #cccccc;
    border-radius: 4px;
  }
</style>
