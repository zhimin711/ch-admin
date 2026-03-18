<template>
  <div class="app-container">
    <div class="main-layout">
      <!-- 左侧项目列表 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">项目列表</h3>
          <div class="search-box">
            <el-input
              v-model="listQuery.params.name"
              placeholder="搜索项目..."
              size="small"
              clearable
              prefix-icon="el-icon-search"
              @input="handleSearch"
            />
          </div>
        </div>
        <div class="project-list">
          <div
            v-for="project in listQuery.list"
            :key="project.id"
            :class="['project-item', { active: selectedProject && selectedProject.id === project.id }]"
            @click="selectProject(project)"
          >
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-code">{{ project.code }}</div>
            </div>
            <div class="project-actions">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-user"
                @click.stop="handleProjectUsers(project)"
              >
                用户空间权限
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-files"
                @click.stop="handleProjectUsers(project)"
              >
                用户文件权限
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <pagination
            v-show="listQuery.total > 0"
            :total="listQuery.total"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.limit"
            layout="prev, pager, next"
            small
            @pagination="getList"
          />
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div v-if="!selectedProject" class="empty-state">
          <i class="el-icon-folder-opened empty-icon" />
          <h3>请选择项目</h3>
          <p>从左侧选择一个项目来查看详细信息</p>
        </div>

        <div v-else class="project-detail">
          <div class="project-header">
            <h2 class="project-title">{{ selectedProject.name }}</h2>
            <div class="project-meta">
              <el-tag type="info">{{ selectedProject.code }}</el-tag>
              <span class="manager">
                <i class="el-icon-user" />
                {{ selectedProject.manager }}
              </span>
            </div>
          </div>

          <!-- 命名空间管理区域 -->
          <div class="namespace-management">
            <div class="section-title">
              <i class="el-icon-menu" />
              命名空间管理
            </div>
            <ProjectNamespaceManager
              :project="selectedProject"
              @update="handleProjectUpdate"
            />
          </div>
        </div>
      </div>
    </div>

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
              label="列表"
            >
              <template slot-scope="{row}">
                <el-checkbox :checked="row.list" @change="row.list = !row.list" />
              </template>
            </el-table-column>
            <el-table-column
              prop="permission"
              label="只读"
            >
              <template slot-scope="{row}">
                <el-checkbox :checked="row.read" @change="row.read = !row.read" />
              </template>
            </el-table-column>
            <el-table-column
              prop="permission"
              label="修改"
            >
              <template slot-scope="{row}">
                <el-checkbox :checked="row.write" @change="row.write = !row.write" />
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
import ProjectNamespaceManager from '../components/ProjectNamespaceManager.vue'

const roleMap = {
  'MGR': '项目负责人',
  'DEV': '开发人员',
  'TEST': '测试人员'
}
export default {
  name: 'NacosProjectNamespaces',
  components: {
    ProjectNamespaceManager
  },
  data() {
    return {
      loadingSave: false,
      listLoading: true,
      selectedProject: null,
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
    // 选择项目
    selectProject(project) {
      this.selectedProject = project
    },

    // 搜索项目
    handleSearch() {
      this.listQuery.page = 1
      this.getList()
    },

    // 项目更新处理
    handleProjectUpdate() {
      this.getList()
    },

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
            const permission = (row.permission || '').toLowerCase()
            // row.permission 包含L标记为列表
            if (permission.includes('l')) {
              row.list = true
            } else {
              row.list = false
            }
            // row.permission 包含R标记为只读
            if (permission.includes('r')) {
              row.read = true
            } else {
              row.read = false
            }
            // row.permission 包含W标记为修改
            if (permission.includes('w')) {
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
      const payload = this.recordUserPermissions.map(row => {
        const permission = `${row.list ? 'l' : ''}${row.read ? 'r' : ''}${row.write ? 'w' : ''}`
        row.permission = permission
        return {
          ...row,
          projectId: row.projectId || this.record.id,
          userId: row.userId || this.activeUser,
          permission,
          list: !!row.list,
          read: !!row.read,
          write: !!row.write
        }
      })
      updateNacosProjectUserPermission(this.record.id, payload).then(resp => {
        if (resp.success) {
          this.dialogVisible3 = false
          this.$message.success('保存成功！')
        } else {
          this.$message.error('保存失败！' + resp.message)
        }
      }).finally(() => {
        this.loadingSave = false
      })
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

<style lang="scss" scoped>
.app-container {
  height: calc(100vh - 84px);
  overflow: hidden;
}

.main-layout {
  display: flex;
  height: 100%;
  gap: 16px;
}

// 左侧边栏
.sidebar {
  width: 350px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;

    .sidebar-title {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }

    .search-box {
      .el-input {
        width: 100%;
      }
    }
  }

  .project-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .project-item {
      padding: 12px;
      margin-bottom: 8px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }

      &.active {
        border-color: #409eff;
        background: #f0f8ff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }

      .project-info {
        .project-name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .project-code {
          font-size: 12px;
          color: #909399;
          margin-bottom: 6px;
        }

        .project-manager {
          font-size: 12px;
          color: #606266;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .project-actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;

        .el-button {
          padding: 4px 8px;
          font-size: 12px;
        }
      }
    }
  }

  .pagination-wrapper {
    padding: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: center;
  }
}

// 右侧内容区域
.content-area {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #606266;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  .project-detail {
    height: 100%;
    display: flex;
    flex-direction: column;

    .project-header {
      padding: 24px;
      border-bottom: 1px solid #f0f0f0;

      .project-title {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 20px;
        font-weight: 600;
      }

      .project-meta {
        display: flex;
        align-items: center;
        gap: 16px;

        .manager {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #606266;
          font-size: 14px;
        }
      }
    }

    .namespace-management {
      flex: 1;
      padding: 24px;
      overflow-y: auto;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-layout {
    flex-direction: column;

    .sidebar {
      width: 100%;
      height: 300px;

      .project-list {
        .project-item {
          .project-actions {
            flex-wrap: wrap;
          }
        }
      }
    }

    .content-area {
      height: calc(100vh - 400px);
    }
  }
}

// 原有样式保留
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
