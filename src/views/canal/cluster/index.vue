<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.name" placeholder="Server 名称" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.ip" placeholder="Server IP" style="width: 200px;" class="filter-item" /> -->
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="fetchData()">查询</el-button>
      <el-button v-if="checkPermission2(['CANAL_CLUSTERS_ADD'])" class="filter-item" type="primary" @click="handleCreate()">新建集群</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="集群名称" min-width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="ZK地址" min-width="300" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.zkHosts }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="scope">
          <el-dropdown trigger="click">
            <el-button type="primary" size="mini">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="checkPermission2(['CANAL_CLUSTERS_CONFIG_EDIT'])" @click.native="handleConfig(scope.row)">主配置</el-dropdown-item>
              <!--<el-dropdown-item v-if="checkPermission2(['CANAL_CLUSTERS_CONFIG_EDIT'])" @click.native="handleConfig2(scope.row)">主配置2</el-dropdown-item>-->
              <el-dropdown-item v-if="checkPermission2(['CANAL_CLUSTERS_EDIT'])" @click.native="handleUpdate(scope.row)">修改集群</el-dropdown-item>
              <el-dropdown-item v-if="checkPermission2(['CANAL_CLUSTERS_DELETE'])" @click.native="handleDelete(scope.row)">删除集群</el-dropdown-item>
              <!--<el-dropdown-item @click.native="handleView(scope.row)">查看Server</el-dropdown-item>-->
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="canalCluster" label-position="left" label-width="120px" style="width: 400px; margin-left:30px;">
        <el-form-item label="集群名称" prop="name">
          <el-input v-model="canalCluster.name" />
        </el-form-item>
        <el-form-item label="ZK地址" prop="zkHosts">
          <el-input v-model="canalCluster.zkHosts" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dataOperation()">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogFormVisible2" :title="textMap[dialogStatus]" width="80%">
      <el-form ref="data2Form" :rules="rules" :model="canalClusterConfig" label-position="left" label-width="150px">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="权限配置" name="first">
            <el-form-item label="本机IP" prop="canalIp">
              <el-input v-model="canalClusterConfig.canalIp" />
              <el-aside width="100%">canal server绑定的本地IP信息，如果不配置，默认选择一个本机IP进行启动服务</el-aside>
            </el-form-item>
            <el-form-item label="端口" prop="canalPort">
              <el-input v-model="canalClusterConfig.canalPort" />
              <el-aside width="100%">canal server提供socket服务的端口</el-aside>
            </el-form-item>
            <el-form-item label="用户名" prop="canalUser">
              <el-input v-model="canalClusterConfig.canalUser" />
            </el-form-item>
            <el-form-item label="密码" prop="canalPasswd">
              <el-input v-model="canalClusterConfig.canalPasswd" />
            </el-form-item>
            <el-form-item label="注册IP" prop="canalRegisterIp">
              <el-input v-model="canalClusterConfig.canalRegisterIp" placeholder="register ip to zookeeper" />
              <el-aside width="100%">canal server注册到外部zookeeper、admin的ip信息 (针对docker的外部可见ip)</el-aside>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="管理配置" name="second">
            <el-form-item label="地址" prop="adminManager">
              <el-input v-model="canalClusterConfig.canalAdminManager" />
            </el-form-item>
            <el-form-item label="端口" prop="adminPort">
              <el-input v-model="canalClusterConfig.canalAdminPort" />
            </el-form-item>
            <el-form-item label="用户" prop="adminUser">
              <el-input v-model="canalClusterConfig.canalAdminUser" />
            </el-form-item>
            <el-form-item label="密码" prop="adminPasswd">
              <el-input v-model="canalClusterConfig.canalAdminPasswd" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="服务配置" name="third">
            <el-form-item label="zkServer地址" prop="canalZkServers">
              <el-input v-model="canalClusterConfig.canalZkServers" placeholder="zookeeper address(HA模式)" />
              <el-aside width="100%">canal server链接zookeeper集群,例子：10.20.144.22:2181,10.20.144.51:2181</el-aside>
            </el-form-item>
            <el-form-item label="Netty" prop="canalWithoutNetty">
              <!--<el-input v-model="canalClusterConfig.canalWithoutNetty"/>-->
              <el-switch
                v-model="canalClusterConfig.canalWithoutNetty"
                active-color="#ff4949"
                :inactive-color="'#13ce66'"
                active-text="关闭"
                inactive-text="开启"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="Meta配置" name="fourth">
            <el-form-item label="存储">
              <el-select v-model="canalClusterConfig.canalInstanceGlobalSpringXml" placeholder="书签状态">
                <el-option key="status0" label="本地文件" value="classpath:spring/file-instance.xml" />
                <el-option key="status1" label="Zookeeper" value="classpath:spring/default-instance.xml" />
                <el-option key="status3" label="Redis" value="classpath:spring/redis-instance.xml" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="canalClusterConfig.canalInstanceGlobalSpringXml==='classpath:spring/file-instance.xml'" label="写入频率（毫秒）" prop="canalFileFlushPeriod">
              <el-input v-model="canalClusterConfig.canalFileFlushPeriod" />
            </el-form-item>
            <el-form-item v-if="canalClusterConfig.canalInstanceGlobalSpringXml==='classpath:spring/default-instance.xml'" label="写入频率（毫秒）" prop="canalZookeeperFlushPeriod">
              <el-input v-model="canalClusterConfig.canalZookeeperFlushPeriod" />
            </el-form-item>
            <el-row v-if="canalClusterConfig.canalInstanceGlobalSpringXml==='classpath:spring/redis-instance.xml'">
              <el-form-item label="写入频率（毫秒）" prop="canalRedisFlushPeriod">
                <el-input v-model="canalClusterConfig.canalRedisFlushPeriod" />
              </el-form-item>
              <el-form-item label="模式">
                <el-select v-model="canalClusterConfig.redisMode">
                  <el-option key="mode0" label="单机" value="standalone" />
                  <el-option key="mode1" label="哨兵" value="sentinel" />
                  <el-option key="mode2" label="集群" value="cluster" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="canalClusterConfig.redisMode==='standalone'" label="域名或IP">
                <el-input v-model="canalClusterConfig.redisHost" />
              </el-form-item>
              <el-form-item v-if="canalClusterConfig.redisMode==='standalone'" label="端口">
                <el-input v-model="canalClusterConfig.redisPort" />
              </el-form-item>
              <el-form-item v-if="canalClusterConfig.redisMode==='sentinel'" label="主节点名称">
                <el-input v-model="canalClusterConfig.redisSentinelMaster" />
              </el-form-item>
              <el-form-item v-if="canalClusterConfig.redisMode==='sentinel'" label="地址">
                <el-input v-model="canalClusterConfig.redisSentinelNodes" placeholder="域名或IP:端口(多个','拼接)" />
              </el-form-item>
              <el-form-item v-if="canalClusterConfig.redisMode==='cluster'" label="地址">
                <el-input v-model="canalClusterConfig.redisClusterNodes" placeholder="域名或IP:端口(多个','拼接)" />
              </el-form-item>
              <el-form-item v-if="canalClusterConfig.redisMode!=='cluster'" label="dbIndex">
                <el-input v-model="canalClusterConfig.redisDatabase" />
              </el-form-item>
              <el-form-item label="超时">
                <el-input v-model="canalClusterConfig.redisTimeout" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="canalClusterConfig.redisPassword" />
              </el-form-item>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="同步配置" name="five">

            <el-form-item label="JSON数据格式">
              <el-switch
                v-model="canalClusterConfig.canalMqFlatMessage"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            <el-form-item label="Database哈希">
              <el-switch
                v-model="canalClusterConfig.canalMqDatabaseHash"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            <el-form-item label="模式">
              <el-select v-model="canalClusterConfig.canalServerMode" @change="initConfig">
                <el-option key="mode0" label="tcp" value="tcp" />
                <el-option key="mode1" label="kafka" value="kafka" />
                <el-option key="mode2" label="RocketMQ" value="RocketMQ" />
                <el-option key="mode3" label="RabbitMQ" value="RabbitMQ" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="canalClusterConfig.canalServerMode!=='tcp' && canalClusterConfig.canalServerMode!==''" label="集群">
              <el-table
                :data="mqServers"
                border
                style="width: 100%; margin-bottom: 10px;"
              >
                <el-table-column prop="name" label="名称" width="180">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.name" class="edit-input" size="small" placeholder="集群名称" />
                    </template>
                  </template>
                </el-table-column>
                <el-table-column prop="host" label="地址">
                  <template slot-scope="{row}">
                    <template>
                      <el-input v-model="row.host" class="edit-input" size="small" placeholder="IP或域名（多个','拼接）" />
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
            <el-row v-if="canalClusterConfig.canalServerMode==='kafka'">
              <!--<el-form-item label="地址">
                <el-input v-model="canalClusterConfig.kafkaBootstrapServers"/>
              </el-form-item>-->
              <el-form-item label="发送确认模式">
                <el-select v-model="canalClusterConfig.kafkaAcks">
                  <el-option key="mode0" label="不确认" value="0" />
                  <el-option key="mode1" label="首领返回确认" value="1" />
                  <el-option key="mode2" label="等待所有同步" value="all" />
                </el-select>
              </el-form-item>
              <el-form-item label="批量发送大小">
                <el-input v-model="canalClusterConfig.kafkaBatchSize" />
              </el-form-item>
              <el-form-item label="Buffer缓存大小">
                <el-input v-model="canalClusterConfig.kafkaBufferMemory" />
              </el-form-item>
              <el-form-item label="批量时间间隔">
                <el-input v-model="canalClusterConfig.kafkaLingerMs" />
              </el-form-item>
              <el-form-item label="最大请求大小">
                <el-input v-model="canalClusterConfig.kafkaMaxRequestSize" />
              </el-form-item>
              <el-form-item label="重试次数">
                <el-input v-model="canalClusterConfig.kafkaRetries" />
              </el-form-item>
            </el-row>
            <el-row v-if="canalClusterConfig.canalServerMode==='RocketMQ'">
              <!--<el-form-item label="地址">
                <el-input v-model="canalClusterConfig.rocketmqNamesrvAddr"/>
              </el-form-item>-->
              <el-form-item label="命名空间">
                <el-input v-model="canalClusterConfig.rocketmqNamespace" />
              </el-form-item>
              <el-form-item label="生产组名称">
                <el-input v-model="canalClusterConfig.rocketmqProducerGroup" />
              </el-form-item>
              <el-form-item label="VipChannel">
                <el-switch
                  v-model="canalClusterConfig.rocketmqVipChannelEnabled"
                  :active-color="'#13ce66'"
                  :inactive-color="'#ff4949'"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              <el-form-item label="MessageTrace">
                <el-switch
                  v-model="canalClusterConfig.rocketmqEnableMessageTrace"
                  :active-color="'#13ce66'"
                  :inactive-color="'#ff4949'"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
              <el-form-item label="MessageTraceTopic">
                <el-input v-model="canalClusterConfig.rocketmqCustomizedTraceTopic" />
              </el-form-item>
            </el-row>
            <el-row v-if="canalClusterConfig.canalServerMode==='RabbitMQ'">
              <!--<el-form-item label="地址">
                <el-input v-model="canalClusterConfig.rabbitmqHost"/>
              </el-form-item>-->
              <el-form-item label="用户名">
                <el-input v-model="canalClusterConfig.rabbitmqUsername" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="canalClusterConfig.rabbitmqPassword" />
              </el-form-item>
              <el-form-item label="Exchange">
                <el-input v-model="canalClusterConfig.rabbitmqExchange" />
              </el-form-item>
              <el-form-item label="VirtualHost">
                <el-input v-model="canalClusterConfig.rabbitmqVirtualHost" />
              </el-form-item>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="过滤配置" name="six">
            <el-form-item label="DruidDdl">
              <el-switch
                v-model="canalClusterConfig.canalInstanceFilterDruidDdl"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              />
              <el-aside width="100%">使用druid处理所有的ddl解析来获取库和表名</el-aside>
            </el-form-item>
            <el-form-item label="QueryDdl">
              <el-switch
                v-model="canalClusterConfig.canalInstanceFilterQueryDdl"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              /><el-aside width="100%">忽略dcl语句</el-aside>
            </el-form-item>
            <el-form-item label="QueryDml">
              <el-switch
                v-model="canalClusterConfig.canalInstanceFilterQueryDml"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              /><el-aside width="100%">忽略dml语句</el-aside>
            </el-form-item>
            <el-form-item label="Rows">
              <el-switch
                v-model="canalClusterConfig.canalInstanceFilterRows"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              /><el-aside width="100%">忽略dml的数据变更事件(主要针对用户只订阅ddl/dcl的操作)</el-aside>
            </el-form-item>
            <el-form-item label="TableError">
              <el-switch
                v-model="canalClusterConfig.canalInstanceFilterTableError"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              /><el-aside width="100%">忽略binlog表结构获取失败的异常</el-aside>
            </el-form-item>
            <el-form-item label="TransactionEntry">
              <el-switch
                v-model="canalClusterConfig.canalInstanceFilterTransactionEntry"
                :active-color="'#13ce66'"
                :inactive-color="'#ff4949'"
                active-text="开启"
                inactive-text="关闭"
              /><el-aside width="100%">忽略事务头和尾,比如针对写入kakfa的消息时，不需要写入TransactionBegin/Transactionend事件</el-aside>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取消</el-button>
        <el-button type="primary" @click="dataOperation2()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/validate'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { addCanalCluster, getCanalClusters, updateCanalCluster, deleteCanalCluster } from '@/api/canal/cluster'
