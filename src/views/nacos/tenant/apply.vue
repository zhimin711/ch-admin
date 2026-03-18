<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form ref="queryForm" :model="listQuery.params" :inline="true" label-width="68px">
        <el-form-item label="审核状态" prop="status">
          <el-select v-model="listQuery.params.status" placeholder="审核状态" clearable size="small">
            <el-option
              v-for="dict in dict.type.approveStatus1"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="申请类型" width="120" align="center">
        <template slot-scope="{row}">
          <el-tag :type="isConfigApply(row) ? 'warning' : 'info'">
            {{ isConfigApply(row) ? '配置权限' : '空间权限' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请项目" width="180" prop="namespaceShowName">
        <template slot-scope="{row}">
          {{ parseProjectName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="申请集群" width="120">
        <template slot-scope="{row}">
          {{ parseClusterName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="申请空间" prop="namespace">
        <template slot-scope="{row}">
          {{ parseProjectNamespace(row) }}
        </template>
      </el-table-column>
      <el-table-column label="申请内容" min-width="300">
        <template slot-scope="{row}">
          <span :title="parseApplyContent(row)">{{ parseApplyContent(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" width="100" align="center" prop="createBy" />
      <el-table-column prop="createAt" label="申请时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createAt" label="状态" width="100">
        <template slot-scope="{row}">
          <el-tag v-if="row.status==='0'">待审核</el-tag>
          <el-tag v-else-if="row.status==='1'" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已拒绝</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="{row}">
          <el-button
            v-if="row.status==='0'"
            v-permission="'NACOS_PROJECT_APPLY_APPROVE'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleApprove(row)"
          >审核</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogApproveVisible"
      width="60%"
    >
      <el-card class="box-card">
        <el-form ref="form" :model="record" label-width="150px">
          <el-form-item label="申请类型:">
            {{ isRecordConfigApply ? '配置文件权限申请' : '命名空间权限申请' }}
          </el-form-item>
          <el-form-item label="申请项目:">
            {{ recordContent.projectName }}
          </el-form-item>
          <el-form-item label="申请集群:">
            {{ recordContent.clusterName }}
          </el-form-item>
          <el-form-item label="申请空间:">
            {{ isRecordConfigApply ? recordContent.namespaceName : recordContent.namespaceNames }}
          </el-form-item>
          <el-form-item v-if="isRecordConfigApply" label="申请配置:">
            <span>{{ parseConfigNames(recordContent.configList) }}</span>
          </el-form-item>
          <el-form-item v-if="isRecordConfigApply" label="配置权限明细:">
            <el-table :data="recordConfigList" size="mini" border style="width: 100%">
              <el-table-column label="DataId" prop="dataId" min-width="180" />
              <el-table-column label="Group" prop="group" min-width="180" />
              <el-table-column label="权限" min-width="100" align="center">
                <template slot-scope="scope">
                  <el-tag size="mini" :type="permissionTagType(scope.row.permission)">
                    {{ formatPermission(scope.row.permission) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="申请人:">
            {{ record.createBy }}
          </el-form-item>
          <el-form-item label="申请时间:">
            {{ record.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
          </el-form-item>
        </el-form>
      </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" :loading="loadingApprove" @click="submitApprove(1)">通 过</el-button>
        <el-button type="danger" :loading="loadingApprove" @click="submitApprove(4)">拒 绝</el-button>
        <el-button type="primary" @click="dialogApproveVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { pageApplyNamespaces, approveApplyNamespaces } from '@/api/devops/nacos/namespace-apply'

export default {
  name: 'NacosProjectApply',
  dictionary: ['approveStatus1'],
  data() {
    return {
      list: null,
      listLoading: true,
      listLoading2: false,
      count: 0,
      listQuery: {
        params: {},
        page: 1,
        size: 10
      },
      dialogApproveVisible: false,
      loadingApprove: false,
      textMap: {
        approve: '空间申请审核'
      },
      record: {},
      recordContent: {},
      recordConfigList: [],
      rules: {
        namespaceShowName: [{ required: true, message: '命名空间名称不能为空', trigger: 'change' }],
        namespaceDesc: [{ required: true, message: '命名空间描述不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  computed: {
    isRecordConfigApply() {
      return this.recordContent.applyType === 'config'
    },
    dialogTitle() {
      return this.isRecordConfigApply ? '配置文件权限申请审核' : '空间申请审核'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    parseContent(row) {
      if (!row) {
        return {}
      }
      if (row._parsedApplyContent) {
        return row._parsedApplyContent
      }
      let obj = {}
      try {
        obj = JSON.parse(row.content || '{}')
      } catch (e) {
        obj = {}
      }
      this.$set(row, '_parsedApplyContent', obj)
      return obj
    },
    isConfigApply(row) {
      const obj = this.parseContent(row)
      return obj.applyType === 'config'
    },
    parseProjectName(row) {
      const obj = this.parseContent(row)
      return obj.projectName
    },
    parseClusterName(row) {
      const obj = this.parseContent(row)
      return obj.clusterName
    },
    parseProjectNamespace(row) {
      const obj = this.parseContent(row)
      return this.isConfigApply(row) ? obj.namespaceName : obj.namespaceNames
    },
    parseApplyContent(row) {
      const obj = this.parseContent(row)
      if (this.isConfigApply(row)) {
        return obj.configNames || this.parseConfigNames(obj.configList)
      }
      return obj.namespaceNames || '-'
    },
    parseConfigNames(configList) {
      const rows = this.normalizeConfigList(configList)
      if (!rows.length) {
        return '-'
      }
      return rows.map(item => `${item.dataId}#${item.group}(${this.formatPermission(item.permission)})`).join(' | ')
    },
    normalizeConfigList(configList) {
      if (!Array.isArray(configList)) {
        return []
      }
      return configList.map(item => {
        const row = item || {}
        const permission = row.permission && row.permission.code ? row.permission.code : row.permission
        return {
          dataId: row.dataId || '-',
          group: row.group || row.groupName || '-',
          permission: permission || '-'
        }
      })
    },
    permissionCodes(permission) {
      if (!permission) {
        return []
      }
      const code = String(permission).toUpperCase()
      return Array.from(code).filter(item => ['L', 'R', 'W'].includes(item))
    },
    formatPermission(permission) {
      const map = {
        L: '列表',
        R: '读',
        W: '写'
      }
      const codes = this.permissionCodes(permission)
      if (!codes.length) {
        return permission || '-'
      }
      return codes.map(code => map[code]).join('+')
    },
    permissionTagType(permission) {
      const codes = this.permissionCodes(permission)
      if (codes.includes('W')) {
        return 'danger'
      }
      if (codes.includes('R')) {
        return 'success'
      }
      return 'info'
    },
    fetchData() {
      this.listLoading = true
      pageApplyNamespaces(this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.count = resp.total || 0
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetModel() {
      this.record = {}
      this.recordContent = {}
      this.recordConfigList = []
    },
    submitApprove(status) {
      this.record.status = status
      this.loadingApprove = true
      approveApplyNamespaces(this.record).then(resp => {
        if (resp.success) {
          this.dialogApproveVisible = false
          this.$message.success('操作成功！')
          this.fetchData()
        }
      }).finally(() => {
        this.loadingApprove = false
      })
    },
    handleApprove(row) {
      this.resetModel()
      this.record = Object.assign({}, row)
      this.recordContent = this.parseContent(row)
      this.recordConfigList = this.normalizeConfigList(this.recordContent.configList)
      this.dialogStatus = 'approve'
      this.dialogApproveVisible = true
    }
  }
}
</script>
