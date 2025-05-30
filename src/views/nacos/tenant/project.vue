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
          <!--  v-permission="['NACOS_PROJECTS_NAMESPACES_USERS']" -->
          <el-link v-permission="['NACOS_PROJECTS_NAMESPACES_USERS']" type="primary" icon="el-icon-user" @click="handleProjectUsers(scope.row)">用户权限</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible2" :title="'项目['+record.name+']分配空间'" width="635px">
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
          @change="changeNamespaces"
        />
        <el-alert
          v-if="namespaceList.length>0"
          title="修改 GroupId (可选操作, 默认为项目代码)"
          type="warning"
          :closable="false"
          show-icon
        />
        <el-table :data="namespaceList">
          <el-table-column property="id" label="空间名称">
            <template slot-scope="{row}">
              <el-input v-model="row.namespaceName" class="edit-input" size="small" disabled />
            </template>
          </el-table-column>
          <el-table-column property="groupId" label="Nacos分组">
            <template slot-scope="{row}">
              <el-input v-model="row.groupId" class="edit-input" size="small" placeholder="默认为项目代码" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="text-align:left;padding-left:220px">
        <el-button :loading="loadingSave" type="primary" @click="handleSubmitNamespaces">保存</el-button>
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible3" :title="'项目[' + record.name + ']的用户权限'" width="80%">
      <el-row>
        <el-col :span="6">
          <el-menu
            v-if="dialogVisible3"
            :default-active="activeUser"
            :unique-opened="true"
            :default-openeds="activeUsers"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @select="handleSelectUser"
          >
            <el-submenu v-for="item in users" :key="item.value" :index="item.value">
              <template slot="title">
                <i class="el-icon-s-unfold" />
                <span>{{ item.label }}</span>
              </template>
              <el-menu-item v-for="item2 in item.children" :key="item2.value" :index="item2.value">
                <template slot="title">
                  <i class="el-icon-user" />
                  <span>{{ item2.label }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-col>
        <el-col :span="18">
          <el-table
            :data="recordUserPermissions"
            :span-method="objectSpanMethod"
            border
            style="width: 100%; margin-left: 5px"
          >
            <el-table-column
              prop="clusterName"
              label="集群名称"
              width="180"
            />
            <el-table-column
              prop="namespaceName"
              label="空间名称"
            />
            <el-table-column
              prop="permission"
              label="只读"
            >
              <template slot-scope="{row}">
                <el-checkbox :checked="row.read" @change="row.read=!row.read" />
              </template>
            </el-table-column>
            <el-table-column
              prop="permission"
              label="修改"
            >
              <template slot-scope="{row}">
                <el-checkbox :checked="row.write" @change="row.write=!row.write" />
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div style="text-align:center;padding-left:220px;margin-top:10px">
        <el-button :loading="loadingSave" type="primary" @click="handleSubmitUserPermissions">保存</el-button>
        <el-button type="danger" @click="dialogVisible3=false">取消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { pageProjects, getProjectNamespaces, editProjectNamespaces, listNacosProjectUsers, listNacosProjectUserPermission, updateNacosProjectUserPermission } from '@/api/devops/nacos/projects'
import { listNacosCluster, listNacosClusterNamespaces } from '@/api/devops/nacos/cluster'

const roleMap = {
  'MGR': '项目负责人',
  'DEV': '开发人员',
  'TEST': '测试人员'
}
export default {
  name: 'NacosProjectNamespaces',
  data() {
    return {
      loadingSave: false,
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
      dialogVisible3: false,
      activeCluster: '',
      activeUser: '',
      activeUsers: [],
      group: '',
      clusters: [],
      namespaces: [],
      namespaceList: [],
      recordNamespaces: [],
      users: [],
      recordUserPermissions: []
    }
  },
  created() {
    this.getList()
    this.listNacosClusters()
  },
  methods: {
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (row.clusterCount > 0) {
          return {
            rowspan: row.clusterCount,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleSelectUser(key, keyPath) {
      listNacosProjectUserPermission(this.record.id, key).then(resp => {
        if (resp.success) {
          this.recordUserPermissions = resp.rows
          const clusterIdMap = resp.rows.reduce((acc, row) => {
            if (!acc[row.clusterId]) {
              acc[row.clusterId] = { clusterId: row.clusterId, count: 0, namespaceId: row.namespaceId }
            }
            acc[row.clusterId].count++
            return acc
          }, {})
          this.recordUserPermissions.forEach(row => {
            const merge = clusterIdMap[row.clusterId]
            if (merge.namespaceId === row.namespaceId) {
              row.clusterCount = clusterIdMap[row.clusterId].count
            }
            // row.permission 包含R标记为只读
            if (row.permission.includes('r')) {
              row.read = true
            } else {
              row.read = false
            }
            // row.permission 包含W标记为修改
            if (row.permission.includes('w')) {
              row.write = true
            } else {
              row.write = false
            }
          })
        }
      })
    },
    handleSubmitUserPermissions() {
      this.loadingSave = true
      this.recordUserPermissions.forEach(row => {
        row.permission = row.read ? 'r' : ''
        row.permission += row.write ? 'w' : ''
      })
      updateNacosProjectUserPermission(this.record.id, this.recordUserPermissions).then(resp => {
        if (resp.success) {
          this.dialogVisible3 = false
          this.$message.success('保存成功！')
        } else {
          this.$message.error('保存失败！' + resp.message)
        }
      }).finally(this.loadingSave = false)
    },
    handleProjectUsers(row) {
      this.dialogVisible3 = true
      this.record = Object.assign({}, row)
      this.users = []
      this.recordUserPermissions = []
      listNacosProjectUsers(row.id).then(resp => {
        if (resp.success) {
          const userGroup = resp.rows.reduce((acc, user) => {
            if (!acc[user.role]) {
              acc[user.role] = []
            }
            acc[user.role].push({ 'label': user.realName, 'value': user.userId })
            return acc
          }, {})
          Object.keys(roleMap).forEach(e => {
            if (userGroup[e]) {
              this.users.push({
                label: roleMap[e],
                value: e,
                children: userGroup[e]
              })
            }
          })
          console.log(this.users)
          this.activeUser = ''
          this.activeUsers = ['MGR']
        }
      })
    },
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
      this.recordNamespaces = []
      getProjectNamespaces(this.record.id, this.activeCluster).then(resp => {
        if (resp.success) {
          resp.rows.forEach(e => {
            this.recordNamespaces.push(e.namespaceId + '')
          })
          this.namespaceList = resp.rows
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
      this.namespaceList = []
      this.recordNamespaces = []
    },
    async handleSubmitNamespaces() {
      this.loadingSave = true
      const resp = await editProjectNamespaces(this.record.id, this.activeCluster, this.namespaceList)
        .finally(() => {
          this.loadingSave = false
        })
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
    changeNamespaces(val) {
      if (val.length < this.namespaceList.length) {
        this.namespaceList = this.namespaceList.filter((item) => val.includes(item.namespaceId + ''))
      } else {
        const select_ids = this.namespaceList.map((item) => item.namespaceId + '')
        const new_ids = val.filter((id) => !select_ids.includes(id))
        this.namespaces.forEach((item) => {
          if (new_ids.includes(item.value)) {
            this.namespaceList.push({
              'namespaceId': item.value,
              'namespaceName': item.label,
              'groupId': ''
            })
          }
        })
      }
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
