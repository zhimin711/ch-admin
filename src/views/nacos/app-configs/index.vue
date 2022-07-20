<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="5" :xs="24">
        <project-menu @change="handleSelectProject" />
      </el-col>
      <!--用户数据-->
      <el-col :span="19" :xs="24" style="border-left: 1px solid #dedede; min-height: 500px">
        <project-namespace v-model="namespaceId" :project-id="projectId" @change="handleNamespaceChange" @finish="loadNamespacesFinish" />
        <el-alert
          v-if="!showSearch && projectId==='' && namespaceId!=='apply'"
          title="未选择项目或未加载项目的配置集群"
          type="info"
          description="若未选择项目请从左侧先选择项目，若未加载到集群请联系管理员..."
          show-icon
        />
        <el-alert
          v-if="!showSearch && projectId!=='' && namespaceId!=='apply'"
          title="未授权当前项目集群或命名空间"
          type="info"
          description="若项目集群为空请直接联系管理员；若存在集群可选择后点击选择申请空间，提交申请后等待管理员审核..."
          show-icon
        />
        <div v-show="showSearch" class="query-container">
          <el-button v-permission="'NACOS_PROJECT_CONFIG_ADD'" type="primary" @click="handleCreate()">创建配置</el-button>
          <el-button v-permission="'NACOS_PROJECT_CONFIGS_CLONE'" type="primary" plain @click="handleClone()">克隆配置</el-button>
          <el-button v-permission="'NACOS_PROJECT_CONFIGS_IMPORT'" type="primary" plain @click="handleImports()">导入配置</el-button>
          <el-button v-permission="'NACOS_PROJECT_CONFIGS_EXPORT'" type="warning" plain @click="handleExports()">导出配置</el-button>
          <el-button type="primary" icon="el-icon-refresh" plain @click="queryData()">刷新</el-button>
          <el-button v-permission="'NACOS_PROJECT_INSTANCES'" type="primary" icon="el-icon-s-platform" plain @click="handleInstances">服务实例</el-button>
        </div>
        <el-table
          v-show="showSearch"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column label="Data Id" min-width="200" prop="dataId" />
          <el-table-column label="Group" min-width="200" prop="group" />
          <el-table-column align="center" prop="created_at" label="操作" min-width="150">
            <template slot-scope="{row}">
              <el-button v-permission="'NACOS_PROJECT_CONFIG_EDIT'" type="text" @click.native="handleUpdate(row)">编辑</el-button>
              <el-button v-permission="'NACOS_PROJECT_CONFIG_DETAIL'" type="text" @click.native="handleDetail(row)">详情</el-button>
              <el-button v-permission="'NACOS_PROJECT_CONFIG_HISTORY'" type="text" @click.native="handleHistory(row)">变更历史</el-button>
              <el-button v-permission="'NACOS_PROJECT_CONFIG_DELETE'" type="text" @click.native="onDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="showSearch&&count>0" :total="count" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="fetchData()" />
      </el-col>
    </el-row>
    <el-dialog title="导入配置" :visible.sync="dialogVisible2Import" width="400px">
      <el-form label-width="100px">
        <el-form-item label="目标空间">
          <el-tag>{{ namespaceName }}</el-tag>
        </el-form-item>
        <el-form-item label="相同配置">
          <el-select v-model="policy" placeholder="请选择">
            <el-option
              v-for="item in options.policies"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert
        title="文件上传后将直接导入配置，请务必谨慎操作！"
        type="info"
        center
        :closable="false"
        show-icon
      />
      <single-file :url="importUrl" :data="{'policy': policy}" @success="importSuccess" />
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="dialogVisible2Import = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="titles.importResult" :visible.sync="dialogVisible2ImportResult">
      <el-tag type="info" style="margin-bottom: 10px">{{ importMessage }}</el-tag>
      <el-alert
        v-if="tables.importFail.length>0"
        :title="titles.fail"
        type="error"
        :closable="false"
        show-icon
      />
      <el-table v-if="tables.importFail.length>0" :data="tables.importFail">
        <el-table-column property="dataId" label="Data Id" />
        <el-table-column property="group" label="Group" />
      </el-table>
      <el-alert
        v-if="tables.importSkip.length>0"
        :title="titles.skip"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-table v-if="tables.importSkip.length>0" :data="tables.importSkip">
        <el-table-column property="dataId" label="Data Id" />
        <el-table-column property="group" label="Group" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="dialogVisible2ImportResult = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog title="克隆配置" :visible.sync="dialogVisible2Clone">
      <el-form ref="cloneForm" :model="record" label-width="120px">
        <el-form-item label="源空间">
          <el-tag>{{ namespaceName }}</el-tag>
        </el-form-item>
        <el-form-item label="目标空间" prop="toNamespace">
          <el-select v-model="toNamespace" placeholder="请选择目标空间">
            <el-option v-for="item in namespaces" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="相同配置">
          <el-select v-model="policy" placeholder="请选择">
            <el-option
              v-for="item in options.policies"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert
        title="修改 Data Id 和 Group (可选操作)"
        type="success"
        :closable="false"
        show-icon
      />
      <el-table :data="tables.clone">
        <el-table-column property="dataId" label="Data Id">
          <template slot-scope="{row}">
            <el-input v-model="row.dataId" class="edit-input" size="small" />
          </template>
        </el-table-column>
        <el-table-column property="group" label="Group">
          <template slot-scope="{row}">
            <el-input v-model="row.group" class="edit-input" size="small" disabled />
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="dialogVisible2Clone = false">关闭</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="onClone">开始克隆</el-button>
      </span>
    </el-dialog>

    <el-dialog title="更新记录" :visible.sync="dialogVisible2History" width="80%">
      <el-table
        v-if="!showHistoryContent"
        v-loading="historyLoading"
        :data="tables.history"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="更新人" min-width="100" prop="srcUser" />
        <el-table-column label="更新类型" min-width="80" prop="opType">
          <template slot-scope="{row}">
            <el-tag v-if="row.opType === 'I'">新增</el-tag>
            <el-tag v-else-if="row.opType === 'D'">删除</el-tag>
            <el-tag v-else>更新</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="lastModifiedTime" :formatter="dateFormat" />
        <el-table-column align="center" label="操作" width="180">
          <template slot-scope="{row}">
            <el-button v-permission="'NACOS_PROJECT_CONFIG_HISTORY_DETAIL'" type="text" icon="el-icon-view" @click.native="handleHistoryDetail(row)">详情</el-button>
            <el-button v-permission="'NACOS_PROJECT_CONFIGS_ROLLBACK'" type="text" icon="el-icon-refresh-left" @click.native="handleHistoryDetail(row)">回滚</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="!showHistoryContent&&historyCount>0" :total="historyCount" :page.sync="historyQuery.pageNo" :limit.sync="historyQuery.pageSize" @pagination="pageHistory()" />
      <el-card v-if="showHistoryContent" class="box-card">
        <div slot="header" class="clearfix">
          <span>历史配置 {{ dateFormat2(historyRecord.lastModifiedTime) }}</span>
          <el-button v-permission="'NACOS_PROJECT_CONFIGS_ROLLBACK'" style="float: right; padding: 3px 0" type="text" @click="handleHistoryRollback">回滚</el-button>
        </div>
        <div class="text item">
          <el-input v-model="historyRecord.content" type="textarea" :autosize="{ minRows: 10, maxRows: 14}" />
        </div>
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button v-if="showHistoryContent" @click="showHistoryContent = false">返回</el-button>
        <el-button @click="dialogVisible2History = false">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog title="服务实例" :visible.sync="dialogVisible2Instances" width="80%">
      <div v-for="(item2,index) in tables.instances" :key="'instances'+index">
        <el-card v-for="(item, k) in item2.clusterMap" :key="'consumeGroup'+k" class="box-card route-broker">
          <div slot="header" class="clearfix">
            <span>集群	:	<el-tag>{{ k }}</el-tag></span>
          </div>
          <el-table :data="item.hosts" border>
            <el-table-column label="IP" width="150" prop="ip" />
            <el-table-column label="端口" width="60" prop="port" />
            <el-table-column label="上线" width="100" align="center" prop="enabled">
              <template slot-scope="{row}">
                {{ row.enabled }}
              </template>
            </el-table-column>
            <el-table-column label="权重" width="60" align="center" prop="weight" />
            <el-table-column label="健康状态" width="100" align="center" prop="valid">
              <template slot-scope="{row}">
                {{ row.valid }}
              </template>
            </el-table-column>
            <el-table-column label="元数据" min-width="100">
              <template slot-scope="{row}">
                {{ JSON.stringify(row.metadata) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Instances = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SingleFile from '@/components/Upload/SingleFile2'
import ProjectNamespace from '../components/ProjectNamespace' // 粘性header组件
import ProjectMenu from '../components/ProjectMenu' // 粘性header组件
import { deepClone, parseTime } from '@/utils'
import {
  cloneNacosProjectConfigs,
  deleteNacosProjectConfig, exportNacosProjectConfigs,
  pageNacosUserConfigs, rollbackNacosProjectConfigs
} from '@/api/devops/nacos/user-configs'
import {
  getNacosUserProjectHistory,
  getNacosUserProjectHistoryDetail,
  getNacosUserProjectInstances
} from '@/api/devops/nacos/user-app-configs'

const opName = {
  'IMPORT': '导入',
  'CLONE': '克隆'
}
export default {
  name: 'NacosProjectConfigsIndex',
  components: { ProjectNamespace, SingleFile, ProjectMenu },
  data() {
    return {
      list: null,
      projectId: '',
      projectName: '',
      namespaceId: '',
      showSearch: false,
      listLoading: false,
      multipleSelection: [],
      namespaces: [],
      count: 0,
      listQuery: {
        search: 'accurate',
        namespaceId: '',
        dataId: '',
        group: '',
        pageNo: 1,
        pageSize: 10
      },
      historyQuery: {
        search: 'accurate',
        namespaceId: '',
        dataId: '',
        group: '',
        pageNo: 1,
        pageSize: 10
      },
      historyCount: 0,
      dialogLoading: false,
      dialogVisible2Import: false,
      dialogVisible2ImportResult: false,
      dialogVisible2Clone: false,
      dialogVisible2Instances: false,
      dialogVisible2History: false,
      historyLoading: false,
      showHistoryContent: false,
      importMessage: '',
      record: {},
      toNamespace: '',
      historyRecord: {},
      titles: {
        importResult: '',
        fail: '',
        skip: ''
      },
      tables: {
        instancesLoading: false,
        importSuccess: [],
        importFail: [],
        importSkip: [],
        instances: [],
        history: [],
        clone: []
      },
      policy: 'ABORT',
      options: {
        policies: [{
          value: 'ABORT',
          label: '终止导入'
        }, {
          value: 'SKIP',
          label: '跳过'
        }, {
          value: 'OVERWRITE',
          label: '覆盖'
        }],
        projects: []
      },
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }],
        toNamespace: [{ required: true, message: '目标空间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    namespaceName() {
      const tmp = this.namespaceId
      const tenant = this.namespaces.find(tenant => {
        return tenant.value === tmp
      })
      if (tenant) {
        return tenant.label
      }
      return '-'
    },
    importUrl() {
      return `/api/devops/nacos/user/${this.projectId}/configs/import?namespaceId=${this.namespaceId}`
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
    // this.fetchData()
  },
  methods: {
    handleSelectProject(val) {
      if (this.projectId === val) {
        return
      }
      this.projectId = val
      this.listQuery.appName = val
      this.list = []
      this.namespaceId = ''
      this.listQuery.namespaceId = ''
      this.namespaces = []
      this.showSearch = false
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    loadNamespacesFinish(data) {
      this.namespaces = data
      this.showSearch = data.length > 0
    },
    handleNamespaceChange(val) {
      if (val === 'apply' || val === '') {
        this.listQuery.namespaceId = ''
        this.showSearch = false
        return
      }
      this.listQuery.namespaceId = val
      this.queryData()
    },
    fetchData() {
      if (!this.listQuery.namespaceId || this.listQuery.namespaceId === '') {
        this.$message.error('请选择空间...')
        return
      }
      this.listLoading = true
      this.listQuery.search = 'accurate'
      if (this.listQuery.dataId || this.listQuery.group) {
        this.listQuery.search = 'blur'
      }
      this.showSearch = true
      pageNacosUserConfigs(this.projectId, this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.count = resp.total
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.listQuery.pageNo = 1
      this.fetchData()
    },
    handleCreate() {
      this.$router.push(`/nacos/project/configAdd?namespaceId=${this.namespaceId}&appName=${this.projectId}`)
    },
    handleDetail(row) {
      this.$router.push(`/nacos/project/configDetail?namespaceId=${row.namespaceId || this.namespaceId}&appName=${this.projectId}&dataId=${row.dataId}&group=${row.group}`)
    },
    pageHistory() {
      this.historyLoading = true
      getNacosUserProjectHistory(this.projectId, this.historyQuery).then(resp => {
        if (resp.success) {
          this.tables.history = resp.rows
          this.historyCount = resp.total
        }
      }).finally(() => {
        this.historyLoading = false
      })
    },
    handleHistory(row) {
      this.dialogVisible2History = true
      this.showHistoryContent = false
      // this.historyQuery.search = 'accurate'
      this.historyQuery.namespaceId = this.namespaceId
      this.historyQuery.dataId = row.dataId
      this.historyQuery.group = row.group
      this.historyQuery.pageNo = 1
      this.historyQuery.pageSize = 10
      this.historyCount = 0
      this.tables.history = []
      this.pageHistory()
    },
    handleCode(row) {
      this.record = Object.assign({}, row)
      this.record.content = undefined
      this.dialogVisible2Code = true
    },
    handleUpdate(row) {
      this.$router.push(`/nacos/project/configEdit?namespaceId=${row.namespaceId || this.namespaceId}&appName=${this.projectId}&dataId=${row.dataId}&group=${row.group}`)
    },
    onDelete(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '删除配置',
        message: h('div', { style: 'margin-left: 20px' }, [
          h('p', null, '确定要删除以下配置吗？ '),
          h('span', null, `Data Id: `),
          h('i', { style: 'color: teal' }, row.dataId),
          h('br', null, null),
          h('span', null, `Group: `),
          h('i', { style: 'color: teal' }, row.group)
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(action => {
        this.handleDelete(row)
      })
    },
    async handleDelete(row) {
      let resp
      if (row) {
        const params = {}
        params.namespaceId = this.namespaceId
        params.id = row.id
        params.dataId = row.dataId
        params.group = row.group
        resp = await deleteNacosProjectConfig(this.projectId, params)
      }
      if (resp && resp.success) {
        this.fetchData()
        this.$message({
          message: '删除配置成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: '删除配置失败',
          type: 'error'
        })
      }
    },
    handleExports() {
      const isSelected = this.multipleSelection.length > 0
      const msg = isSelected ? '将导出选择配置' : '将导出当前查询到或当前项目的配置'
      this.$confirm(msg, '导出配置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.exportData(isSelected)
      })
    },
    exportData(isSelected) {
      let params = null
      if (isSelected) {
        const ids = this.multipleSelection.map(item => item.id)
        params = {
          export: 'true',
          tenant: '',
          group: '',
          appName: '',
          ids: ids.join(',')
        }
      } else {
        params = {
          export: 'true',
          tenant: '',
          group: this.listQuery.group || '',
          appName: this.listQuery.appName || this.projectId,
          dataId: this.listQuery.dataId || '',
          ids: ''
        }
      }
      params.namespaceId = this.namespaceId
      exportNacosProjectConfigs(this.projectId, params)
    },
    handleImports() {
      this.dialogVisible2Import = true
    },
    handleInstances() {
      this.dialogVisible2Instances = true
      this.tables.instancesLoading = true
      this.tables.instances = []
      const params = {}
      params.namespaceId = this.namespaceId
      params.pageNo = 1
      params.pageSize = 100
      getNacosUserProjectInstances(this.projectId, params).then(resp => {
        if (resp.success) {
          this.tables.instances = resp.rows
        }
      }).finally(() => {
        this.tables.instancesLoading = false
      })
    },
    importSuccess(resp) {
      this.dialogVisible2Import = false
      this.handleResult(resp, 'IMPORT')
    },
    handleClone() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要克隆的配置！')
        return
      }
      this.dialogVisible2Clone = true
      this.tables.clone = deepClone(this.multipleSelection)
    },
    handleHistoryDetail(row) {
      const params = {}
      params.namespaceId = this.namespaceId
      params.opType = row.opType
      params.nid = row.id
      params.dataId = row.dataId
      params.group = row.group
      this.showHistoryContent = true
      getNacosUserProjectHistoryDetail(this.projectId, params).then((resp) => {
        if (resp.success) {
          this.historyRecord = resp.rows[0]
        }
      })
    },
    handleHistoryRollback(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '回滚配置',
        message: h('div', { style: 'margin-left: 20px' }, [
          h('p', null, '确定要 以下配置吗？ '),
          h('span', null, `Data Id: `),
          h('i', { style: 'color: teal' }, this.historyRecord.dataId),
          h('br', null, null),
          h('span', null, `Group: `),
          h('i', { style: 'color: teal' }, this.historyRecord.group)
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(action => {
        this.onHistoryRollback()
      })
    },
    onHistoryRollback() {
      this.historyRecord.namespaceId = this.namespaceId
      rollbackNacosProjectConfigs(this.projectId, this.historyRecord).then(resp => {
        this.$message({
          message: '配置回滚' + (resp ? '成功' : '失败'),
          type: resp ? 'success' : 'error'
        })
        if (resp.success) {
          this.dialogVisible2History = false
        }
      })
    },
    onClone() {
      const params = {}
      const tenant = this.namespaces.find(tenant => {
        return tenant.value === this.toNamespace
      })
      params.policy = this.policy
      params.namespaceId = tenant.value || tenant.label
      const data = this.tables.clone.map(item => {
        return { cfgId: item.id, dataId: item.dataId, group: item.group }
      })
      this.dialogLoading = true
      cloneNacosProjectConfigs(this.projectId, params, data).then(resp => {
        this.dialogVisible2Clone = false
        this.handleResult(resp, 'CLONE')
      }).finally(() => {
        this.dialogLoading = false
      })
    },
    handleResult(resp, op) {
      const { rows, message } = resp
      if (!resp.success) {
        this.$message.error(`${opName[op]}失败！${message}`)
        return
      }
      this.dialogVisible2ImportResult = true
      const data = rows[0]
      this.titles.importResult = opName[op]
      this.tables.importFail = []
      this.tables.importSkip = []
      this.importMessage = ''
      this.titles.skip = ''
      this.titles.fail = ''
      if (data.failData) {
        this.titles.importResult = `${opName[op]}终止`
        this.titles.fail = '失败的条目: ' + data.failData.length
        this.tables.importFail = data.failData
        this.importMessage = '检测到冲突的配置项：' + data.failData[0].group + '/' + data.failData[0].dataId
      }
      if (data.skipData) {
        this.titles.skip = '跳过的条目: ' + data.skipData.length
        if (data.failData) this.titles.skip = '未处理的条目: ' + data.skipData.length
        this.tables.importSkip = data.skipData
      }
      if (data.succCount > 0) {
        this.importMessage = `${opName[op]}成功,${opName[op]}了 ${data.succCount} 项配置`
        this.fetchData()
      }
    },
    dateFormat(row, column, cellValue, index) {
      return parseTime(new Date(cellValue))
    },
    dateFormat2(value) {
      return parseTime(new Date(value))
    }
  }
}
</script>
