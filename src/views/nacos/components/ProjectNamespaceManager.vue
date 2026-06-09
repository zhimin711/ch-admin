<template>
  <div class="namespace-manager">
    <!-- 集群选择 -->
    <div class="cluster-section">
      <div class="section-header">
        <h4>选择集群</h4>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-refresh"
          @click="loadClusters"
        >
          刷新集群
        </el-button>
      </div>

      <el-menu
        v-if="clusters.length > 0"
        :default-active="activeCluster"
        class="cluster-menu"
        mode="horizontal"
        @select="selectCluster"
      >
        <el-menu-item
          v-for="cluster in clusters"
          :key="cluster.value"
          :index="cluster.value"
        >
          {{ cluster.label }}
        </el-menu-item>
      </el-menu>

      <el-empty v-else description="暂无可用集群" />
    </div>

    <!-- 命名空间管理 -->
    <div v-if="activeCluster" class="namespace-section">
      <div class="section-header">
        <h4>命名空间分配</h4>
        <div class="header-actions">
          <el-button
            v-permission="['NACOS_PROJECTS_NAMESPACES_CHANGE']"
            type="success"
            size="small"
            icon="el-icon-plus"
            @click="openAddDialog"
          >
            添加命名空间
          </el-button>
          <el-button
            v-permission="['NACOS_PROJECTS_NAMESPACES_CHANGE']"
            type="primary"
            size="small"
            icon="el-icon-check"
            :loading="loading"
            @click="saveNamespaces"
          >
            保存更改
          </el-button>
        </div>
      </div>

      <!-- 已分配的命名空间 -->
      <div class="allocated-namespaces">
        <div class="allocated-header">
          <h5>已分配命名空间</h5>
          <el-tag v-if="allocatedNamespaces.length > 0" type="warning" size="small">
            请点击"保存更改"按钮保存修改
          </el-tag>
        </div>
        <el-table
          :data="allocatedNamespaces"
          border
          style="width: 100%"
          empty-text="暂无分配的命名空间"
        >
          <el-table-column prop="namespaceName" label="空间名称" />
          <el-table-column prop="groupId" label="Nacos分组">
            <template slot-scope="{row}">
              <el-input
                v-model="row.groupId"
                size="small"
                placeholder="默认为项目代码"
                @blur="updateGroupId(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="{row}">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                @click="removeNamespace(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 添加命名空间对话框 -->
    <el-dialog
      title="添加命名空间"
      :visible.sync="showAddDialog"
      width="600px"
    >
      <div class="add-namespace-content">
        <el-alert
          title="选择要添加到项目的命名空间"
          type="info"
          :closable="false"
          show-icon
        />

        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索命名空间..."
            prefix-icon="el-icon-search"
            clearable
            style="margin-bottom: 16px"
          />
        </div>

        <!-- 命名空间列表 -->
        <div class="namespace-list">
          <el-table
            :data="filteredAvailableNamespaces"
            style="width: 100%"
            max-height="400"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
              :selectable="checkSelectable"
            />
            <el-table-column
              prop="label"
              label="命名空间名称"
            />
            <el-table-column
              prop="value"
              label="命名空间ID"
              width="120"
            />
          </el-table>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="selectedTableRows.length === 0"
          @click="addSelectedNamespaces"
        >
          添加选中的命名空间 ({{ selectedTableRows.length }})
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getProjectNamespaces,
  editProjectNamespaces
} from '@/api/devops/nacos/projects'
import {
  listNacosCluster,
  listNacosClusterNamespaces
} from '@/api/devops/nacos/cluster'