import { saveCanalConfigTemplate, getCanalConfigTemplate } from '@/api/canal/clusterConfig'

export default {
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
      list: null,
      listLoading: true,
      listQuery: {
        name: '',
        ip: ''
      },
      dialogFormVisible: false,
      textMap: {
        create: '新建集群信息',
        update: '修改集群信息',
        config: '编辑集群服务配置信息'
      },
      canalCluster: {
        id: null,
        name: null,
        zkHosts: null
      },
      rules: {
        name: [{ required: true, message: '集群名称不能为空', trigger: 'change' }],
        zkHosts: [{ required: true, message: 'zk地址不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create',
      dialogFormVisible2: false,
      activeName: 'first',
      canalClusterConfig: {},
      mqServers: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    checkPermission2,
    fetchData() {
      this.listLoading = true
      getCanalClusters(this.listQuery).then(res => {
        this.list = res.data
      }).finally(() => {
        this.listLoading = false
      })
    },
    resetModel() {
      this.canalCluster = {
        id: null,
        name: null,
        zkHosts: null
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
    dataOperation() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            addCanalCluster(this.canalCluster).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateCanalCluster(this.canalCluster).then(res => {
              this.operationRes(res)
            })
          }
        }
      })
    },
    dataOperation2() {
      this.$refs['data2Form'].validate((valid) => {
        if (valid) {
          if (this.canalClusterConfig.canalServerMode !== 'tcp') {
            let ok = true
            let nameEmptyNum = 0
            let msg = ''
            const servers = []
            this.mqServers.forEach((row, index) => {
              if (isEmpty(row.host)) {
                ok = false
                msg = '同步配置集群地址不能为空'
              } else if (isEmpty(row.name)) {
                nameEmptyNum++
              }
              servers.push((isEmpty(row.name) ? '' : (row.name + '=')) + row.host)
            })
            if (nameEmptyNum > 0 && this.mqServers.length > 1) {
              ok = false
              msg = '同步配置多集群，名称不能为空'
            }
            if (!ok) {
              this.$message.error(`${msg}，请检查！`)
              return
            }
            if (this.canalClusterConfig.canalServerMode === 'kafka') {
              this.canalClusterConfig.kafkaBootstrapServers = servers.join(';')
            } else if (this.canalClusterConfig.canalServerMode === 'RocketMQ') {
              this.canalClusterConfig.rocketmqNamesrvAddr = servers.join(';')
            } else if (this.canalClusterConfig.canalServerMode === 'RabbitMQ') {
              this.canalClusterConfig.rabbitmqHost = servers.join(';')
            }
          }
          saveCanalConfigTemplate(this.canalClusterConfig).then(res => {
            this.operationRes(res, true)
            this.dialogFormVisible2 = false
          })
        }
      })
    },
    operationRes(res, noRefresh) {
      if (res.data === 'success') {
        if (!noRefresh) this.fetchData()
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
    handleView(row) {
      this.$router.push('/canalServer/nodeServers?clusterId=' + row.id)
    },
    handleConfig2(row) {
      this.$router.push('/canalServer/nodeServer/config?clusterId=' + row.id)
    },
    handleConfig(row) {
      this.dialogStatus = 'config'
      getCanalConfigTemplate(row.id).then(resp => {
        this.canalClusterConfig = resp.data
        this.initConfig()
        this.dialogFormVisible2 = true
      })
    },
    initConfig() {
      this.mqServers = []
      let servers = ''
      if (this.canalClusterConfig.canalServerMode === 'kafka') {
        servers = this.canalClusterConfig.kafkaBootstrapServers
      } else if (this.canalClusterConfig.canalServerMode === 'RocketMQ') {
        servers = this.canalClusterConfig.rocketmqNamesrvAddr
      } else if (this.canalClusterConfig.canalServerMode === 'RabbitMQ') {
        servers = this.canalClusterConfig.rabbitmqHost
      }
      if (isEmpty(servers)) {
        this.mqServers.push({ name: null, host: null })
        return
      }
      const clusters = servers.split(';')
      if (clusters.length <= 0) { return }
      this.mqServers = clusters.map((row) => {
        const arr = row.split('=')
        if (arr.length === 2) {
          return { name: arr[0], host: arr[1] }
        }
        return { name: '', host: row }
      })
    },
    handleUpdate(row) {
      this.resetModel()
      this.canalCluster = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('删除集群信息会导致服务停止', '确定删除集群信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCanalCluster(row.id).then((res) => {
          if (res.data === 'success') {
            this.fetchData()
            this.$message({
              message: '删除集群信息成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: '删除集群信息失败',
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
      this.mqServers.push({ name: null, host: null })
    },
    handleDelNode(index) {
      this.mqServers.splice(index, 1)
    }
  }
}
</script>
<style scoped>
  .el-form-item .el-aside {
    margin-bottom: 0;
  }
</style>
