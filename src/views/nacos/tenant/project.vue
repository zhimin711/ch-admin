<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['NACOS_PROJECT_PAGE']" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="租户" prop="tenantName" />
      <el-table-column label="项目代码">
        <template slot-scope="scope">
          <span v-if="scope.row.parentCode">{{ scope.row.parentCode + ':' + scope.row.code }}</span>
          <span v-else>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人">
        <template slot-scope="scope">
          <span>{{ scope.row.manager }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-link v-permission="['NACOS_PROJECTS_NAMESPACES_CHANGE']" type="primary" icon="el-icon-menu" @click="handleProjectNamespaces(scope.row)">分配空间</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible2" :title="'分配项目['+record.name+']空间'" width="635px">
      <el-alert
        title="请选择集群"
        type="info"
        :closable="false"
        effect="dark"
      />
      <el-menu :default-active="activeCluster" class="el-menu-demo" mode="horizontal" @select="loadNamespaces">
        <el-menu-item style="opacity: 1" index="0" disabled><el-tag>集群</el-tag></el-menu-item>
        <el-menu-item v-for="item in clusters" :key="item.value" :index="item.value">{{ item.label }}</el-menu-item>
      </el-menu>
      <div style="text-align:left;margin-bottom: 20px;margin-top: 10px">
        <el-transfer
          v-model="recordNamespaces"
          filterable
          :filter-method="filterNamespacesMethod"
          filter-placeholder="请输入空间"
          :data="namespaces"
          :titles="['未分配空间', '已分配空间']"
          :props="{ key: 'value', label: 'label' }"
        />
      </div>
      <div style="text-align:left;padding-left:220px">
        <el-button type="primary" @click="handleSubmitNamespaces">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageProjects, getProjectNamespaces, editProjectNamespaces } from '@/api/devops/nacos/projects'
import { listNacosCluster, listNacosClusterNamespaces } from '@/api/devops/nacos/cluster'

export default {
  name: 'NacosProjectNamespaces1',
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      record: {},
      dialogVisible2: false,
      activeCluster: '',
      clusters: [],
      namespaces: [],
      recordNamespaces: []
    }
  },
  created() {
    this.getList()
    this.listNacosClusters()
  },
  methods: {
    listNacosClusters() {
      if (this.clusters.length > 0) {
        return
      }
      listNacosCluster().then(resp => {
        if (resp.success) {
          this.clusters = resp.rows
          // this.activeIndex = this.clusters[0].value
          // this.loadNamespaces(this.clusters[0].value)
        }
      })
    },
    loadNamespaces(id) {
      this.activeCluster = id
      listNacosClusterNamespaces(this.activeCluster).then((resp) => {
        if (resp.success) {
          this.namespaces = resp.rows
        }
      })
      getProjectNamespaces(this.record.id).then(resp => {
        if (resp.success) {
          resp.rows.forEach(e => {
            this.recordNamespaces.push(e.value)
          })
        }
      })
    },
    getList() {
      this.listLoading = true
      pageProjects(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleProjectNamespaces(row) {
      //
      this.dialogVisible2 = true
      this.record = Object.assign({}, row)
      this.activeCluster = ''
      this.namespaces = []
      this.recordNamespaces = []
    },
    async handleSubmitNamespaces() {
      const resp = await editProjectNamespaces(this.record.id, this.recordNamespaces)
      if (resp && resp.success) {
        this.dialogVisible2 = false
      }
      this.$notify({
        title: '授权项目空间',
        dangerouslyUseHTMLString: true,
        message: `授权项目空间 ` + (resp && resp.success ? 'success!' : 'error...'),
        type: resp && resp.success ? 'success' : 'error'
      })
    },
    filterNamespacesMethod(query, item) {
      if (query === '') return true
      return item.label.indexOf(query) > -1
    },
    changeParent(val) {
      this.record.parentCode = ''
      if (val.length > 0) {
        this.record.parentCode = val[0]
        let obj = {}
        obj = this.options.parents.find((item) => {
          return item.value === val[0]
        })
        this.record.parentName = obj.label
      }
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

::v-deep .select-w .el-input__inner {
  width: 360px;
}

</style>
