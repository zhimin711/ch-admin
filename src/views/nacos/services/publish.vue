<template>
  <div class="app-container">
    <sticky :z-index="10" :class-name="'sub-navbar2 '">
      <tenant v-model="namespaceId" :default-first="true" @change="queryData" />
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
      <el-button type="info" icon="el-icon-search" plain @click="fetchData">查询</el-button>
      <el-button v-permission="'NacosServicesIndexAdd'" type="primary" icon="el-icon-plus" @click="handleCreate()">创建服务</el-button>
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
      <el-table-column label="分组名称" min-width="150" prop="groupName" />
      <el-table-column label="集群数目" width="80" align="center" prop="clusterCount" />
      <el-table-column label="实例数" width="70" align="center" prop="ipCount" />
      <el-table-column label="健康实例数" width="100" align="center" prop="healthyInstanceCount" />
      <el-table-column class-name="status-col" label="触发保护阈值" width="110" align="center" prop="triggerFlag" />
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="{row}">
          <el-button v-permission="'NacosServicesIndexDetail'" type="text" @click.native="handleDetail(row)">详情</el-button>
          <el-button type="text" @click.native="handleCode(row)">示例代码</el-button>
          <!--<el-button type="text" @click.native="handleUpdate(row)">编辑</el-button>-->
          <el-button v-permission="'NacosServicesIndexDelete'" type="text" @click.native="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="fetchData()" />

    <el-dialog :visible.sync="dialogVisible" title="创建服务" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="record" label-position="left" label-width="100px">
        <el-form-item label="服务名" prop="serviceName">
          <el-input v-model="record.serviceName" />
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
          <!--<el-input v-model="record.selector" placeholder="" />-->
          <el-select v-model="selector.type">
            <el-option key="none" label="默认" value="none" />
            <el-option key="label" label="标签" value="label" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selector.type === 'label'" label="表达式">
          <el-input v-model="selector.expression" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit()">确定</el-button>
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
import { pageNacosServices, addNacosService, deleteNacosService } from '@/api/devops/nacos/services'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/clusterNamespaces' // 粘性header组件
import CodeViewer from '../components/showCodeService' // 粘性header组件
import JsonEditor from '@/components/JsonEditor'
import { isEmpty } from '@/utils/validate'

const defaultRecord = {
  protectThreshold: 1,
  metadata: ''
}
export default {
  name: 'NacosServicesIndex',
  components: { Sticky, Tenant, CodeViewer, JsonEditor },
  data() {
    return {
      listLoading: false,
      list: [],
      count: 0,
      listQuery: {
        hasIpCount: true,
        withInstances: false,
        pageNo: 1,
        pageSize: 10
      },
      dialogVisible: false,
      dialogVisible2Code: false,
      namespaceId: '',
      record: {},
      rules: {
        serviceName: [{ required: true, message: '服务名称不能为空', trigger: 'change' }],
        protectThreshold: [{ required: true, message: '保护阈值不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create',
      selector: {
        type: 'none',
        expression: ''
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      if (this.namespaceId === '') return
      this.listQuery.namespaceId = this.namespaceId
      this.listLoading = true
      pageNacosServices(this.listQuery).then(resp => {
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
      if (this.namespaceId === '0') {
        this.$message.warning('请选择空间')
        return
      }
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.record = Object.assign({}, defaultRecord)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCode(row) {
      this.record = Object.assign({}, row)
      this.record.content = undefined
      this.dialogVisible2Code = true
    },
    handleSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            this.record.namespaceId = this.namespaceId
            if (isEmpty(this.record.groupName)) this.record.groupName = 'DEFAULT_GROUP'
            addNacosService(this.record).then(resp => {
              const ok = resp.success && resp.rows[0]
              if (ok) {
                this.fetchData()
                this.dialogVisible = false
              }
              this.$message({
                message: (ok ? '创建服务成功' : '创建服务失败, ' + resp.message + '已存在'),
                type: (ok ? 'success' : 'error')
              })
            })
          }
        }
      })
    },
    onDelete(row) {
      this.$confirm('确定要删除此服务吗？', '删除服务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleDelete(row)
      })
    },
    async handleDelete(row) {
      const params = {}
      params.namespaceId = this.namespaceId
      params.serviceName = row.name
      params.groupName = row.groupName
      const resp = await deleteNacosService(params)
      if (resp.success && resp.rows[0]) {
        this.fetchData()
        this.$message({
          message: '删除服务成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: '删除服务失败',
          type: 'error'
        })
      }
    },
    convertData(data) {
      const formData = new URLSearchParams()
      for (const i in data) {
        formData.append(i, data[i])
      }
      formData.append('namespaceId', this.$store.getters.tenant)
      formData.append('selector', JSON.stringify(this.selector))
      return formData
    },
    handleDetail(row) {
      this.$router.push(`/nacos/services/detail?namespaceId=${this.namespaceId}&serviceName=${row.name}&groupName=${row.groupName}`)
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
