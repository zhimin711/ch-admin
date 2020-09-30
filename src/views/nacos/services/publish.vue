<template>
  <div class="app-container">
    <sticky :z-index="10" :class-name="'sub-navbar2 '">
      <tenant @change="queryData" />
    </sticky>
    <div class="query-container">
      <el-form :model="listQuery" :inline="true">
        <el-form-item label="服务名称">
          <el-input v-model="listQuery.serviceNameParam" placeholder="服务名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="分组名称">
          <el-input v-model="listQuery.groupNameParam" placeholder="分组名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="是否隐藏空服务">
          <el-switch
            v-model="listQuery.hasIpCount"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
      </el-form>
      <el-button class="filter-item" type="info" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate()">创建服务</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="服务名称" min-width="200" prop="name" />
      <el-table-column label="分组名称" min-width="200" prop="groupName" />
      <el-table-column label="集群数目" min-width="100" align="center" prop="clusterCount" />
      <el-table-column label="实例数" min-width="100" align="center" prop="ipCount" />
      <el-table-column label="健康实例数" min-width="100" align="center" prop="healthyInstanceCount" />
      <el-table-column class-name="status-col" label="触发保护阈值" min-width="150" align="center" prop="triggerFlag" />
      <el-table-column align="center" label="操作" min-width="150">
        <template slot-scope="{row}">
          <!--<el-button type="text" @click.native="handleDetail(row)">详情</el-button>-->
          <el-button type="text" @click.native="handleCode(row)">示例代码</el-button>
          <!--<el-button type="text" @click.native="handleUpdate(row)">编辑</el-button>-->
          <!--<el-button type="text" @click.native="onDelete(row)">删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="120px" style="width: 400px; margin-left:30px;">
        <el-form-item label="所属集群" prop="clusterId">
          <el-select v-if="dialogStatus === 'create'" v-model="record.clusterId" placeholder="选择所属集群">
            <el-option key="" label="单机" value="" />
            <!--<el-option v-for="item in canalClusters" :key="item.id" :label="item.name" :value="item.id" />-->
          </el-select>
        </el-form-item>
        <el-form-item label="Server 名称" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item label="Server IP" prop="ip">
          <el-input v-model="record.ip" />
        </el-form-item>
        <el-form-item label="admin 端口" prop="adminPort">
          <el-input v-model="record.adminPort" placeholder="11110" type="number" />
        </el-form-item>
        <el-form-item label="tcp 端口" prop="tcpPort">
          <el-input v-model="record.tcpPort" placeholder="11111" type="number" />
        </el-form-item>
        <el-form-item label="metric 端口" prop="metricPort">
          <el-input v-model="record.metricPort" placeholder="11112" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dataOperation()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="示例代码" :visible.sync="dialogVisible2Code" width="80%">
      <code-viewer v-model="record" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Code = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { pageNacosServices, updateNodeServer, deleteNodeServer } from '@/api/nacos/services'
import Pagination from '@/components/Pagination'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/tenant' // 粘性header组件
import CodeViewer from '../components/showCodeService' // 粘性header组件

export default {
  name: 'NacosServices1',
  components: { Pagination, Sticky, Tenant, CodeViewer },
  data() {
    return {
      list: [],
      activeName: null,
      instanceList: null,
      listLoading: true,
      listLoading2: true,
      count: 0,
      listQuery: {
        hasIpCount: true,
        withInstances: false,
        pageNo: 1,
        pageSize: 20
      },
      dialogFormVisible: false,
      dialogVisible2Code: false,
      textMap: {
        create: '新建Server信息',
        update: '修改Server信息'
      },
      record: {},
      rules: {
        name: [{ required: true, message: 'Server 名称不能为空', trigger: 'change' }],
        ip: [{ required: true, message: 'Server IP不能为空', trigger: 'change' }],
        adminPort: [{ required: true, message: 'Server admin端口不能为空', trigger: 'change' }]
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
      this.listQuery.namespaceId = this.$store.getters.tenant
      pageNacosServices(this.listQuery).then(res => {
        this.list = res.serviceList
        this.count = res.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetModel() {
      this.record = {
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
      this.resetModel()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCode(row) {
      this.record = Object.assign({}, row)
      this.record.content = undefined
      this.dialogVisible2Code = true
    },
    dataOperation() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            // addNodeServer(this.record).then(res => {
            //   this.operationRes(res)
            // })
          }
          if (this.dialogStatus === 'update') {
            updateNodeServer(this.record).then(res => {
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
    handleConfig(row) {
      if (row.canalCluster !== null) {
        this.$message({ message: '集群模式Server不允许单独变更配置，请在集群配置变更', type: 'error' })
        return
      }
      this.$router.push('/canalServer/nodeServer/config?serverId=' + row.id)
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
      this.$confirm('删除Server信息会导致节点服务停止', '确定删除Server信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNodeServer(row.id).then((res) => {
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
<style lang="scss" scoped>
  .el-menu-namespace .el-menu-item {
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
  }
</style>
