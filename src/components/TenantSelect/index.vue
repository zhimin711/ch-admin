<template>
  <div class="tenant-selector">
    <!-- 租户选择下拉菜单 -->
    <el-dropdown
      trigger="click"
      class="tenant-dropdown"
      :loading="loading"
      :disabled="loading"
      @command="handleSetTenant"
    >
      <div class="tenant-display">
        <div class="tenant-icon-wrapper">
          <i class="el-icon-office-building tenant-icon" />
        </div>
        <div class="tenant-info">
          <span class="tenant-label">租户</span>
          <span class="tenant-name">{{ tenant.name || '未选择' }}</span>
        </div>
        <div class="tenant-badges">
          <el-tag v-if="tenant.isDefault" size="mini" type="success" class="badge-default">
            <i class="el-icon-star-on" />
            默认
          </el-tag>
        </div>
        <i class="el-icon-arrow-down dropdown-arrow" />
      </div>

      <el-dropdown-menu slot="dropdown" class="tenant-dropdown-menu">
        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索租户..."
            size="small"
            clearable
            prefix-icon="el-icon-search"
            @input="filterTenants"
          />
        </div>

        <!-- 租户列表 -->
        <div class="tenant-list">
          <div v-if="filteredTenants.length === 0" class="empty-state">
            <i class="el-icon-search empty-icon" />
            <p>未找到匹配的租户</p>
          </div>
          <el-dropdown-item
            v-for="item in filteredTenants"
            :key="item.id"
            :disabled="tenant.id === item.id"
            :command="item.id"
            class="tenant-item"
          >
            <div class="tenant-item-content">
              <i class="el-icon-office-building tenant-item-icon" />
              <span class="tenant-item-name">{{ item.name }}</span>
              <div class="tenant-item-badges">

                <el-tag v-if="tenant.id === item.id" size="mini" type="primary" class="badge-current">
                  <i class="el-icon-check" />
                  当前
                </el-tag>
              </div>
            </div>
          </el-dropdown-item>
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-dropdown-item
            command="set-default"
            :disabled="!tenant.id || tenant.isDefault"
            class="action-item"
          >
            <div class="action-content">
              <i class="el-icon-star-on action-icon" />
              <span>设为默认租户</span>
            </div>
          </el-dropdown-item>

          <el-dropdown-item
            command="refresh"
            class="action-item"
          >
            <div class="action-content">
              <i class="el-icon-refresh action-icon" />
              <span>刷新租户列表</span>
            </div>
          </el-dropdown-item>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { changeTenant } from '@/api/upms/user'

