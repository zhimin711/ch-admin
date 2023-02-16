<template>
  <el-card>
    <div slot="header" class="clearfix">
      <span>服务详情</span>
      <el-button style="float: right; padding: 3px 25px 3px 10px" type="text" icon="el-icon-back" @click="onBack">返回</el-button>
      <el-button v-permission="'NacosServiceDetailEdit'" style="float: right; padding: 3px 10px" type="text" icon="el-icon-edit" @click="onEdit">编辑服务</el-button>
    </div>
    <el-row>
      <el-col :span="20" :offset="2">
        <el-form ref="form" :model="detail" label-width="120px" :rules="rules" :disabled="true">
          <div style="padding-left: 10px;padding-top: 20px;">
            <el-form-item label="服务名">
              <el-input v-model="detail.name" placeholder="请输入Data ID" />
            </el-form-item>
            <el-form-item label="分组">
              <el-input v-model="detail.groupName" placeholder="分组名称" />
            </el-form-item>
            <el-form-item label="保护阈值">
              <el-input v-model="detail.protectThreshold" />
            </el-form-item>
            <el-form-item label="元数据">
              <el-input v-model="detail.metadata" type="textarea" :autosize="{ minRows: 10, maxRows: 14}" />
            </el-form-item>
            <el-form-item label="服务路由类型">
              <!--<el-select v-model="selector.type">
                <el-option key="none" label="默认" value="none" />
                <el-option key="label" label="标签" value="label" />
              </el-select>-->
              <el-input v-model="selector.type" />
            </el-form-item>
            <el-form-item v-if="selector.type === 'label'" label="表达式">
              <el-input v-model="selector.expression" type="textarea" />
            </el-form-item>
          </div>
        </el-form>
      </el-col>
      <el-col :span="22" :offset="1">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>集群: </span>
            <el-tag>{{ cluster.name }}</el-tag>
            <el-button v-permission="'NacosServiceClusterEdit'" style="float: right; padding: 3px 0" type="text" icon="el-icon-edit" @click="handleEditCluster">集群配置</el-button>
          </div>
          <div class="text item">
            <el-table v-loading="tables.instanceLoading" :data="tables.instances" border>
              <el-table-column label="IP" width="150" prop="ip" />
              <el-table-column label="端口" width="60" prop="port" />
              <el-table-column label="临时实例" width="100" align="center" prop="ephemeral">
                <template slot-scope="{row}">
                  {{ row.ephemeral }}
                </template>
              </el-table-column>
              <el-table-column label="权重" width="60" align="center" prop="weight" />
              <el-table-column label="健康状态" width="100" align="center" prop="healthy">
                <template slot-scope="{row}">
                  {{ row.healthy }}
                </template>
              </el-table-column>
              <el-table-column label="元数据" min-width="100">
                <template slot-scope="{row}">
                  {{ JSON.stringify(row.metadata) }}
                </template>
              </el-table-column>
              <el-table-column align="center" prop="created_at" label="操作" width="180">
                <template slot-scope="{row}">
                  <el-button v-permission="'NacosServiceInstanceEdit'" @click.native="handleEditInstance(row)">编辑</el-button>
                  <el-button v-permission="'NacosServiceInstanceEdit'" @click.native="handleSwitchInstance(row)">{{ row.enabled?'下线':'上线' }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="dialogVisible" title="更新服务" width="660px">
      <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="100px">
        <el-form-item label="服务名" prop="serviceName">
          <el-input v-model="record.serviceName" disabled />
        </el-form-item>
        <el-form-item label="保护阈值" prop="protectThreshold">
          <el-input-number v-model="record.protectThreshold" />
        </el-form-item>
        <el-form-item label="分组">
          <el-input v-model="record.groupName" placeholder="DEFAULT_GROUP" />
        </el-form-item>
        <el-form-item label="元数据">
          <json-editor ref="jsonEditor" v-model="record.metadata" />
        </el-form-item>
        <el-form-item label="服务路由类型">
          <el-select v-model="selector2.type">
            <el-option key="none" label="默认" value="none" />
            <el-option key="label" label="标签" value="label" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selector2.type === 'label'" label="表达式">
          <el-input v-model="selector2.expression" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit()">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2Cluster" title="更新集群">
      <el-form ref="dataForm" :rules="rules" :model="cluster" label-width="120px">
        <el-form-item label="检查类型">
          <el-select v-model="healthChecker.type">
            <el-option key="TCP" label="TCP" value="TCP" />
            <el-option key="HTTP" label="HTTP" value="HTTP" />
            <el-option key="NONE" label="NONE" value="NONE" />
          </el-select>
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="cluster.defaultCheckPort" />
        </el-form-item>
        <el-form-item label="使用IP端口检查">
          <el-switch
            v-model="cluster.useIPPort4Check"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item v-if="healthChecker.type === 'HTTP'" label="检查路径">
          <el-input v-model="healthChecker.path" />
        </el-form-item>
        <el-form-item v-if="healthChecker.type === 'HTTP'" label="检查头">
          <el-input v-model="healthChecker.headers" />
        </el-form-item>
        <el-form-item label="元数据">
          <json-editor ref="jsonEditor" v-model="cluster.metadata" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Cluster = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCluster">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2Instance" title="编辑实例" width="660px">
      <el-form ref="dataForm" :rules="rules" :model="ins" label-width="100px">
        <el-form-item label="IP">
          <el-input v-model="ins.ip" disabled />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="ins.port" disabled />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number v-model="ins.weight" />
        </el-form-item>
        <el-form-item label="是否上线">
          <el-switch
            v-model="ins.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="元数据">
          <json-editor ref="jsonEditor" v-model="ins.metadata" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Instance = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitInstance()">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import { getNacosService, updateNacosService, updateNacosServiceCluster } from '@/api/devops/nacos/services'
import { pageNacosInstances, updateNacosInstance } from '@/api/devops/nacos/instances'
import JsonEditor from '@/components/JsonEditor'
import { deepClone } from '@/utils'

export default {
  components: { JsonEditor },
  data() {
    return {
      namespaceId: '',
      tempRoute: {},
      detail: {},
      record: {},
      cluster: {},
      ins: {},
      tables: {
        instanceLoading: false,
        instances: []
      },
      selector: {
        type: 'none',
        expression: ''
      },
      selector2: {
        type: 'none',
        expression: ''
      },
      healthChecker: {
        type: 'TCP',
        path: '',
        headers: ''
      },
      dialogVisible: false,
      dialogVisible2Cluster: false,
      dialogVisible2Instance: false,
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadData(this.$route.query)
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    onEdit() {
      this.dialogVisible = true
    },
    loadData(params) {
      this.namespaceId = params.namespaceId
      getNacosService(params).then(resp => {
        if (resp.success) {
          const data = resp.rows[0]
          this.detail = deepClone(data.service)
          this.detail.metadata = JSON.stringify(this.record.metadata)

          this.record = Object.assign({}, data.service)
          this.record.serviceName = this.record.name

          this.selector = Object.assign({}, data.service.selector)
          this.selector2 = Object.assign({}, data.service.selector)

          this.cluster = data.clusters[0]
          this.healthChecker = Object.assign({}, data.clusters[0].healthChecker)
          this.loadInstances()
        }
      })
    },
    loadInstances() {
      const params = {}
      params.namespaceId = this.namespaceId
      params.serviceName = this.record.name
      params.groupName = this.record.groupName
      params.clusterName = this.cluster.name
      params.pageNo = 1
      params.pageSize = 10
      this.tables.instanceLoading = true
      this.tables.instances = []
      pageNacosInstances(params).then(resp => {
        if (resp.success) {
          this.tables.instances = resp.rows
        }
      }).finally(() => {
        this.tables.instanceLoading = false
      })
    },
    handleEditInstance(row) {
      this.dialogVisible2Instance = true
      this.ins = deepClone(row)
    },
    handleEditCluster() {
      this.dialogVisible2Cluster = true
    },
    handleSwitchInstance(row) {
      row.enabled = !row.enabled
      updateNacosInstance(this.convertDataInstance(row)).then(resp => {
        if (resp.success && resp.rows[0]) {
          this.$message.success(row.enabled ? '上线成功' : '下线成功')
        } else {
          this.$message.error(row.enabled ? '上线失败' : '下线失败')
          row.enabled = !row.enabled
        }
      })
    },
    convertDataInstance(row) {
      const formData = {}
      formData.namespaceId = this.namespaceId
      formData.serviceName = this.record.name
      formData.clusterName = this.cluster.name
      formData.groupName = this.record.groupName
      formData.ip = row.ip
      formData.port = row.port
      formData.ephemeral = row.ephemeral
      formData.weight = row.weight
      formData.enabled = row.enabled
      formData.metadata = typeof row.metadata === 'string' ? row.metadata : JSON.stringify(row.metadata)
      return formData
    },
    handleSubmitInstance() {
      updateNacosInstance(this.convertDataInstance(this.ins)).then(resp => {
        if (resp.success && resp.rows[0]) {
          this.$message.success('更新实例成功')
          this.dialogVisible2Instance = false
          const _this = this
          setTimeout(() => {
            _this.loadInstances()
          }, 1000)
        } else {
          this.$message.error('更新实例失败')
        }
      })
    },
    handleSubmitCluster() {
      updateNacosServiceCluster(this.convertDataCluster(this.cluster)).then(res => {
        if (res === 'ok') {
          this.$message.success('更新集群成功')
          this.dialogVisible2Cluster = false
          this.loadData(this.tempRoute.query)
        } else {
          this.$message.error('更新集群失败')
        }
      })
    },
    convertDataCluster(data) {
      const formData = {}
      formData.namespaceId = this.namespaceId
      formData.serviceName = data.serviceName
      formData.clusterName = data.name
      formData.checkPort = data.defaultCheckPort
      formData.useInstancePort4Check = data.useInstancePort4Check
      formData.metadata = typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata)
      formData.healthChecker = JSON.stringify(this.healthChecker)
      return formData
    },
    handleSubmit() {
      updateNacosService(this.convertData(this.record)).then(resp => {
        this.handleResult(resp)
      }).catch(err => {
        this.$message.error(err)
      })
    },
    convertData(data) {
      const formData = {}
      formData.namespaceId = this.namespaceId
      formData.serviceName = data.name
      formData.groupName = data.groupName
      formData.protectThreshold = data.protectThreshold
      formData.metadata = typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata)
      formData.selector = JSON.stringify(this.selector)
      return formData
    },
    handleResult(resp) {
      const ok = resp.success && resp.rows[0]
      if (ok) {
        this.loadData(this.tempRoute.query)
        this.dialogVisible = false
      }
      this.$message({
        message: (ok ? '更新服务成功' : '更新服务失败'),
        type: (ok ? 'success' : 'error')
      })
    },
    onBack() {
      this.$store.dispatch('tagsView/delView', this.tempRoute).then(() => {
        this.$router.push('/nacos/services/publish')
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

