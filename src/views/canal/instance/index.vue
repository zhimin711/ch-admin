<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="Instance 名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.clusterServerId" placeholder="所属集群/主机" class="filter-item">
        <el-option key="" label="所属集群/主机" value="" />
        <el-option-group v-for="group in options" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
        </el-option-group>
      </el-select>
      <el-button v-if="checkPermission2(['CANAL_INSTANCE_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      &nbsp;&nbsp;
      <el-button v-if="checkPermission2(['CANAL_INSTANCE_ADD'])" class="filter-item" type="primary" @click="handleCreate()">新建 Instance</el-button>
      <el-button v-if="checkPermission2(['CANAL_INSTANCE_SEARCH'])" class="filter-item" type="info" @click="fetchData()">刷新列表</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
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
      <el-table-column label="所属集群" min-width="200" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.canalCluster !== null">
            {{ scope.row.canalCluster.name }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="所属主机" min-width="200" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.nodeServer !== null">
            {{ scope.row.nodeServer.name }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" min-width="150" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.runningStatus | statusFilter">{{ scope.row.runningStatus | statusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" min-width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.modifiedTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-dropdown trigger="click">
            <el-button type="primary" size="mini">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="checkPermission2(['CANAL_INSTANCE_EDIT'])" @click.native="handleUpdate(scope.row)">修改</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_INSTANCE_DELETE'])" @click.native="handleDelete(scope.row)">删除</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_INSTANCE_OPTION'])" @click.native="handleStart(scope.row)">启动</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_INSTANCE_OPTION'])" @click.native="handleStop(scope.row)">停止</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_INSTANCE_LOG_Q'])" @click.native="handleLog(scope.row)">日志</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_INSTANCE_META_POS_EDIT'])" @click.native="handleCursor(scope.row)">游标</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />

    <el-dialog :visible.sync="dialogFormVisible" title="游标信息" width="50%">
      <el-form ref="dataForm" :model="metaPosition" label-position="left" label-width="120px" style=" margin-left:30px;">
        <el-form-item label="游标地址">
          <el-input v-model="metaPosition.identity.sourceAddress" disabled />
        </el-form-item>
        <el-form-item label="游标Binlog">
          <el-input v-model="metaPosition.postion.journalName" />
          <span class="form-item-desc">
            <b class="el-alert el-alert--info">show binary logs;</b>可查询当前实例Binlog
          </span>
        </el-form-item>
        <el-form-item label="当前游标位置">
          <el-input v-model="metaPosition.postion.position" />
          <span class="form-item-desc">
            <b class="el-alert el-alert--info" style="font-size: 12px">show BINLOG EVENTS in '{{ metaPosition.postion.journalName }}' from {{ metaPosition.postion.position }};</b>
            可查询Binlog可用位置
          </span>
        </el-form-item>
        <el-form-item label="游标时间戳">
          <!--<el-input v-model="metaPosition.postion.timestamp" disabled />-->
          <el-date-picker v-model="metaPosition.postion.timestamp" type="datetime" value-format="timestamp" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCursorUpdate()">更新</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogFormVisible2" :title="textMap[dialogStatus]" width="80%">
      <el-form ref="data2Form" :rules="rules" :model="canalInstanceConfig" label-position="left" label-width="150px">
        <el-form-item label="实例名称" prop="name">
          <el-input v-model="canalInstanceConfig.name" :disabled="dialogStatus === 'update'" />
        </el-form-item>
        <el-form-item label="集群/主机">
          <el-select v-model="canalInstanceConfig.clusterServerId" placeholder="所属集群/主机">
            <el-option-group v-for="group in options" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="基础配置" name="first">
            <el-form-item label="数据域名或IP" prop="canalInstanceMasterAddress">
              <el-input v-model="canalInstanceConfig.canalInstanceMasterAddress" />
            </el-form-item>
            <el-form-item label="编码">
              <el-input v-model="canalInstanceConfig.canalInstanceConnectionCharset" disabled />
            </el-form-item>
            <el-form-item label="用户名" prop="canalInstanceDbUsername">
              <el-input v-model="canalInstanceConfig.canalInstanceDbUsername" />
            </el-form-item>
            <el-form-item label="密码" prop="canalInstanceDbPassword">
              <el-input v-model="canalInstanceConfig.canalInstanceDbPassword" />
            </el-form-item>
            <el-form-item label="Druid加密">
              <el-switch
                v-model="canalInstanceConfig.canalInstanceEnableDruid"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            <el-form-item v-if="canalInstanceConfig.canalInstanceEnableDruid" label="公钥">
              <el-input v-model="canalInstanceConfig.canalInstancePwdPublicKey" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="规则配置" name="second">
            <el-form-item label="默认MQ队列">
              <el-input v-model="canalInstanceConfig.canalMqTopic" />
            </el-form-item>
            <el-form-item label="默认MQ分区">
              <el-input v-model="canalInstanceConfig.canalMqPartition" />
            </el-form-item>
            <el-form-item label="同步表规则">
              <el-table
                :data="canalInstanceConfig.tableRules"
                border
                style="width: 100%; margin-bottom: 10px;"
              >
                <el-table-column prop="schema" label="数据库" width="180">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.schemaName" class="edit-input" size="small" placeholder="数据库（schema）" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="tableName" label="表名">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.tableName" class="edit-input" size="small" placeholder="表名" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="mqCluster" label="Mq集群">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.mqCluster" class="edit-input" size="small" placeholder="Mq集群" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="mqTopic" label="Mq主题">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.mqTopic" class="edit-input" size="small" placeholder="Mq主题" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="mqPartitionsNum" label="Mq分区数" width="95">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.mqPartitionsNum" class="edit-input" size="small" placeholder="分区数" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="mqPartitionHash" label="Mq分区哈希">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.mqPartitionHash" class="edit-input" size="small" placeholder="表列名（id^name）" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="100">
                  <template slot-scope="scope">
                    <el-link type="primary" @click="handleAddNode(scope.$index)">
                      添加
                    </el-link>
                    <el-link v-if="scope.$index>0" type="danger" @click="handleDelNode(scope.$index)">
                      删除
                    </el-link>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeAndReset()">取消</el-button>
        <el-button type="primary" @click="submitCanalInstanceConfig()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCanalInstances, deleteCanalInstanceTemplate, getCanalInstanceTemplate, addCanalInstanceTemplate, updateCanalInstanceTemplate, instanceStatus, getRedisPosition, updateRedisPosition } from '@/api/canal/instance'
