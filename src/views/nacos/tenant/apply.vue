<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input v-model="listQuery.namespaceShowName" placeholder="命名空间名称" style="width: 200px;" class="filter-item" />-->
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="申请项目" width="180" prop="namespaceShowName">
        <template slot-scope="{row}">
          {{ parseProjectName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="申请空间" prop="namespace">
        <template slot-scope="{row}">
          {{ parseProjectNamespace(row) }}
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
          <el-tag v-if="row.status==='1'" type="success">已通过</el-tag>
          <el-tag v-if="row.status==='2'" type="danger">已拒绝</el-tag>
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
      title="空间申请审核"
      :visible.sync="dialogApproveVisible"
      width="60%"
    >
      <el-card class="box-card">
        <el-form ref="form" :model="record" label-width="150px">
          <el-form-item label="申请项目:">
            {{ recordContent.projectName }}
          </el-form-item>
          <el-form-item label="申请集群:">
            {{ recordContent.clusterName }}
          </el-form-item>
          <el-form-item label="申请空间:">
            {{ recordContent.namespaceNames }}
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
  data() {
    return {
      list: null,
      listLoading: true,
      listLoading2: false,
      count: 0,
      listQuery: {
        page: 1,
        size: 20
      },
      dialogApproveVisible: false,
      loadingApprove: false,
      textMap: {
        approve: '空间申请审核'
      },
      record: {},
      recordContent: {},
      rules: {
        namespaceShowName: [{ required: true, message: '命名空间名称不能为空', trigger: 'change' }],
        namespaceDesc: [{ required: true, message: '命名空间描述不能为空', trigger: 'change' }]
      },
      dialogStatus: 'create'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    parseProjectName(row) {
      const obj = JSON.parse(row.content)
      return obj.projectName
    },
    parseProjectNamespace(row) {
      const obj = JSON.parse(row.content)
      return obj.namespaceNames
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
      this.recordContent = JSON.parse(row.content)
      this.dialogStatus = 'approve'
      this.dialogApproveVisible = true
    }
  }
}
</script>
