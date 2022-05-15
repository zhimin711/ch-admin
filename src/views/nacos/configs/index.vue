<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <sticky :z-index="10" :class-name="'sub-navbar2 '">
          <tenant v-model="namespaceId" @change="handleNamespaceChange" @finish="loadNamespacesFinish" />
        </sticky>
        <div class="query-container">
          <el-form ref="queryForm" :model="listQuery" :inline="true">
            <el-form-item label="Data ID">
              <el-input v-model="listQuery.dataId" placeholder="请输入Data ID" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="Group">
              <el-input v-model="listQuery.group" placeholder="请输入Group" style="width: 200px;" />
            </el-form-item>
          </el-form>
          <el-button type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
          <el-button v-permission="'NacosConfigsIndexAdd'" type="primary" @click="handleCreate()">创建配置</el-button>
          <el-button v-permission="'NacosConfigsIndexDelete'" type="danger" @click="onDelete2()">删除</el-button>
          <!--<el-button type="primary" @click="handleCreate()">导出查询结果</el-button>-->
          <el-button v-permission="'NacosConfigsIndexExport'" type="success" plain @click="handleExports()">导出配置</el-button>
          <el-button v-permission="'NacosConfigsIndexImport'" type="primary" @click="handleImports()">导入配置</el-button>
          <el-button v-permission="'NacosConfigsIndexClone'" type="primary" plain @click="handleClone()">克隆配置</el-button>
        </div>
        <el-table
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
          <!--          <el-table-column label="归属应用" min-width="100" prop="appName" />-->
          <el-table-column align="center" prop="created_at" label="操作" min-width="150">
            <template slot-scope="{row}">
              <el-button v-permission="'NacosConfigsIndexSearch'" type="text" @click.native="handleDetail(row)">详情</el-button>
              <el-button type="text" @click.native="handleCode(row)">示例代码</el-button>
              <el-button v-permission="'NacosConfigsIndexEdit'" type="text" @click.native="handleUpdate(row)">编辑</el-button>
              <el-button v-permission="'NacosConfigsIndexDelete'" type="text" @click.native="onDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="count>0" :total="count" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="fetchData()" />
      </el-col>
    </el-row>
    <el-dialog title="删除配置" :visible.sync="dialogVisible2Del" width="380px">
      <el-alert
        title="确定要删除以下配置吗？"
        type="error"
        center
        :closable="false"
        show-icon
      />
      <el-table :data="multipleSelection">
        <el-table-column property="dataId" label="Data Id" />
        <el-table-column property="group" label="Group" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="dialogVisible2Del = false">关闭</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleDelete()">确定</el-button>
      </span>
    </el-dialog>
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
            <el-option v-for="item in namespaces" :key="item.namespace" :label="item.namespaceShowName" :value="item.namespace" />
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
            <el-input v-model="row.group" class="edit-input" size="small" />
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="dialogLoading" @click="dialogVisible2Clone = false">关闭</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="onClone">开始克隆</el-button>
      </span>
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
import { exportNacosConfigs, cloneNacosConfigs } from '@/api/nacos/configs'
import { pageNacosConfigs, deleteNacosConfig } from '@/api/devops/nacos/configs'
import SingleFile from '@/components/Upload/SingleFile2'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/clusterNamespaces' // 粘性header组件
import CodeViewer from '../components/showCodeConfig' // 粘性header组件
import { deepClone } from '@/utils'

const opName = {
  'IMPORT': '导入',
  'CLONE': '克隆'
}
export default {
  name: 'NacosConfigsIndex1',
  components: { Sticky, Tenant, SingleFile, CodeViewer },
  data() {
    return {
      list: null,
      namespaceId: '',
      namespaces: [],
      listLoading: false,
      multipleSelection: [],
      count: 0,
      listQuery: {
        search: 'accurate',
        namespaceId: '',
        dataId: '',
        group: '',
        pageNo: 1,
        pageSize: 10
      },
      dialogLoading: false,
      dialogVisible2Del: false,
      dialogVisible2Import: false,
      dialogVisible2ImportResult: false,
      dialogVisible2Clone: false,
      dialogVisible2Code: false,
      importMessage: '',
      record: {},
      toNamespace: '',
      titles: {
        importResult: '',
        fail: '',
        skip: ''
      },
      tables: {
        importSuccess: [],
        importFail: [],
        importSkip: [],
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
        return tenant.id === tmp
      })
      if (tenant) {
        return tenant.label
      }
      return ''
    },
    importUrl() {
      return '/api/nacos/v1/cs/configs?import=true&namespace=' + this.namespaceId
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
  },
  methods: {
    loadNamespacesFinish(data) {
      this.namespaces = data
      if (data.length > 0) this.namespaceId = data[0].value
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleNamespaceChange(val) {
      // this.namespaceId = val
      // console.log(this.namespaceId, val)
      this.queryData()
    },
    fetchData() {
      this.listQuery.namespaceId = this.namespaceId
      this.listQuery.search = 'accurate'
      if (this.listQuery.dataId || this.listQuery.group) {
        this.listQuery.search = 'blur'
      }
      this.listLoading = true
      pageNacosConfigs(this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.count = resp.total
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    queryData() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.listQuery.pageNo = 1
          this.fetchData()
        }
      })
    },
    handleCreate() {
      this.$router.push(`/nacos/configs/add?namespaceId=${this.namespaceId}`)
    },
    handleDetail(row) {
      this.$router.push(`/nacos/configs/detail?namespaceId=${row.namespaceId || this.namespaceId}&dataId=${row.dataId}&group=${row.group}`)
    },
    handleCode(row) {
      this.record = Object.assign({}, row)
      this.record.content = undefined
      this.dialogVisible2Code = true
    },
    handleUpdate(row) {
      this.$router.push(`/nacos/configs/edit?namespaceId=${row.namespaceId || this.namespaceId}&dataId=${row.dataId}&group=${row.group}`)
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
    onDelete2() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的配置！')
        return
      }
      this.dialogVisible2Del = true
    },
    async handleDelete(row) {
      let params = {}
      if (row) {
        params = Object.assign({}, row)
      } else {
        this.dialogVisible2Del = false
        params.ids = this.multipleSelection.map(item => item.id).join(',')
      }
      params.namespaceId = this.namespaceId
      const resp = await deleteNacosConfig(params)
      if (resp && resp.success && resp.rows[0]) {
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
      const msg = isSelected ? '将导出选择配置' : '将导出当前查询到或当前租户的配置'
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
          tenant: this.listQuery.tenant,
          group: this.listQuery.group || '',
          appName: this.listQuery.appName || '',
          dataId: this.listQuery.dataId || '',
          ids: ''
        }
      }
      exportNacosConfigs(params)
    },
    handleImports() {
      this.dialogVisible2Import = true
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
    onClone() {
      const params = {}
      const tenant = this.namespaces.find(tenant => {
        return tenant.namespace === this.toNamespace
      })
      params.tenant = tenant.namespace || tenant.namespaceShowName
      params.policy = this.policy
      params.namespaceId = ''
      const data = this.tables.clone.map(item => {
        return { cfgId: item.id, dataId: item.dataId, group: item.group }
      })
      this.dialogLoading = true
      cloneNacosConfigs(params, data).then(resp => {
        this.dialogVisible2Clone = false
        this.handleResult(resp, 'CLONE')
      }).finally(() => {
        this.dialogLoading = false
      })
    },
    handleResult(resp, op) {
      this.dialogVisible2ImportResult = true
      const { data, message } = resp
      this.titles.importResult = message
      this.tables.importFail = []
      this.tables.importSkip = []
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
    }
  }
}
</script>