import Pagination from '@/components/Pagination'
import { getClustersAndServers } from '@/api/canal/cluster'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { isEmpty } from '@/utils/validate'

const defaultRecord = {
  canalInstanceFilterRegex: '.*\\..*',
  canalMqPartition: 0,
  canalInstanceConnectionCharset: 'UTF-8'
}
export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '1': 'success',
        '0': 'gray'
      }
      return statusMap[status]
    },
    statusLabel(status) {
      const statusMap = {
        '1': '启动',
        '0': '停止'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogFormVisible: false,
      nodeServices: [],
      count: 0,
      options: [],
      listQuery: {
        name: '',
        clusterServerId: '',
        page: 1,
        size: 20
      },
      metaPosition: { identity: {}, postion: {}},
      currentId: null,
      canalInstanceConfig: {},
      textMap: {
        create: '新建实例配置信息',
        update: '编辑实例配置信息'
      },
      dialogStatus: 'create',
      dialogFormVisible2: false,
      activeName: 'first',
      dbTables: [],
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
        // cluster: [{ required: true, message: '集群／主机不能为空', trigger: 'change' }],
        canalInstanceMasterAddress: [{ required: true, message: '数据连接不能为空', trigger: 'change' }],
        canalInstanceDbUsername: [{ required: true, message: '用户不能为空', trigger: 'change' }],
        canalInstanceDbPassword: [{ required: true, message: '密码不能为空', trigger: 'change' }],
        id: [{ required: true, message: '请选择运行Server', trigger: 'change' }]
      }
    }
  },
  created() {
    getClustersAndServers().then((res) => {
      this.options = res.data
    })
    this.fetchData()
  },
  methods: {
    checkPermission2,
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      getCanalInstances(this.listQuery).then(res => {
        this.list = res.data.items
        this.count = res.data.count
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleCreate() {
      // this.$router.push('/canalServer/canalInstance/add')
      this.dialogStatus = 'create'
      this.canalInstanceConfig = Object.assign({}, defaultRecord)
      this.initConfig()
      this.dialogFormVisible2 = true
    },
    handleUpdate(row) {
      // this.$router.push('/canalServer/canalInstance/modify?id=' + row.id)
      this.dialogStatus = 'update'
      getCanalInstanceTemplate(row.id).then(resp => {
        this.canalInstanceConfig = resp.data
        // this.dbTables = [{}]
        this.initConfig()
        this.dialogFormVisible2 = true
      })
    },
    initConfig() {
      this.activeName = 'first'
      if (this.canalInstanceConfig.clusterId) {
        this.canalInstanceConfig.clusterServerId = 'cluster:' + this.canalInstanceConfig.clusterId
      } else if (this.canalInstanceConfig.serverId) {
        this.canalInstanceConfig.clusterServerId = 'server:' + this.canalInstanceConfig.serverId
      }
      if (this.canalInstanceConfig.tableRules && this.canalInstanceConfig.tableRules.length > 0) {
        return
      } else {
        this.canalInstanceConfig.tableRules = []
      }
      if (!isEmpty(this.canalInstanceConfig.canalInstanceFilterRegex)) {
        const tables = this.canalInstanceConfig.canalInstanceFilterRegex.split(',')
        tables.forEach((row) => {
          const arr = row.split('\\.')
          this.canalInstanceConfig.tableRules.push({ schemaName: arr[0], tableName: arr[1] })
        })
      } else {
        this.handleAddNode()
      }
    },
    submitCanalInstanceConfig() {
      if (this.dialogStatus === 'update') {
        this.$confirm(
          '修改Instance配置可能会导致重启，是否继续？',
          '确定修改',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.dataOperation2()
        })
      } else {
        this.dataOperation2()
      }
    },
    dataOperation2() {
      let ruleOk = true
      this.canalInstanceConfig.tableRules.forEach((row, index) => {
        if (isEmpty(row.schemaName) && isEmpty(row.tableName)) {
          ruleOk = false
        }
      })
      if (!ruleOk) {
        this.$message.error(`同步数据库或表名不能为空，请检查！`)
        return
      }
      this.$refs['data2Form'].validate((valid) => {
        if (valid) {
          if (isEmpty(this.canalInstanceConfig.clusterServerId)) {
            this.$message.error(`集群／主机不能为空，请检查！`)
            return false
          }
          if (this.canalInstanceConfig.clusterServerId.startsWith('cluster:')) {
            this.canalInstanceConfig.clusterId = this.canalInstanceConfig.clusterServerId.substring(8)
          } else if (this.canalInstanceConfig.clusterServerId.startsWith('server:')) {
            this.canalInstanceConfig.clusterId = this.canalInstanceConfig.clusterServerId.substring(7)
          }
          if (this.dialogStatus === 'update') {
            updateCanalInstanceTemplate(this.canalInstanceConfig).then(res => {
              this.operationRes(res)
            })
          } else {
            addCanalInstanceTemplate(this.canalInstanceConfig).then(res => {
              this.operationRes(res)
            })
          }
        }
      })
    },
    operationRes(res, noRefresh) {
      if (res.data === 'success') {
        if (!noRefresh) this.queryData()
        this.closeAndReset()
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
    closeAndReset() {
      this.dialogFormVisible2 = false
      this.$refs['data2Form'].resetFields()
    },
    handleDelete(row) {
      this.$confirm('删除Instance配置会导致停止', '确定删除Instance信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCanalInstanceTemplate(row.id).then((res) => {
          if (res.data === 'success') {
            this.fetchData()
            this.$message({
              message: '删除Instance信息成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除Instance信息失败',
              type: 'error'
            })
          }
        })
      })
    },
    handleStart(row) {
      // if (row.runningStatus === '1') {
      //   this.$message({ message: '当前Instance已处于启动状态！', type: 'error' })
      //   return
      // }
      this.$confirm('启动Instance: ' + row.name, '确定启动Instance服务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        instanceStatus(row.id, 'start').then((res) => {
          if (res.data) {
            this.fetchData()
            this.$message({
              message: '启动成功, 稍后请刷新列表查看状态',
              type: 'success'
            })
          } else {
            this.$message({
              message: '启动Instance出现异常',
              type: 'error'
            })
          }
        })
      })
    },
    handleStop(row) {
      // if (row.runningStatus === '0') {
      //   this.$message({ message: '当前Instance已处于停止状态！', type: 'error' })
      //   return
      // }
      this.$confirm('停止Instance: ' + row.name, '确定停止Instance服务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        instanceStatus(row.id, 'stop').then((res) => {
          if (res.data) {
            this.fetchData()
            this.$message({
              message: '停止成功, 稍后请刷新列表查看状态',
              type: 'success'
            })
          } else {
            this.$message({
              message: '停止Instance出现异常',
              type: 'error'
            })
          }
        })
      })
    },
    handleLog(row) {
      if (row.nodeServer === null) {
        this.$message({ message: '当前Instance不是启动状态，无法查看日志', type: 'warning' })
        return
      }
      this.$router.push('instance/log?id=' + row.id + '&nodeId=' + row.nodeServer.id)
    },
    handleCursor(row) {
      this.listLoading = true
      getRedisPosition(row.id).then(res => {
        if (res.data) {
          this.metaPosition = res.data
          this.metaPosition.instanceId = row.id
          this.metaPosition.isStop = row.nodeServer === null
          this.dialogFormVisible = true
        } else {
          this.$message({ message: '当前Instance Meta未使用Redis存储或Zookeeper存储或未开始同步数据', type: 'warning' })
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleCursorUpdate() {
      if (!this.metaPosition.isStop) {
        this.$message({ message: '当前Instance不是停止状态，无法修改游标', type: 'warning' })
        return
      }
      this.$confirm('确定游标吗？（注：只能更新停止的实例游标）', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateRedisPosition(this.metaPosition).then((res) => {
          if (res.data) {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功，启动实例将以新的游标开始同步数据',
              type: 'success'
            })
          } else {
            this.$message({
              message: '更新失败！',
              type: 'error'
            })
          }
        })
      })
    },
    handleClick(tab, event) {
      // console.log(tab, event)
    },
    handleAddNode(index) {
      this.canalInstanceConfig.tableRules.push({})
    },
    handleDelNode(index) {
      this.canalInstanceConfig.tableRules.splice(index, 1)
    }
  }
}
</script>