export default {
  name: 'TenantSelect',
  data() {
    return {
      loading: false,
      searchKeyword: '',
      filteredTenants: []
    }
  },
  computed: {
    tenant() {
      return this.$store.getters.tenant || {}
    },
    tenants() {
      return this.$store.getters.tenants || []
    }
  },
  watch: {
    tenants: {
      handler(newTenants) {
        this.filterTenants()
      },
      immediate: true
    }
  },
  methods: {
    // 过滤租户列表
    filterTenants() {
      if (!this.searchKeyword.trim()) {
        this.filteredTenants = [...this.tenants]
        return
      }

      const keyword = this.searchKeyword.toLowerCase()
      this.filteredTenants = this.tenants.filter(tenant =>
        tenant.name && tenant.name.toLowerCase().includes(keyword)
      )
    },

    // 处理租户选择
    async handleSetTenant(command) {
      try {
        this.loading = true

        switch (command) {
          case 'set-default':
            await this.setDefaultTenant()
            break
          case 'refresh':
            await this.refreshTenants()
            break
          default:
            await this.switchTenant(command)
            break
        }
      } catch (error) {
        console.error('租户操作失败:', error)
        this.$message.error('操作失败，请重试')
      } finally {
        this.loading = false
      }
    },

    // 切换租户
    async switchTenant(tenantId) {
      const targetTenant = this.tenants.find(t => t.id === tenantId)
      if (!targetTenant) {
        this.$message.error('租户不存在')
        return
      }

      // 确认切换
      await this.$confirm(
        `确定要切换到租户"${targetTenant.name}"吗？切换后将关闭所有标签页。`,
        '切换租户',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 执行切换
      await this.$store.dispatch('user/setTenant', tenantId)

      this.$message.success(`已切换到租户: ${targetTenant.name}`)
      this.$router.push({ path: '/' })
    },

    // 设置默认租户
    async setDefaultTenant() {
      if (!this.tenant.id) {
        this.$message.warning('请先选择租户')
        return
      }

      if (this.tenant.isDefault) {
        this.$message.info('当前租户已经是默认租户')
        return
      }

      // 确认设置
      await this.$confirm(
        `确定要将租户"${this.tenant.name}"设置为默认租户吗？`,
        '设置默认租户',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      // 执行设置
      const params = {
        setDefault: true,
        id: this.tenant.id
      }

      const resp = await changeTenant(params)
      if (resp.success) {
        this.$message.success('默认租户设置成功')
        // 刷新租户列表
        await this.refreshTenants()
      } else {
        this.$message.error(resp.message || '设置失败')
      }
    },

    // 刷新租户列表
    async refreshTenants() {
      try {
        await this.$store.dispatch('user/getTenants')
        this.$message.success('租户列表已刷新')
      } catch (error) {
        console.error('刷新租户列表失败:', error)
        this.$message.error('刷新失败，请重试')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tenant-selector {
  .tenant-dropdown {
    border: none;
    background: transparent;

    // 重置 el-dropdown 按钮的默认样式
    ::v-deep .el-dropdown__caret-button {
      padding: 0;
      border: none;
      background: transparent;
    }

    ::v-deep .el-button {
      padding: 0;
      border: none;
      background: transparent;
    }

    &:hover {
      .tenant-display {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transform: translateY(-1px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }
    }

    .tenant-display {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px;
      color: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 140px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      &:hover::before {
        left: 100%;
      }

      .tenant-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        backdrop-filter: blur(10px);

        .tenant-icon {
          font-size: 12px;
          color: white;
        }
      }

      .tenant-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;

        .tenant-label {
          font-size: 8px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1;
        }

        .tenant-name {
          font-size: 11px;
          font-weight: 600;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.2;
        }
      }

      .tenant-badges {
        display: flex;
        gap: 2px;

        .badge-default {
          background: rgba(103, 194, 58, 0.9);
          border: none;
          color: white;
          font-size: 8px;
          padding: 0px 3px;
          border-radius: 3px;
          line-height: 1.2;

          i {
            margin-right: 1px;
            font-size: 8px;
          }
        }
      }

      .dropdown-arrow {
        font-size: 9px;
        opacity: 0.8;
        transition: transform 0.3s;
      }
    }
  }

  .tenant-dropdown-menu {
    min-width: 280px;
    max-height: 320px;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95);
    padding: 0;
    overflow: hidden;

    .search-container {
      padding: 10px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      .el-input {
        .el-input__inner {
          border-radius: 8px;
          border: 2px solid transparent;
          background: white;
          transition: all 0.3s;

          &:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }
      }
    }

    .tenant-list {
      max-height: 180px;
      overflow-y: auto;
      padding: 4px 0;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;

        &:hover {
          background: #a8a8a8;
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 16px;
        color: #909399;

        .empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        p {
          margin: 0;
          font-size: 12px;
        }
      }

      .tenant-item {
        padding: 0;
        margin: 2px 8px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: translateX(4px);

          .tenant-item-content {
            color: white;

            .tenant-item-name {
              color: white;
            }
          }
        }

        .tenant-item-content {
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;

          .tenant-item-icon {
            font-size: 16px;
            color: #909399;
            width: 16px;
            text-align: center;
            flex-shrink: 0;
          }

          .tenant-item-name {
            flex: 1;
            font-size: 14px;
            color: #606266;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s;
          }

          .tenant-item-badges {
            display: flex;
            gap: 4px;
            flex-shrink: 0;

            .badge-default {
              background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
              border: none;
              color: white;
              font-size: 9px;
              padding: 1px 4px;
              border-radius: 4px;

              i {
                margin-right: 1px;
              }
            }

            .badge-current {
              background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
              border: none;
              color: white;
              font-size: 9px;
              padding: 1px 4px;
              border-radius: 4px;

              i {
                margin-right: 1px;
              }
            }
          }
        }
      }
    }

    .action-buttons {
      padding: 4px 0;

      .action-item {
        padding: 0;
        margin: 2px 8px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          transform: translateX(4px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;

          &:hover {
            transform: none;
            background: transparent;
          }
        }

        .action-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 8px;

          .action-icon {
            font-size: 14px;
            color: #667eea;
            width: 16px;
            text-align: center;
          }

          span {
            font-size: 12px;
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tenant-selector {
    .tenant-dropdown-menu {
      min-width: 240px;
    }

    .tenant-display {
      min-width: 120px;

      .tenant-name {
        max-width: 80px;
      }
    }
  }
}

// 动画效果
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tenant-dropdown-menu {
  animation: slideIn 0.3s ease-out;
  .el-divider {
    margin: 0 !important;
  }
}
.tenant-dropdown-menu {
    min-width: 280px;
    max-height: 340px;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95);
    padding: 0;
    overflow: hidden;

    .search-container {
      padding: 10px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      .el-input {
        .el-input__inner {
          border-radius: 8px;
          border: 2px solid transparent;
          background: white;
          transition: all 0.3s;

          &:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }
      }
    }

    .tenant-list {
      max-height: 200px;
      overflow-y: auto;
      padding: 0px 0px;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;

        &:hover {
          background: #a8a8a8;
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 10px;
        color: #909399;

        .empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        p {
          margin: 0;
          font-size: 12px;
        }
      }

      .tenant-item {
        padding: 0;
        margin: 0px 8px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: translateX(4px);

          .tenant-item-content {
            color: white;

            .tenant-item-name {
              color: white;
            }
          }
        }

        .tenant-item-content {
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;

          .tenant-item-icon {
            font-size: 16px;
            color: #909399;
            width: 16px;
            text-align: center;
            flex-shrink: 0;
          }

          .tenant-item-name {
            flex: 1;
            font-size: 14px;
            color: #606266;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s;
          }

          .tenant-item-badges {
            display: flex;
            gap: 4px;
            flex-shrink: 0;

            .badge-default {
              background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
              border: none;
              color: white;
              font-size: 9px;
              padding: 1px 4px;
              border-radius: 4px;

              i {
                margin-right: 1px;
              }
            }

            .badge-current {
              background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
              border: none;
              color: white;
              font-size: 9px;
              padding: 1px 4px;
              border-radius: 4px;

              i {
                margin-right: 1px;
              }
            }
          }
        }
      }
    }

    .action-buttons {
      padding: 4px 0;

      .action-item {
        padding: 0;
        margin: 2px 8px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          transform: translateX(4px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;

          &:hover {
            transform: none;
            background: transparent;
          }
        }

        .action-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 8px;

          .action-icon {
            font-size: 14px;
            color: #667eea;
            width: 16px;
            text-align: center;
          }

          span {
            font-size: 12px;
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }
  }
</style>
