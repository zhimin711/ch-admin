<template>
  <div class="app-container">
    <!--    <el-tabs v-model="activeName" @tab-click="handleNameSpaceClick" type="border-card">
      <el-tab-pane label="用户管理" name="first"></el-tab-pane>
      <el-tab-pane label="配置管理" name="second"></el-tab-pane>
      <el-tab-pane label="角色管理" name="third"></el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth"></el-tab-pane>
    </el-tabs>-->
    <div class="filter-container">
      <!--      <el-select v-model="listQuery.namespaceId" placeholder="所属集群" class="filter-item">
        <el-option v-for="item in namespaces" :key="item.namespace" :label="item.namespaceShowName" :value="item.namespace" />
      </el-select>-->
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
      <el-table-column align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-dropdown trigger="click">
            <el-button type="primary" size="mini">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <!--<el-dropdown-item v-if="checkPermission2(['CANAL_SERVER_INSTANCES'])" @click.native="handleConfig(scope.row)">配置</el-dropdown-item>-->
              <el-dropdown-item v-if="checkPermission2(['CANAL_SERVERS_EDIT'])" @click.native="handleUpdate(scope.row)">修改</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_SERVERS_DELETE'])" @click.native="handleDelete(scope.row)">删除</el-dropdown-item>
              <el-dropdown-item @click.native="handleLog(scope.row)">日志</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="nodeModel" label-position="left" label-width="120px" style="width: 400px; margin-left:30px;">
        <el-form-item label="所属集群" prop="clusterId">
          <el-select v-if="dialogStatus === 'create'" v-model="nodeModel.clusterId" placeholder="选择所属集群">
            <el-option key="" label="单机" value="" />
            <!--<el-option v-for="item in canalClusters" :key="item.id" :label="item.name" :value="item.id" />-->
          </el-select>
        </el-form-item>
        <el-form-item label="Server 名称" prop="name">
          <el-input v-model="nodeModel.name" />
        </el-form-item>
        <el-form-item label="Server IP" prop="ip">
          <el-input v-model="nodeModel.ip" />
        </el-form-item>
        <el-form-item label="admin 端口" prop="adminPort">
          <el-input v-model="nodeModel.adminPort" placeholder="11110" type="number" />
        </el-form-item>
        <el-form-item label="tcp 端口" prop="tcpPort">
          <el-input v-model="nodeModel.tcpPort" placeholder="11111" type="number" />
        </el-form-item>
        <el-form-item label="metric 端口" prop="metricPort">
          <el-input v-model="nodeModel.metricPort" placeholder="11112" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dataOperation()">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogInstances" title="instance 列表" width="800px">
      <div class="filter-container">
        <el-button class="filter-item" type="info" @click="activeInstances()">刷新列表</el-button>
      </div>
      <el-table
        v-loading="listLoading2"
        :data="instanceList"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="Instance 名称" min-width="200" align="center">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="200" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.runningStatus | statusFilter">{{ scope.row.runningStatus | statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template slot-scope="scope">
            <el-dropdown trigger="click">
              <el-button type="primary" size="mini">
                操作<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleStartInstance(scope.row)">启动</el-dropdown-item>
                <el-dropdown-item @click.native="handleStopInstance(scope.row)">停止</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { pageNacosServices, updateNodeServer, deleteNodeServer } from '@/api/nacos/services'
import { pageNacosNamespaces } from '@/api/nacos/namespace'
import Pagination from '@/components/Pagination'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数

export default {
  name: 'NacosServices',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '1': 'success',
        '0': 'gray',
        '-1': 'danger'
      }
      return statusMap[status]
    },
    statusLabel(status) {
      const statusMap = {
        '1': '启动',
        '0': '停止',
        '-1': '断开'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      activeName: null,
      instanceList: null,
      listLoading: true,
      listLoading2: true,
      serverIdTmp: null,
      namespaces: [],
      count: 0,
      listQuery: {
        hasIpCount: true,
        withInstances: false,
        pageNo: 1,
        pageSize: 20
      },
      dialogFormVisible: false,
      dialogInstances: false,
      textMap: {
        create: '新建Server信息',
        update: '修改Server信息'
      },
      nodeModel: {
        id: undefined,
        clusterId: null,
        name: null,
        ip: null,
        adminPort: 11110,
        tcpPort: 11111,
        metricPort: 11112
      },
      rules: {
        name: [{ required: true, message: 'Server 名称不能为空', trigger: 'change' }],
        ip: [{ required: true, message: 'Server IP不能为空', trigger: 'change' }],
        adminPort: [{ required: true, message: 'Server admin端口不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
    pageNacosNamespaces().then((res) => {
      this.namespaces = res.data
      this.listQuery.namespaceId = this.namespaces[0].namespaceId
      this.fetchData()
    })
  },
  methods: {
    checkPermission2,
    fetchData() {
      this.listLoading = true
      pageNacosServices(this.listQuery).then(res => {
        this.list = res.serviceList
        this.count = res.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleNameSpaceClick() {
      this.listQuery.page = 1
      this.fetchData()
    },
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
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
      this.resetModel()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleInstances(row) {
      this.serverIdTmp = row.id
      this.activeInstances()
    },
    dataOperation() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            // addNodeServer(this.nodeModel).then(res => {
            //   this.operationRes(res)
            // })
          }
          if (this.dialogStatus === 'update') {
            updateNodeServer(this.nodeModel).then(res => {
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