export default {
  name: 'ProjectNamespaceManager',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      clusters: [],
      activeCluster: '',
      allocatedNamespaces: [],
      availableNamespaces: [],
      allNamespaces: [], // 所有命名空间（包括已分配和未分配的）
      selectedTableRows: [], // 表格中选中的行
      searchKeyword: '', // 搜索关键词
      showAddDialog: false,
      loading: false
    }
  },
  computed: {
    // 计算已选择的命名空间ID列表
    selectedNamespaceIds() {
      return this.allocatedNamespaces.map(item => String(item.namespaceId)).filter(id => id && id !== 'undefined')
    },

    // 过滤后的可用命名空间（根据搜索关键词）
    filteredAvailableNamespaces() {
      if (!this.searchKeyword) {
        return this.availableNamespaces
      }
      return this.availableNamespaces.filter(item =>
        item.label.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        item.value.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  watch: {
    project: {
      handler(newProject) {
        if (newProject) {
          this.loadClusters()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 加载集群列表
    async loadClusters() {
      try {
        const resp = await listNacosCluster()
        if (resp.success) {
          this.clusters = resp.rows
          if (this.clusters.length > 0) {
            this.activeCluster = this.clusters[0].value
            this.loadNamespaces()
          }
        }
      } catch (error) {
        this.$message.error('加载集群失败')
      }
    },

    // 选择集群
    selectCluster(clusterId) {
      this.activeCluster = clusterId
      this.loadNamespaces()
    },

    // 加载命名空间
    async loadNamespaces() {
      if (!this.activeCluster || !this.project.id) return

      try {
        // 加载已分配的命名空间
        const allocatedResp = await getProjectNamespaces(this.project.id, this.activeCluster)
        if (allocatedResp.success) {
          this.allocatedNamespaces = allocatedResp.rows.map(item => ({
            ...item,
            groupId: item.groupId || this.project.code
          }))
        }

        // 加载所有命名空间
        const availableResp = await listNacosClusterNamespaces(this.activeCluster)
        if (availableResp.success) {
          // 保存所有命名空间数据，确保数据结构正确
          this.allNamespaces = (availableResp.rows || []).map(item => ({
            value: String(item.namespaceId || item.value || ''),
            label: String(item.namespaceName || item.label || ''),
            key: String(item.namespaceId || item.value || '')
          }))

          console.log('加载的命名空间数据:', this.allNamespaces)

          // 过滤掉已经分配的命名空间
          const allocatedIds = this.allocatedNamespaces.map(item => String(item.namespaceId))
          this.availableNamespaces = this.allNamespaces.filter(item => !allocatedIds.includes(item.value))

          console.log('已分配的命名空间ID:', allocatedIds)
          console.log('可用的命名空间:', this.availableNamespaces)
        } else {
          console.error('加载命名空间失败:', availableResp)
        }
      } catch (error) {
        this.$message.error('加载命名空间失败')
      }
    },

    // 更新分组ID
    updateGroupId(row) {
      // 这里可以添加保存逻辑
      console.log('更新分组ID:', row)
    },

    // 移除命名空间
    removeNamespace(row) {
      this.$confirm('确定要移除这个命名空间吗？', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.allocatedNamespaces = this.allocatedNamespaces.filter(item => item.namespaceId !== row.namespaceId)
        this.$message.success('已移除命名空间，请点击保存按钮保存更改')
      })
    },

    // 检查行是否可选
    checkSelectable(row) {
      return true // 所有行都可选
    },

    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedTableRows = selection
      console.log('选中的命名空间:', selection)
    },

    // 添加选中的命名空间
    addSelectedNamespaces() {
      if (this.selectedTableRows.length === 0) {
        this.$message.warning('请选择要添加的命名空间')
        return
      }

      // 将选中的命名空间添加到已分配列表（不立即保存）
      const newNamespaces = this.selectedTableRows.map(item => ({
        namespaceId: item.value,
        namespaceName: item.label,
        groupId: this.project.code || ''
      }))

      this.allocatedNamespaces.push(...newNamespaces)

      this.$message.success(`已添加 ${newNamespaces.length} 个命名空间到待保存列表`)
      this.showAddDialog = false
      this.selectedTableRows = []
      this.searchKeyword = ''
    },

    // 打开添加命名空间对话框
    async openAddDialog() {
      try {
        // 重新加载命名空间数据确保最新
        await this.loadNamespaces()

        // 等待下一个tick确保数据已经更新
        await this.$nextTick()

        // 重置选择状态
        this.selectedTableRows = []
        this.searchKeyword = ''

        console.log('当前可用命名空间:', this.availableNamespaces)

        // 确保数据不为空再打开对话框
        if (this.availableNamespaces && this.availableNamespaces.length > 0) {
          this.showAddDialog = true
        } else {
          this.$message.warning('暂无可用的命名空间')
        }
      } catch (error) {
        console.error('打开对话框失败:', error)
        this.$message.error('加载数据失败')
      }
    },

    // 保存命名空间
    async saveNamespaces() {
      if (!this.activeCluster || !this.project.id) {
        this.$message.warning('请先选择集群')
        return
      }

      this.loading = true
      try {
        // 准备保存的数据格式
        const saveData = this.allocatedNamespaces.map(item => ({
          namespaceId: item.namespaceId,
          namespaceName: item.namespaceName,
          groupId: item.groupId || this.project.code || ''
        }))

        const resp = await editProjectNamespaces(
          this.project.id,
          this.activeCluster,
          saveData
        )

        if (resp.success) {
          this.$message.success('保存成功')
          this.loadNamespaces()
          this.$emit('update')
        } else {
          this.$message.error('保存失败')
        }
      } catch (error) {
        console.error('保存命名空间失败:', error)
        this.$message.error('保存失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.namespace-manager {
  .cluster-section {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .cluster-menu {
      border: 1px solid #e4e7ed;
      border-radius: 4px;
    }
  }

  .namespace-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .allocated-namespaces {
      .allocated-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h5 {
          margin: 0;
          color: #606266;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .add-namespace-content {
    .search-container {
      margin-bottom: 16px;
    }

    .namespace-list {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
