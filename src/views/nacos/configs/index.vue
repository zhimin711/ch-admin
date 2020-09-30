<template>
  <div class="app-container">
    <sticky :z-index="10" :class-name="'sub-navbar2 '">
      <tenant v-model="namespace" @change="changeNacosTenant" />
    </sticky>
    <div class="filter-container">
      <el-form ref="queryForm" :model="listQuery" :inline="true">
        <el-form-item label="Data ID">
          <el-input v-model="listQuery.dataId" placeholder="请输入Data ID" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="Group">
          <el-input v-model="listQuery.group" placeholder="请输入Group" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate()">创建配置</el-button>
      <el-button class="filter-item" type="danger" @click="handleCreate()">删除</el-button>
      <!--<el-button class="filter-item" type="primary" @click="handleCreate()">导出查询结果</el-button>-->
      <el-button class="filter-item" type="success" plain @click="handleExports()">导出配置</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate()">导入配置</el-button>
      <el-button class="filter-item" type="primary" plain @click="handleCreate()">克隆配置</el-button>
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
      <el-table-column label="归属应用" min-width="100" prop="appName" />
      <el-table-column align="center" prop="created_at" label="操作" min-width="150">
        <template slot-scope="{row}">
          <el-button type="text" @click.native="handleDetail(row)">详情</el-button>
          <el-button type="text" @click.native="handleUpdate(row)">编辑</el-button>
          <el-button type="text" @click.native="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="count>0" :total="count" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize" @pagination="fetchData()" />
  </div>
</template>

<script>
import { pageNacosConfigs, addNacosConfigs, updateNacosConfigs, deleteNacosConfigs, exportNacosConfigs } from '@/api/nacos/configs'
import Pagination from '@/components/Pagination'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/tenant' // 粘性header组件

export default {
  name: 'NacosConfigs1',
  components: { Pagination, Sticky, Tenant },
  data() {
    return {
      namespace: '',
      list: null,
      listLoading: true,
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
      dialogFormVisible: false,
      dialogInstances: false,
      rules: {
        dataId: [{ required: true, message: 'Data ID 不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group 不能为空', trigger: 'change' }]
      }
    }
  },
  // { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'change' }
  created() {
    this.fetchData()
  },
  methods: {
    changeNacosTenant(val) {
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    fetchData() {
      this.listLoading = true
      this.listQuery.tenant = this.$store.getters.tenant
      pageNacosConfigs(this.listQuery).then(res => {
        this.list = res.pageItems
        this.count = res.totalCount
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
      this.$router.push('/nacos/configs/add?namespaceId=')
    },
    dataOperation() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            addNacosConfigs(this.nodeModel).then(res => {
              this.operationRes(res)
            })
          }
          if (this.dialogStatus === 'update') {
            updateNacosConfigs(this.nodeModel).then(res => {
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
    handleDetail(row) {
      this.$router.push(`/nacos/configs/detail?namespaceId=${row.namespaceId || ''}&dataId=${row.dataId}&group=${row.group}`)
    },
    handleUpdate(row) {
      this.$router.push(`/nacos/configs/edit?namespaceId=${row.namespaceId || ''}&dataId=${row.dataId}&group=${row.group}`)
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
    handleDelete(row) {
      deleteNacosConfigs(row).then((res) => {
        if (res) {
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
      })
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
          tenant: '', // getParams('namespace')
          group: this.listQuery.group,
          appName: this.listQuery.appName,
          dataId: this.listQuery.dataId,
          ids: ''
        }
      }
      exportNacosConfigs(params)
    }
  }
}
</script>
<style scoped>
  .filter-container {
    padding-top: 10px;
  }
</style>
