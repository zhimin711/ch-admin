<template>
  <div class="app-container">
    <el-tabs v-model="cardId" type="card" @tab-click="handleTab">
      <el-tab-pane
        v-for="(item) in clusters"
        :key="item.id"
        :label="item.name"
        :name="item.id+''"
      >
        <!--        <el-tag>{{ item.url }}</el-tag>-->
      </el-tab-pane>
      <el-tab-pane name="0">
        <span slot="label">添加集群 <i class="el-icon-plus" /></span>
        <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="120px" style="margin-left:30px;">
          <el-form-item label="集群名称" prop="name">
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
    <el-card v-if="cardId!=='0'&&list.length>0">
      <div slot="header" class="clearfix">
        <span>集群地址： {{ cardTitle }}</span>
        <el-button icon="el-icon-refresh" style="float: right; padding: 3px 3px" type="text" @click="handleTab">刷新</el-button>
        <el-button icon="el-icon-edit" style="float: right; padding: 3px 3px" type="text" @click="handleEdit">修改</el-button>
      </div>
      <el-table
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
    </el-card>
    <el-dialog :visible.sync="isEdit" title="编辑集群信息" width="50%">
      <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="120px" style="margin-left:30px;">
        <el-form-item label="集群名称" prop="name">
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
    </el-dialog>
  </div>
</template>

<script>
import { pageNacosCluster, getNacosCluster, addNacosCluster, editNacosCluster } from '@/api/devops/nacos/cluster'

export default {
  name: 'NacosClusterNodes',
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
      rules: {
        name: [
          { required: true, message: '集群名称不能为空', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '集群地址不能为空', trigger: 'blur' }
        ]
      },
      cardId: '0',
      cardTitle: '',
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
          if (this.clusters.length > 0) {
            this.fetchDetail(this.clusters[0].id)
          }
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleTab() {
      this.fetchDetail(this.cardId)
    },
    fetchDetail(id) {
      if (id === '0') {
        this.record = {}
        return
      }
      getNacosCluster(id).then(resp => {
        if (resp.success) {
          this.record = resp.rows[0]
          this.cardId = this.record.id + ''
          this.cardTitle = this.record.url
          this.list = resp.extra.nodes
        }
      })
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
    handleEdit() {
      this.isEdit = true
    },
    handleSubmit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.submit()
        }
      })
    },
    submit() {
      if (this.isEdit) {
        editNacosCluster(this.record).then(resp => {
          if (resp.success) {
            this.$message.success('修改集群成功')
            this.fetchDetail(this.record.id)
          }
        }).finally(() => {
          this.isEdit = false
        })
      } else {
        addNacosCluster(this.record).then(resp => {
          if (resp.success) {
            this.$message.success('添加集群成功')
            this.fetchData()
            this.clusterView = resp.rows[0]
          }
        })
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
  .el-tabs {
    margin-bottom: 15px;
  }
</style>
