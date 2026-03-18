<template>
  <div class="app-container">
    <div class="main-layout">
      <!-- 左侧项目菜单 -->
      <div class="sidebar">
        <div class="sidebar-inner">
          <!-- <project-menu @change="handleSelectProject" /> -->
          <ProjectList v-model="projectId" @change="onProjectChange" />
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 命名空间选择 -->
        <div class="namespace-section">
          <project-namespace
            v-model="namespaceId"
            :project-id="projectId"
            @cluster-change="handleClusterChange"
            @change="handleNamespaceChange"
            @finish="loadNamespacesFinish"
          />
        </div>

        <!-- 提示信息 -->
        <div v-show="!showSearch" class="alert-section">
          <el-alert
            v-if="!showSearch && projectId==='' && namespaceId!=='apply'"
            title="未选择项目或未加载项目的配置集群"
            type="info"
            description="若未选择项目请从左侧先选择项目，若未加载到集群请联系管理员..."
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="!showSearch && projectId!=='' && namespaceId!=='apply'"
            title="未授权当前项目集群或命名空间"
            type="info"
            description="若项目集群为空请直接联系管理员；若存在集群可选择后点击选择申请空间，提交申请后等待管理员审核..."
            show-icon
            :closable="false"
          />
        </div>

        <!-- 操作按钮区域 -->
        <div v-show="showSearch" class="action-bar">
          <div class="action-left">
            <el-button
              v-if="forceCanWrite"
              v-permission="'NACOS_PROJECT_CONFIG_ADD'"
              type="primary"
              icon="el-icon-plus"
              @click="handleCreate()"
            >
              创建配置
            </el-button>
            <el-button
              v-if="forceCanWrite"
              v-permission="'NACOS_PROJECT_CONFIGS_CLONE'"
              type="success"
              icon="el-icon-copy-document"
              @click="handleClone()"
            >
              克隆配置
            </el-button>
            <el-button
              v-if="forceCanWrite"
              v-permission="'NACOS_PROJECT_CONFIGS_IMPORT'"
              type="warning"
              icon="el-icon-upload2"
              @click="handleImports()"
            >
              导入配置
            </el-button>
          </div>

          <div class="action-right">
            <el-button
              v-if="canRead"
              v-permission="'NACOS_PROJECT_CONFIGS_EXPORT'"
              type="info"
              icon="el-icon-download"
              @click="handleExports()"
            >
              导出配置
            </el-button>
            <el-button
              type="primary"
              icon="el-icon-refresh"
              @click="handleRefresh()"
            >
              刷新
            </el-button>
            <el-button
              v-permission="'NACOS_PROJECT_INSTANCES'"
              type="primary"
              icon="el-icon-s-platform"
              @click="handleInstances"
            >
              服务实例
            </el-button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div v-show="showSearch" class="table-section">
          <el-table
            v-loading="listLoading"
            :data="list"
            element-loading-text="Loading"
            border
            stripe
            highlight-current-row
            class="config-table"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              align="center"
              width="55"
            />
            <el-table-column label="Data Id" min-width="200" prop="dataId">
              <template slot-scope="{row}">
                <div class="data-id copyable" :title="'点击复制: ' + row.dataId" @click="copyToClipboard(row.dataId)">
                  <i class="el-icon-copy-document copy-icon" />
                  <span>{{ row.dataId }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Group" min-width="200" prop="group">
              <template slot-scope="{row}">
                <el-tag type="info" size="small">
                  {{ row.group }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" min-width="360" fixed="right">
              <template slot-scope="{row}">
                <div class="action-buttons">
                  <el-link
                    v-if="canWriteConfig(row)"
                    v-permission="'NACOS_PROJECT_CONFIG_EDIT'"
                    type="primary"
                    icon="el-icon-edit"
                    @click="handleUpdate(row)"
                  >
                    编辑
                  </el-link>
                  <el-link
                    v-if="canReadConfig(row)"
                    v-permission="'NACOS_PROJECT_CONFIG_DETAIL'"
                    type="info"
                    icon="el-icon-view"
                    @click="handleDetail(row)"
                  >
                    详情
                  </el-link>
                  <el-link
                    v-if="canReadConfig(row)"
                    v-permission="'NACOS_PROJECT_CONFIG_COMPARE'"
                    type="success"
                    icon="el-icon-s-operation"
                    @click="handleCompare(row)"
                  >
                    比较配置
                  </el-link>
                  <el-link
                    v-if="canReadConfig(row)"
                    v-permission="'NACOS_PROJECT_CONFIG_HISTORY'"
                    type="warning"
                    icon="el-icon-time"
                    @click="handleHistory(row)"
                  >
                    变更历史
                  </el-link>
                  <el-link
                    v-if="showApplyReadPermission(row)"
                    :disabled="isApplyingConfigPermission(row, 'R')"
                    type="primary"
                    icon="el-icon-key"
                    @click="handleApplyConfigPermission(row, 'R')"
                  >
                    申请读权限
                  </el-link>
                  <el-link
                    v-if="showApplyWritePermission(row)"
                    :disabled="isApplyingConfigPermission(row, 'W')"
                    type="warning"
                    icon="el-icon-lock"
                    @click="handleApplyConfigPermission(row, 'W')"
                  >
                    申请写权限
                  </el-link>
                  <el-link
                    v-if="forceCanWrite"
                    v-permission="'NACOS_PROJECT_CONFIG_DELETE'"
                    type="danger"
                    icon="el-icon-delete"
                    @click="onDelete(row)"
                  >
                    删除
                  </el-link>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <pagination
              v-show="showSearch&&count>0"
              :total="count"
              :page.sync="listQuery.pageNo"
              :limit.sync="listQuery.pageSize"
              @pagination="fetchData()"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 导入配置弹窗 -->
    <el-dialog
      title="导入配置"
      :visible.sync="dialogVisible2Import"
      width="500px"
      class="import-dialog"
    >
      <div class="dialog-content">
        <el-form label-width="100px" class="import-form">
          <el-form-item label="目标空间">
            <el-tag type="primary">{{ namespaceName }}</el-tag>
          </el-form-item>
          <el-form-item label="相同配置">
            <el-select v-model="policy" placeholder="请选择处理策略" class="policy-select">
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
          type="warning"
          center
          :closable="false"
          show-icon
        />

        <div class="upload-section">
          <single-file :url="importUrl" :data="{'policy': policy}" @success="importSuccess" />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Import = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 导入结果弹窗 -->
    <el-dialog
      :title="titles.importResult"
      :visible.sync="dialogVisible2ImportResult"
      width="600px"
      class="result-dialog"
    >
      <div class="dialog-content">
        <el-tag type="info" class="result-message">{{ importMessage }}</el-tag>

        <div v-if="tables.importFail.length>0" class="fail-section">
          <el-alert
            :title="titles.fail"
            type="error"
            :closable="false"
            show-icon
          />
          <el-table :data="tables.importFail" border stripe class="result-table">
            <el-table-column property="dataId" label="Data Id" />
            <el-table-column property="group" label="Group" />
          </el-table>
        </div>

        <div v-if="tables.importSkip.length>0" class="skip-section">
          <el-alert
            :title="titles.skip"
            type="warning"
            :closable="false"
            show-icon
          />
          <el-table :data="tables.importSkip" border stripe class="result-table">
            <el-table-column property="dataId" label="Data Id" />
            <el-table-column property="group" label="Group" />
          </el-table>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2ImportResult = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 克隆配置弹窗 -->
    <el-dialog
      title="克隆配置"
      :visible.sync="dialogVisible2Clone"
      width="700px"
      class="clone-dialog"
    >
      <div class="dialog-content">
        <el-form ref="cloneForm" :model="record" label-width="120px" class="clone-form">
          <el-form-item label="源空间">
            <el-tag type="primary">{{ currentNamespaceName }}</el-tag>
          </el-form-item>
          <el-form-item label="目标空间" prop="toNamespace">
            <el-select v-model="toNamespace" placeholder="请选择目标空间" class="namespace-select">
              <el-option v-for="item in targetNamespaces" :key="item.namespaceId" :label="item.namespaceName" :value="String(item.namespaceId)" />
            </el-select>
          </el-form-item>
          <el-form-item label="相同配置">
            <el-select v-model="policy" placeholder="请选择处理策略" class="policy-select">
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

        <div class="clone-table-section">
          <el-table :data="tables.clone" border stripe class="clone-table">
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
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Clone = false">关闭</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="onClone">开始克隆</el-button>
      </div>
    </el-dialog>

    <!-- 更新记录弹窗 -->
    <el-dialog
      title="更新记录"
      :visible.sync="dialogVisible2History"
      width="80%"
      class="history-dialog"
    >
      <div class="dialog-content">
        <el-table
          v-if="!showHistoryContent"
          v-loading="historyLoading"
          :data="tables.history"
          element-loading-text="Loading"
          border
          stripe
          highlight-current-row
          class="history-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        >
          <el-table-column label="更新人" min-width="100" prop="srcUser" />
          <el-table-column label="更新类型" min-width="80" prop="opType">
            <template slot-scope="{row}">
              <el-tag v-if="row.opType === 'I'" type="success">新增</el-tag>
              <el-tag v-else-if="row.opType === 'D'" type="danger">删除</el-tag>
              <el-tag v-else type="warning">更新</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="lastModifiedTime" :formatter="dateFormat" />
          <el-table-column align="center" label="操作" width="180">
            <template slot-scope="{row}">
              <div class="action-buttons">
                <el-link
                  v-permission="'NACOS_PROJECT_CONFIG_HISTORY_DETAIL'"
                  type="primary"
                  icon="el-icon-view"
                  @click="handleHistoryDetail(row)"
                >
                  详情
                </el-link>
                <el-link
                  v-if="forceCanWrite"
                  v-permission="'NACOS_PROJECT_CONFIGS_ROLLBACK'"
                  type="warning"
                  icon="el-icon-refresh-left"
                  @click="handleHistoryDetail(row)"
                >
                  回滚
                </el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <pagination
            v-show="!showHistoryContent&&historyCount>0"
            :total="historyCount"
            :page.sync="historyQuery.pageNo"
            :limit.sync="historyQuery.pageSize"
            @pagination="pageHistory()"
          />
        </div>

        <div v-if="showHistoryContent" class="history-content">
          <div class="history-header">
            <span class="history-title">历史配置 {{ dateFormat2(historyRecord.lastModifiedTime) }}</span>
            <el-button
              v-permission="'NACOS_PROJECT_CONFIGS_ROLLBACK'"
              type="warning"
              icon="el-icon-refresh-left"
              @click="handleHistoryRollback"
            >
              回滚
            </el-button>
          </div>
          <div class="history-body">
            <el-input
              v-model="historyRecord.content"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 14}"
              readonly
            />
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button v-if="showHistoryContent" @click="showHistoryContent = false">返回</el-button>
        <el-button @click="dialogVisible2History = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 服务实例弹窗 -->
    <el-dialog
      title="服务实例"
      :visible.sync="dialogVisible2Instances"
      width="80%"
      class="instances-dialog"
    >
      <div class="dialog-content">
        <div v-for="(item2,index) in tables.instances" :key="'instances'+index" class="instance-group">
          <div v-for="(item, k) in item2.clusterMap" :key="'consumeGroup'+k" class="cluster-section">
            <div class="cluster-header">
              <span class="group-info">
                <i class="el-icon-s-grid" />
                分组: <el-tag type="primary">{{ item2.groupName }}</el-tag>
              </span>
              <span class="cluster-info">
                <i class="el-icon-s-home" />
                集群: <el-tag type="success">{{ k }}</el-tag>
              </span>
            </div>
            <el-table :data="item.hosts" border stripe class="instance-table">
              <el-table-column label="IP" width="150" prop="ip" />
              <el-table-column label="端口" width="60" prop="port" />
              <el-table-column label="上线" width="100" align="center" prop="enabled">
                <template slot-scope="{row}">
                  <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">
                    {{ row.enabled ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="权重" width="60" align="center" prop="weight" />
              <el-table-column label="健康状态" width="100" align="center" prop="valid">
                <template slot-scope="{row}">
                  <el-tag :type="row.valid ? 'success' : 'danger'" size="small">
                    {{ row.valid ? '健康' : '异常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="元数据" min-width="100">
                <template slot-scope="{row}">
                  <span class="metadata">{{ JSON.stringify(row.metadata) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2Instances = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 可比较配置列表弹窗 -->
    <el-dialog
      title="可比较配置列表"
      :visible.sync="dialogCompareListVisible"
      width="60%"
      class="compare-list-dialog"
    >
      <div class="dialog-content">
        <el-table
          :data="compareData.list"
          element-loading-text="Loading"
          border
          stripe
          highlight-current-row
          class="compare-table"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        >
          <el-table-column label="集群环境" min-width="100" prop="appName" />
          <el-table-column label="空间" prop="tenant" />
          <el-table-column align="center" label="操作" width="180">
            <template slot-scope="{row}">
              <el-link
                type="primary"
                icon="el-icon-view"
                @click="doCompare(row)"
              >
                比较
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCompareListVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 配置内容比较弹窗 -->
    <el-dialog
      title="配置内容比较"
      :visible.sync="dialogCompareVisible"
      :width="'80%'"
      class="compare-dialog"
    >
      <div class="dialog-content">
        <div class="compare-header">
          <el-form :inline="false" label-width="120px" label-position="left">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="当前配置内容：" />
              </el-col>
              <el-col :span="12">
                <el-form-item label="比较配置内容：">
                  <el-input
                    v-model="compareData.rightEnv"
                    placeholder="请输入内容"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="compare-body">
          <code-diff
            :old-string="compareData.left.content"
            :new-string="compareData.right.content"
            :context="10"
            output-format="side-by-side"
          />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="backCompareList">返回比较列表</el-button>
        <el-button @click="dialogCompareVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SingleFile from '@/components/Upload/SingleFile2'
import ProjectNamespace from '../components/ProjectNamespace' // 粘性header组件
// import ProjectMenu from '../components/ProjectMenu' // 粘性header组件
import ProjectList from '../components/ProjectList'
import CodeDiff from 'vue-code-diff'

import { deepClone, parseTime } from '@/utils'
import {
  cloneNacosProjectConfigs,
  deleteNacosProjectConfig, exportNacosProjectConfigs,
  pageNacosUserConfigs, rollbackNacosProjectConfigs,
  listNacosUserCompareConfigs
} from '@/api/devops/nacos/user-configs'
import {
  applyNacosUserConfigs,
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
  components: { ProjectNamespace, SingleFile, ProjectList, CodeDiff },
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
      dialogCompareListVisible: false,
      dialogCompareVisible: false,
      canWrite: false,
      canRead: false,
      currentClusterId: '',
      applyingPermissionKey: '',
      configListRequestToken: 0,
      permissionCheckTimer: null, // 权限检查定时器
      importMessage: '',
      record: {},
      compareData: {
        list: [],
        left: {},
        right: {},
        rightEnv: ''
      },
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
      const tmp = String(this.namespaceId)
      const tenant = this.namespaces.find(tenant => {
        return String(tenant.namespaceId) === tmp
      })
      if (tenant) {
        return tenant.namespaceName
      }
      return '-'
    },
    currentNamespaceName() {
      const tmp = String(this.namespaceId)
      const tenant = this.namespaces.find(tenant => {
        return String(tenant.namespaceId) === tmp
      })
      if (tenant) {
        return tenant.namespaceName
      }
      return '-'
    },
    targetNamespaces() {
      return this.namespaces.filter(item => String(item.namespaceId) !== String(this.namespaceId))
    },
    importUrl() {
      return `/api/devops/nacos/user/${this.projectId}/configs/import?namespaceId=${this.namespaceId}`
    },
    // 添加计算属性作为 canWrite 的备用方案
    computedCanWrite() {
      if (!this.namespaceId || this.namespaceId === 'apply' || this.namespaceId === '') {
        return false
      }

      const namespace = this.namespaces.find(tenant => {
        return String(tenant.namespaceId) === String(this.namespaceId)
      })

      if (namespace && namespace.permission) {
        const hasWritePermission = namespace.permission.includes('w')
        console.log('计算属性权限检查:', this.namespaceId, 'canWrite:', hasWritePermission, 'permission:', namespace.permission)
        return hasWritePermission
      }

      return false
    },

    // 添加一个强制刷新的计算属性
    forceCanWrite() {
      // 强制触发计算属性重新计算
      this.$forceUpdate()
      return this.canWrite || this.computedCanWrite
    }
  },
  // 添加 watch 监听器来监听命名空间数据变化
  watch: {
    namespaces: {
      handler(newNamespaces) {
        console.log('namespaces数据变化:', newNamespaces.length, '个命名空间')
        // 当命名空间列表更新时，如果当前有选中的命名空间，重新检查权限
        if (this.namespaceId && this.namespaceId !== 'apply' && this.namespaceId !== '') {
          this.$nextTick(() => {
            this.updateCanWritePermission(this.namespaceId)
          })
        }
      },
      deep: true
    },
    // 监听 namespaceId 变化
    namespaceId: {
      handler(newNamespaceId, oldNamespaceId) {
        console.log('namespaceId变化:', oldNamespaceId, '->', newNamespaceId)
        if (newNamespaceId && newNamespaceId !== 'apply' && newNamespaceId !== '') {
          this.$nextTick(() => {
            this.updateCanWritePermission(newNamespaceId)
          })
        }
      },
      immediate: true
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
    // this.fetchData()
  },
  beforeDestroy() {
    // 清理定时器
    if (this.permissionCheckTimer) {
      clearInterval(this.permissionCheckTimer)
      this.permissionCheckTimer = null
    }
  },
  methods: {
    clearConfigList() {
      this.list = []
      this.count = 0
      this.multipleSelection = []
    },
    // 复制到剪贴板
    copyToClipboard(text) {
      if (!text) {
        this.$message.warning('没有可复制的内容')
        return
      }

      // 创建临时文本区域
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          this.$message.success('复制成功: ' + text)
        } else {
          // 降级方案：使用现代API
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
              this.$message.success('复制成功: ' + text)
            }).catch(() => {
              this.$message.error('复制失败')
            })
          } else {
            this.$message.error('复制失败')
          }
        }
      } catch (err) {
        this.$message.error('复制失败')
      } finally {
        document.body.removeChild(textArea)
      }
    },

    handleSelectProject(val) {
      console.log('项目切换:', val)
      if (this.projectId === val) {
        return
      }
      this.projectId = val
      this.listQuery.appName = val
      this.clearConfigList()
      this.$set(this, 'namespaceId', '')
      this.listQuery.namespaceId = ''
      this.namespaces = []
      this.showSearch = false
      this.currentClusterId = ''
      this.applyingPermissionKey = ''
      this.configListRequestToken += 1
      this.listLoading = false
      this.$set(this, 'canWrite', false) // 使用$set确保响应式更新
      console.log('项目切换完成，权限已重置')
    },
    // 添加 onProjectChange 方法作为 handleSelectProject 的别名
    onProjectChange(val) {
      this.handleSelectProject(val)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleClusterChange(clusterId) {
      this.currentClusterId = String(clusterId || '')
    },
    loadNamespacesFinish(data) {
      console.log('命名空间列表加载完成:', data)
      this.namespaces = data
      this.showSearch = data.length > 0
      if (!this.showSearch) {
        this.clearConfigList()
      }

      // 强制更新UI
      this.$forceUpdate()

      // 延迟检查权限，确保UI更新完成
      setTimeout(() => {
        // 如果当前有选中的命名空间，重新更新权限
        if (this.namespaceId && this.namespaceId !== 'apply' && this.namespaceId !== '') {
          this.updateCanWritePermission(this.namespaceId)
        } else if (data.length > 0) {
          // 如果没有选中的命名空间但有可用的命名空间，自动选择第一个并更新权限
          const firstNamespace = data[0]
          if (firstNamespace && firstNamespace.namespaceId) {
            const namespaceId = String(firstNamespace.namespaceId)
            this.$set(this, 'namespaceId', namespaceId)
            this.listQuery.namespaceId = namespaceId
            this.updateCanWritePermission(namespaceId)
            console.log('自动选择第一个命名空间:', namespaceId)
          }
        }

        // 添加持续检查机制，确保权限状态正确
        this.startPermissionCheck()
      }, 100) // 延迟100ms确保UI更新完成
    },
    handleNamespaceChange(val) {
      console.log('命名空间切换:', val)

      // 确保 namespaceId 是字符串类型
      const namespaceId = String(val)

      if (namespaceId === 'apply' || namespaceId === '') {
        this.listQuery.namespaceId = ''
        this.showSearch = false
        this.applyingPermissionKey = ''
        this.clearConfigList()
        this.configListRequestToken += 1
        this.listLoading = false
        this.$set(this, 'canWrite', false) // 使用$set确保响应式更新
        this.$set(this, 'canRead', false) // 使用$set确保响应式更新
        return
      }

      // 立即更新 canWrite 权限
      this.updateCanWritePermission(namespaceId)

      this.$set(this, 'namespaceId', namespaceId)
      this.applyingPermissionKey = ''
      this.listQuery.namespaceId = namespaceId
      this.queryData()
    },
    supportsConfigPermission(row) {
      return typeof row.hasReadPermission === 'boolean' ||
        typeof row.hasWritePermission === 'boolean' ||
        typeof row.configPermission === 'string'
    },
    normalizeConfigPermission(row) {
      return typeof row.configPermission === 'string'
        ? row.configPermission.toLowerCase()
        : ''
    },
    canReadConfig(row) {
      if (typeof row.hasReadPermission === 'boolean') {
        return row.hasReadPermission
      }
      return this.normalizeConfigPermission(row).includes('r')
    },
    canWriteConfig(row) {
      if (typeof row.hasWritePermission === 'boolean') {
        return row.hasWritePermission
      }
      const configPermission = this.normalizeConfigPermission(row)
      if (configPermission) {
        return configPermission.includes('w')
      }
      return this.forceCanWrite
    },
    showApplyReadPermission(row) {
      return this.supportsConfigPermission(row) && !this.canReadConfig(row)
    },
    showApplyWritePermission(row) {
      const hasWritePermission = this.canWriteConfig(row)
      return this.supportsConfigPermission(row) && hasWritePermission === false
    },
    getConfigPermissionKey(row, permission) {
      const group = row.group || row.groupName || ''
      return `${row.dataId || ''}:${group}:${permission}`
    },
    isApplyingConfigPermission(row, permission) {
      return this.applyingPermissionKey === this.getConfigPermissionKey(row, permission)
    },
    handleApplyConfigPermission(row, permission) {
      if (!this.projectId || !this.currentClusterId || !this.namespaceId) {
        this.$message.warning('当前项目、集群或命名空间信息不完整，无法申请权限')
        return
      }

      const permissionLabel = permission === 'W' ? '写' : '读'
      const applyKey = this.getConfigPermissionKey(row, permission)
      const group = row.group || row.groupName
      if (!group) {
        this.$message.warning('当前配置缺少 Group 信息，无法申请权限')
        return
      }
      const data = [{ dataId: row.dataId, group, permission }]

      this.applyingPermissionKey = applyKey
      applyNacosUserConfigs(this.projectId, this.currentClusterId, this.namespaceId, data).then(resp => {
        if (resp.success) {
          this.$message.success(`${row.dataId} 的${permissionLabel}权限申请已提交，请等待管理员审核...`)
        }
      }).finally(() => {
        if (this.applyingPermissionKey === applyKey) {
          this.applyingPermissionKey = ''
        }
      })
    },

    // 新增方法：更新写入权限
    updateCanWritePermission(namespaceId) {
      console.log('开始更新权限:', namespaceId, '当前namespaces数量:', this.namespaces.length)

      // 确保 namespaceId 是字符串类型
      const namespaceIdStr = String(namespaceId)

      if (!namespaceIdStr || namespaceIdStr === 'apply' || namespaceIdStr === '') {
        this.$set(this, 'canWrite', false) // 使用$set确保响应式更新
        console.log('权限重置为false，原因: 无效的namespaceId')
        this.$forceUpdate() // 强制更新UI
        return
      }

      const namespace = this.namespaces.find(tenant => {
        return String(tenant.namespaceId) === namespaceIdStr
      })

      console.log('找到的namespace:', namespace)

      if (namespace && namespace.permission) {
        const newCanWrite = namespace.permission.includes('w')
        this.$set(this, 'canWrite', newCanWrite) // 使用$set确保响应式更新
        console.log('权限更新成功:', namespaceId, 'canWrite:', newCanWrite, 'permission:', namespace.permission)
        this.$forceUpdate() // 强制更新UI
      } else {
        this.$set(this, 'canWrite', false) // 使用$set确保响应式更新
        console.log('权限更新失败:', namespaceId, 'namespace not found or no permission')
        console.log('当前namespaces列表:', this.namespaces)
        this.$forceUpdate() // 强制更新UI

        // 如果权限更新失败且namespaces为空，延迟重试
        if (this.namespaces.length === 0) {
          console.log('namespaces为空，延迟500ms后重试权限更新')
          setTimeout(() => {
            this.updateCanWritePermission(namespaceId)
          }, 500)
        }
      }
    },

    // 强制刷新权限的方法
    forceRefreshPermission() {
      console.log('强制刷新权限')
      if (this.namespaceId && this.namespaceId !== 'apply' && this.namespaceId !== '') {
        this.updateCanWritePermission(String(this.namespaceId))
      }
    },

    // 处理刷新操作
    handleRefresh() {
      console.log('执行刷新操作')
      this.forceRefreshPermission() // 先刷新权限
      this.queryData() // 再刷新数据
    },

    // 开始权限检查
    startPermissionCheck() {
      // 清除之前的定时器
      if (this.permissionCheckTimer) {
        clearInterval(this.permissionCheckTimer)
      }

      // 设置定时器，每500ms检查一次权限状态
      this.permissionCheckTimer = setInterval(() => {
        if (this.namespaceId && this.namespaceId !== 'apply' && this.namespaceId !== '') {
          const namespace = this.namespaces.find(tenant => {
            return String(tenant.namespaceId) === String(this.namespaceId)
          })

          if (namespace && namespace.permission) {
            const shouldHaveWritePermission = namespace.permission.includes('w')
            if (this.canWrite !== shouldHaveWritePermission) {
              console.log('权限状态不一致，正在修正:', this.canWrite, '->', shouldHaveWritePermission)
              this.$set(this, 'canWrite', shouldHaveWritePermission)
              this.$forceUpdate()
            }
          }
        }
      }, 500)

      // 5秒后停止检查
      setTimeout(() => {
        if (this.permissionCheckTimer) {
          clearInterval(this.permissionCheckTimer)
          this.permissionCheckTimer = null
          console.log('权限检查定时器已停止')
        }
      }, 5000)
    },
    fetchData() {
      if (!this.listQuery.namespaceId || this.listQuery.namespaceId === '') {
        this.clearConfigList()
        this.$message.error('请选择空间...')
        return
      }
      const requestToken = this.configListRequestToken + 1
      this.configListRequestToken = requestToken
      const requestProjectId = String(this.projectId || '')
      const requestNamespaceId = String(this.listQuery.namespaceId || '')
      this.listLoading = true
      this.listQuery.search = 'accurate'
      if (this.listQuery.dataId || this.listQuery.group) {
        this.listQuery.search = 'blur'
      }
      this.showSearch = true
      pageNacosUserConfigs(this.projectId, this.listQuery).then(resp => {
        if (requestToken !== this.configListRequestToken ||
          requestProjectId !== String(this.projectId || '') ||
          requestNamespaceId !== String(this.listQuery.namespaceId || '')) {
          return
        }
        if (resp.success) {
          this.list = resp.rows || []
          this.count = resp.total || 0
        } else {
          this.clearConfigList()
        }
      }).catch(() => {
        if (requestToken === this.configListRequestToken) {
          this.clearConfigList()
        }
      }).finally(() => {
        if (requestToken === this.configListRequestToken) {
          this.listLoading = false
        }
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
      this.toNamespace = ''
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
    handleCompare(row) {
      const params = {}
      params.namespaceId = this.namespaceId
      params.dataId = row.dataId
      params.group = row.group
      this.dialogCompareListVisible = true
      listNacosUserCompareConfigs(this.projectId, params).then((resp) => {
        if (resp.success) {
          this.compareData.left = row
          this.compareData.list = resp.rows
        }
      })
    },
    doCompare(row) {
      this.dialogCompareListVisible = false
      this.dialogCompareVisible = true
      this.compareData.right = row
      this.compareData.rightEnv = row.appName + row.tenant
    },
    backCompareList() {
      this.dialogCompareListVisible = true
      this.dialogCompareVisible = false
      this.compareData.right = {}
      this.compareData.rightEnv = ''
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
      if (!this.toNamespace) {
        this.$message.warning('请选择目标空间！')
        return
      }
      const params = {}
      params.policy = this.policy
      params.namespaceId = this.toNamespace
      params.fromNamespaceId = this.namespaceId
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

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  background: #f5f7fa;
}

.main-layout {
  display: flex;
  height: 100%;
}

// 左侧边栏
.sidebar {
  width: 220px;
  min-width: 160px;
  max-width: 220px !important;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.sidebar-inner {
  width: 100% !important;
  max-width: 220px !important;
  box-sizing: border-box;
  padding: 16px 8px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
// 针对 el-menu 或自定义菜单按钮的样式美化
.sidebar-inner .el-menu,
.sidebar-inner ul {
  background: transparent !important;
  border: none !important;
  padding: 0;
}
.sidebar-inner .el-menu-item,
.sidebar-inner li,
.sidebar-inner .project-menu-item {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  border: 1px solid #e4e7ed;
  font-size: 15px;
  color: #333;
  height: 40px;
  line-height: 40px;
  padding: 0 18px;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.sidebar-inner .el-menu-item:last-child,
.sidebar-inner li:last-child,
.sidebar-inner .project-menu-item:last-child {
  margin-bottom: 0;
}
.sidebar-inner .el-menu-item:hover,
.sidebar-inner li:hover,
.sidebar-inner .project-menu-item:hover {
  background: #f0f9ff;
  color: #409EFF;
  border-color: #b3d8ff;
}
.sidebar-inner .el-menu-item.is-active,
.sidebar-inner li.active,
.sidebar-inner .project-menu-item.active {
  background: linear-gradient(90deg,#e3f2fd 0%,#bbdefb 100%);
  color: #1976d2;
  border-color: #90caf9;
  font-weight: bold;
}

// 右侧内容区域
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 命名空间区域
.namespace-section {
  padding: 0px 20px 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

// 提示信息区域
.alert-section {
  padding: 0 20px;
  margin-top: 16px;
}

// 操作按钮区域
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px 8px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  margin-top: 0px;
  min-height: 48px;
}
.action-left,
.action-right {
  display: flex;
  gap: 6px;
  align-items: center;
}
.action-bar .el-button {
  min-width: 80px;
  height: 36px;
  font-size: 14px;
  padding: 0 14px;
}

// 表格区域
.table-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.config-table {
  border-radius: 6px;
  overflow: hidden;

  .el-table__row:hover {
    background-color: #f0f9ff !important;
  }
}

.data-id {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', monospace;

  i {
    color: #409EFF;
  }

  &.copyable {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background: #f0f9ff;
      border: 1px solid #91d5ff;

      .copy-icon {
        opacity: 1;
        color: #1890ff;
      }
    }

    .copy-icon {
      opacity: 0;
      transition: all 0.2s ease;
      color: #999;
      font-size: 12px;
      margin-left: auto;
    }

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  align-items: center;
}
.action-buttons .el-link {
  padding: 0 4px;
  font-size: 13px;
  height: 28px;
  line-height: 28px;
  min-width: 0;
}
.action-buttons .el-link + .el-link {
  margin-left: 0;
}
::v-deep .action-buttons .el-link.is-underline:hover:after {
  border-bottom: none !important;
}
::v-deep .action-buttons .el-link .el-link--inner {
  text-decoration: none !important;
}

// 分页区域
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

// 弹窗样式
.import-dialog,
.result-dialog,
.clone-dialog,
.history-dialog,
.instances-dialog,
.compare-list-dialog,
.compare-dialog {
  .el-dialog__header {
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-dialog__title {
    font-weight: 600;
    color: #303133;
  }
}

.dialog-content {
  padding: 0;
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

// 导入弹窗
.import-form {
  margin-bottom: 20px;
}

.policy-select,
.namespace-select {
  width: 100%;
}

.upload-section {
  margin-top: 20px;
}

// 结果弹窗
.result-message {
  margin-bottom: 20px;
  display: block;
}

.fail-section,
.skip-section {
  margin-bottom: 20px;
}

.result-table {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
}

// 克隆弹窗
.clone-form {
  margin-bottom: 20px;
}

.clone-table-section {
  margin-top: 20px;
}

.clone-table {
  border-radius: 4px;
  overflow: hidden;
}

.edit-input {
  width: 100%;
}

// 历史记录弹窗
.history-table {
  border-radius: 6px;
  overflow: hidden;
}

.history-content {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
  }

  .history-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .history-body {
    .el-textarea__inner {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
    }
  }
}

// 服务实例弹窗
.instance-group {
  margin-bottom: 24px;
}

.cluster-section {
  margin-bottom: 16px;

  .cluster-header {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 4px;

    .group-info,
    .cluster-info {
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        color: #409EFF;
      }
    }
  }
}

.instance-table {
  border-radius: 4px;
  overflow: hidden;
}

.metadata {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

// 比较弹窗
.compare-table {
  border-radius: 6px;
  overflow: hidden;
}

.compare-header {
  margin-bottom: 20px;
}

.compare-body {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

// 链接样式优化
.el-link {
  font-size: 13px;

  &:hover {
    text-decoration: none;
  }
}

// 标签样式优化
.el-tag {
  border-radius: 4px;
}

// 响应式设计
@media (max-width: 1200px) {
  .sidebar {
    width: 180px;
    min-width: 160px;
    max-width: 180px !important;
  }
}

@media (max-width: 1024px) {
  .sidebar {
    width: 160px;
    min-width: 140px;
    max-width: 160px !important;
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .action-left,
  .action-right {
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .cluster-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
