<template>
  <div class="app-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-form ref="queryForm" :model="tables.a.params" :inline="true" label-width="80px" class="filter-form">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="tables.a.params.name"
            placeholder="请输入租户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="tables.a.params.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option
              v-for="dict in options.status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">{{ $t('btn.search') }}</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">{{ $t('btn.reset') }}</el-button>
          <el-button v-permission="'UPMS_TENANT_ADD'" type="success" icon="el-icon-plus" @click="handleAdd">{{ $t('btn.add') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="tables.a.loading"
        :data="tables.a.data"
        border
        fit
        highlight-current-row
        class="tenant-table"
      >
        <el-table-column label="所属部门" prop="departmentName" min-width="120" />
        <el-table-column label="名称" prop="name" min-width="150" />
        <el-table-column label="负责人" prop="manager" width="200">
          <template slot-scope="{row}">
            <el-tag
              v-for="(manager, index) in getManagerList(row.manager)"
              :key="manager.id || index"
              size="small"
              style="margin-right: 5px; margin-bottom: 2px;"
            >
              {{ manager.name || manager.realName || manager.username }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" align="center" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter" size="medium">
              {{ row.status | enableStatusNameFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createAt" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150" fixed="right">
          <template slot-scope="{row}">
            <el-button
              v-permission="'UPMS_TENANT_EDIT'"
              type="text"
              size="small"
              @click.native="handleEdit(row)"
            >
              {{ $t('btn.edit') }}
            </el-button>
            <el-button
              v-permission="'UPMS_TENANT_DELETE'"
              type="text"
              size="small"
              @click.native="handleDel(row)"
            >
              {{ $t('btn.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <pagination
          v-show="tables.a.total>0"
          :total="tables.a.total"
          :page.sync="tables.a.page"
          :limit.sync="tables.a.limit"
          @pagination="handleSearch"
        />
      </div>
    </div>

    <!-- 添加或修改业务-租户对话框 -->
    <el-dialog
      :visible.sync="dialogs.a.visible"
      :title="dialogs.a.type==='edit'?'修改租户':'创建租户'"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="record" :rules="rules" label-width="100px" label-position="left">
        <el-form-item :label="$t('user.department')" prop="recordDepartments">
          <el-cascader ref="categoryCascader" v-model="recordDepartments" :options="options.departments" :show-all-levels="false" :props="{ checkStrictly: true }" clearable />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" placeholder="请输入名称(默认部门名称)" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-select
            v-model="recordManagers"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请选择负责人"
            :remote-method="remoteSearchUsers"
            :loading="options.usersLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in options.users"
              :key="user.username"
              :label="user.realName || user.username"
              :value="user.username"
            >
              <span style="float: left">{{ user.realName || user.username }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ user.username }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="record.sort" placeholder="请输入排序" />
        </el-form-item>
        <!--<el-form-item label="描述" prop="description">
          <el-input v-model="record.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>-->
        <el-form-item label="状态" prop="status">
          <el-select v-model="record.status" placeholder="请选择状态">
            <el-option
              v-for="dict in options.status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ $t('btn.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageTenant, addTenant, editTenant, delTenant } from '@/api/upms/tenant'
import { treeDepartment } from '@/api/upms/department'
import { findUserList } from '@/api/upms/user'

const defaultRecord = {
  code: null,
  name: null,
  departmentId: null,
  manager: null,
  sort: 1,
  description: null,
  status: '1'
}
export default {
  name: 'UpmsTenant',
  data() {
    return {
      tables: {
        a: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        }
      },
      dialogs: {
        a: {
          loading: false,
          visible: false,
          title: '',
          type: ''
        }
      },
      record: Object.assign({}, defaultRecord),
      recordDepartments: [],
      recordManagers: [], // 新增：负责人多选数组
      list: {
        loading: false
      },
      options: {
        loading: false,
        departments: [],
        users: [], // 新增：用户列表
        usersLoading: false, // 新增：用户加载状态
        userCache: new Map(), // 新增：用户缓存，用于保存搜索过的用户信息
        // 状态：0.失效 1.生效
        status: [
          { value: '1', label: '启用' },
          { value: '0', label: '禁用' }
        ]
      },
      rules: {

      }
    }
  },
  created() {
    this.handleSearch()
    this.getTreeDepartments()
  },
  methods: {
    getTreeDepartments() {
      treeDepartment('0').then(resp => {
        if (resp.success) {
          this.options.departments = resp.rows
        }
      })
    },
    // 新增：远程搜索用户
    remoteSearchUsers(query) {
      if (query !== '') {
        this.options.usersLoading = true
        findUserList(query).then(resp => {
          if (resp.success) {
            // 合并搜索结果和已选中的用户，避免重复
            const searchResults = resp.rows || []

            // 将搜索结果添加到缓存中
            searchResults.forEach(user => {
              this.options.userCache.set(user.username, user)
            })

            // 保留当前已选中的用户信息（包括之前搜索过的）
            const currentSelectedUsers = this.options.users.filter(user =>
              this.recordManagers.includes(user.username)
            )

            const allUsers = [...currentSelectedUsers]

            // 添加搜索结果中不重复的用户
            searchResults.forEach(user => {
              if (!allUsers.find(u => u.username === user.username)) {
                allUsers.push(user)
              }
            })

            this.options.users = allUsers
          }
        }).finally(() => {
          this.options.usersLoading = false
        })
      } else {
        // 当搜索框为空时，保留已选中的用户
        const selectedUsers = this.options.users.filter(user =>
          this.recordManagers.includes(user.username)
        )
        this.options.users = selectedUsers
      }
    },
    // 新增：解析负责人字符串为数组
    getManagerList(managerStr) {
      if (!managerStr) return []

      // 如果已经是数组，直接处理
      if (Array.isArray(managerStr)) {
        return managerStr.map(manager => ({
          id: manager.username, // 使用 username 作为 id
          name: manager.realName || manager.username, // 显示名称
          username: manager.username,
          realName: manager.realName
        }))
      }

      // 如果是字符串，尝试解析JSON
      if (typeof managerStr === 'string') {
        try {
          const managers = JSON.parse(managerStr)
          // 处理简化后的用户信息格式
          return managers.map(manager => ({
            id: manager.username, // 使用 username 作为 id
            name: manager.realName || manager.username, // 显示名称
            username: manager.username,
            realName: manager.realName
          }))
        } catch (e) {
          // 如果不是JSON格式，按逗号分割
          return managerStr.split(',').map(name => ({ name: name.trim() }))
        }
      }

      return []
    },
    handleSearch() {
      this.tables.a.loading = true
      pageTenant(this.tables.a).then(resp => {
        if (resp.success) {
          this.tables.a.data = resp.rows
          this.tables.a.total = resp.total
        }
      }).finally(() => { this.tables.a.loading = false })
    },
    handleReset() {
      this.tables.a.params = Object.assign({}, defaultRecord)
    },
    handleAdd() {
      this.record = Object.assign({}, defaultRecord)
      this.recordManagers = [] // 重置负责人选择
      this.dialogs.a.visible = true
      this.dialogs.a.type = 'new'
    },
    handleEdit(row) {
      this.record = Object.assign({}, row)
      this.recordDepartments = []
      this.recordDepartments = row.departmentId.split(',')

      // 处理负责人数据
      this.recordManagers = []
      if (row.manager) {
        // 如果已经是数组，直接处理
        if (Array.isArray(row.manager)) {
          const managers = row.manager
          this.recordManagers = managers.map(m => m.username || m)

          // 将简化后的用户信息转换为完整格式，用于显示
          const fullUsers = managers.map(user => ({
            username: user.username,
            realName: user.realName || user.username,
            id: user.username
          }))

          // 将已配置的管理员添加到用户列表中，确保多选组件能正确显示
          this.options.users = fullUsers

          // 将编辑时的用户信息也添加到缓存中
          fullUsers.forEach(user => {
            this.options.userCache.set(user.username, user)
          })
        } else if (typeof row.manager === 'string') {
          // 如果是字符串，尝试解析JSON
          try {
            const managers = JSON.parse(row.manager)
            this.recordManagers = managers.map(m => m.username || m)

            // 将简化后的用户信息转换为完整格式，用于显示
            const fullUsers = managers.map(user => ({
              username: user.username,
              realName: user.realName || user.username,
              id: user.username
            }))

            // 将已配置的管理员添加到用户列表中，确保多选组件能正确显示
            this.options.users = fullUsers

            // 将编辑时的用户信息也添加到缓存中
            fullUsers.forEach(user => {
              this.options.userCache.set(user.username, user)
            })
          } catch (e) {
            // 如果不是JSON格式，清空选择
            this.recordManagers = []
            this.options.users = []
          }
        } else {
          this.options.users = []
        }
      } else {
        this.options.users = []
      }

      this.dialogs.a.visible = true
      this.dialogs.a.type = 'edit'
    },
    handleDel(row) {
      const _this = this
      this.$confirm(this.$t('message.deleteTip'), this.$t('label.warning'), {
        confirmButtonText: this.$t('btn.confirm'),
        cancelButtonText: this.$t('btn.cancel'),
        type: 'warning'
      })
        .then(async() => {
          await delTenant(row.id)
          _this.handleSearch()
          this.$message({
            type: 'success',
            message: this.$t('message.deleteSuccess')
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'

      if (this.recordDepartments.length > 0) {
        this.record.departmentId = this.recordDepartments.join(',')
      }

      // 处理负责人数据
      if (this.recordManagers.length > 0) {
        // 根据选中的用户名获取用户信息
        const selectedUsers = this.options.users.filter(user =>
          this.recordManagers.includes(user.username)
        )

        // 如果从当前用户列表中找不到某些用户，从缓存中获取
        if (selectedUsers.length !== this.recordManagers.length) {
          const missingUsernames = this.recordManagers.filter(username =>
            !selectedUsers.find(user => user.username === username)
          )

          // 从缓存中获取缺失的用户信息
          missingUsernames.forEach(username => {
            const cachedUser = this.options.userCache.get(username)
            if (cachedUser) {
              selectedUsers.push(cachedUser)
            }
          })
        }

        // 只保留 username 和 realName 字段
        const simplifiedUsers = selectedUsers.map(user => ({
          username: user.username,
          realName: user.realName || user.username
        }))

        this.record.manager = simplifiedUsers
      } else {
        this.record.manager = null
      }

      if (this.dialogs.a.type === 'new') {
        resp = await addTenant(this.record)
      } else if (this.dialogs.a.type === 'edit') {
        opName = '修改'
        resp = await editTenant(this.record)
      }
      if (resp && resp.success) {
        this.dialogs.a.visible = false
        this.$message({
          type: 'success',
          message: `${opName} 成功!`
        })
        _this.handleSearch()
      }
    },
    handleCancel() {
      this.dialogs.a.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  // 搜索过滤区域
  .filter-container {
    margin-bottom: 20px;
    padding: 20px 5px 0px 5px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .filter-form {
      .el-form-item {
        margin-bottom: 16px;
        margin-right: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  // 数据表格区域
  .table-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .tenant-table {
      ::v-deep .el-table__header-wrapper {
        .el-table__header {
          th {
            background: #f5f7fa;
            color: #606266;
            font-weight: 600;
          }
        }
      }

      ::v-deep .el-table__body-wrapper {
        .el-table__body {
          tr {
            &:hover {
              background: #f5f7fa;
            }
          }
        }
      }
    }

    .pagination-wrapper {
      padding: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;

    .filter-container {
      padding: 16px;

      .filter-form {
        .el-form-item {
          margin-right: 0;
          margin-bottom: 12px;

          .el-input,
          .el-select {
            width: 100% !important;
          }
        }
      }
    }
  }
}
</style>
