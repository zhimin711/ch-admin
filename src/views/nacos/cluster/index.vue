<template>
  <div class="app-container">
    <el-card class="cluster-card" shadow="hover">
      <!-- 集群选择器 -->
      <div class="cluster-selector-bar">
        <el-button
          v-for="item in clusters"
          :key="item.id"
          :type="item.id+'' === cardId ? 'primary' : 'default'"
          icon="el-icon-s-home"
          class="cluster-selector-btn"
          @click="selectCluster(item.id)"
        >
          {{ item.name }}
        </el-button>
        <el-button type="success" icon="el-icon-plus" class="cluster-selector-btn" @click="showAddDialog = true">添加集群</el-button>
      </div>

      <!-- 当前集群信息和节点信息 -->
      <template v-if="cardId !== '0' && record">
        <div class="cluster-info-bar">
          <div class="cluster-info-main">
            <span class="cluster-title"><i class="el-icon-s-home" />{{ record.name }}</span>
            <el-tag type="primary"><i class="el-icon-location" />{{ record.url }}</el-tag>
            <el-tag v-if="record.description" type="info"><i class="el-icon-info" />{{ record.description }}</el-tag>
          </div>
          <div class="cluster-info-ops">
            <el-button type="primary" icon="el-icon-refresh" size="small" @click="handleTab">刷新</el-button>
            <el-button type="info" icon="el-icon-edit" size="small" @click="handleEdit">修改</el-button>
          </div>
        </div>
        <el-divider class="section-divider" />
        <div class="nodes-section">
          <div class="nodes-header">
            <span class="nodes-title"><i class="el-icon-s-data" /> 集群节点信息</span>
            <el-tag type="success">共{{ list.length }}节点</el-tag>
          </div>
          <el-table
            ref="table"
            v-loading="listLoading"
            :data="list"
            element-loading-text="正在加载节点信息..."
            border
            stripe
            class="nodes-table"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column label="节点IP" prop="address" min-width="180">
              <template slot-scope="{row}">
                <div class="node-address">
                  <i class="el-icon-monitor" />
                  <span>{{ row.address }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="节点状态" width="120" align="center">
              <template slot-scope="{row}">
                <el-tag
                  :type="row.state | statusFilter"
                  size="medium"
                  effect="dark"
                >
                  <i :class="row.state === 'UP' ? 'el-icon-success' : 'el-icon-error'" />
                  {{ row.state }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-view"
                  @click="toggleExpand(scope.row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="expand" width="1">
              <template slot-scope="{row}">
                <el-card class="detail-card" shadow="never">
                  <div slot="header" class="detail-header">
                    <span class="detail-title">
                      <i class="el-icon-info" />
                      节点元数据 - {{ row.address }}
                    </span>
                  </div>
                  <div class="detail-content">
                    <pre class="metadata-content">{{ row.extendInfo }}</pre>
                  </div>
                </el-card>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-card>

    <!-- 添加集群弹窗 -->
    <el-dialog :visible.sync="showAddDialog" title="新增集群" width="700px" class="add-cluster-dialog">
      <el-card class="cluster-form-card" shadow="hover">
        <el-form
          ref="dataForm"
          :rules="rules"
          :model="record"
          label-position="left"
          label-width="140px"
          class="cluster-form"
        >
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="集群名称" prop="name">
                <el-input v-model="record.name" placeholder="请输入集群名称" class="form-input">
                  <i slot="prefix" class="el-input__icon el-icon-s-home" />
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="集群地址" prop="url">
                <el-input v-model="record.url" placeholder="localhost:8848" class="form-input">
                  <i slot="prefix" class="el-input__icon el-icon-location" />
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="集群描述" prop="description">
                <el-input
                  v-model="record.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入集群描述信息"
                  class="form-textarea"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="管理员账号" prop="username">
                <el-input v-model="record.username" placeholder="请输入管理员账号" class="form-input">
                  <i slot="prefix" class="el-input__icon el-icon-user" />
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理员密码" prop="password">
                <el-input v-model="record.password" placeholder="请输入管理员密码" show-password class="form-input">
                  <i slot="prefix" class="el-input__icon el-icon-lock" />
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-check" @click="handleSubmit">提交</el-button>
        <el-button icon="el-icon-close" @click="showAddDialog = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 编辑集群弹窗美化 -->
    <el-dialog
      :visible.sync="isEdit"
      title="编辑集群信息"
      width="60%"
      class="edit-dialog"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="record"
        label-position="left"
        label-width="140px"
        class="edit-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="集群名称" prop="name">
              <el-input
                v-model="record.name"
                placeholder="请输入集群名称"
                class="form-input"
              >
                <i slot="prefix" class="el-input__icon el-icon-s-home" />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="集群地址" prop="url">
              <el-input
                v-model="record.url"
                placeholder="localhost:8848"
                class="form-input"
              >
                <i slot="prefix" class="el-input__icon el-icon-location" />
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="集群描述" prop="description">
          <el-input
            v-model="record.description"
            type="textarea"
            :rows="3"
            placeholder="请输入集群描述信息"
            class="form-textarea"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管理员账号" prop="username">
              <el-input
                v-model="record.username"
                placeholder="请输入管理员账号"
                class="form-input"
              >
                <i slot="prefix" class="el-input__icon el-icon-user" />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="管理员密码" prop="password">
              <el-input
                v-model="record.password"
                type="password"
                placeholder="请输入管理员密码"
                class="form-input"
                show-password
              >
                <i slot="prefix" class="el-input__icon el-icon-lock" />
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-loading="loading2"
          type="primary"
          icon="el-icon-check"
          @click="handleSubmit"
        >
          保存
        </el-button>
        <el-button
          icon="el-icon-close"
          @click="isEdit = false"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageNacosCluster, getNacosCluster, addNacosCluster, editNacosCluster } from '@/api/devops/nacos/cluster'

export default {
  name: 'NacosClusterNodes',
  filters: {
    statusFilter(status) {
      const statusMap = {
        'UP': 'success',
        'DOWN': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      clusters: [],
      rules: {
        name: [
          { required: true, message: '集群名称不能为空', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '集群地址不能为空', trigger: 'blur' }
        ]
      },
      cardId: '0',
      cardTitle: '',
      record: {},
      list: [],
      listLoading: true,
      loading2: false,
      isEdit: false,
      showAddDialog: false,
      listQuery: {
        page: 1,
        size: 10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      pageNacosCluster(this.listQuery).then(resp => {
        if (resp.success) {
          this.clusters = resp.rows
          if (this.clusters.length > 0) {
            this.selectCluster(this.clusters[0].id)
          }
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    selectCluster(id) {
      this.cardId = id + ''
      this.fetchDetail(id)
    },
    handleTab() {
      this.fetchDetail(this.cardId)
    },
    fetchDetail(id) {
      if (id === '0') {
        this.record = {}
        return
      }
      getNacosCluster(id).then(resp => {
        if (resp.success) {
          this.record = resp.rows[0]
          this.cardId = this.record.id + ''
          this.cardTitle = this.record.url
          this.list = resp.extra.nodes
        }
      })
    },
    toggleExpand(row) {
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.address !== item.address) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    handleEdit() {
      this.isEdit = true
    },
    handleSubmit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.submit()
        }
      })
    },
    resetForm() {
      this.$refs['dataForm'].resetFields()
      this.record = {}
    },
    submit() {
      if (this.isEdit) {
        editNacosCluster(this.record).then(resp => {
          if (resp.success) {
            this.$message.success('修改集群成功')
            this.fetchDetail(this.record.id)
            this.isEdit = false
          }
        }).finally(() => {
          this.loading2 = false
        })
      } else {
        this.loading2 = true
        addNacosCluster(this.record).then(resp => {
          if (resp.success) {
            this.$message.success('添加集群成功')
            this.fetchData()
            this.clusterView = resp.rows[0]
            this.resetForm()
            this.showAddDialog = false
          }
        }).finally(() => {
          this.loading2 = false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.cluster-card {
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.06);
  padding-bottom: 30px;
}

.cluster-selector-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  overflow-x: auto;
  .cluster-selector-btn {
    min-width: 90px;
    font-weight: 600;
  }
}

.section-divider {
  margin: 18px 0 12px 0;
  background: #e4e7ed;
  height: 1px;
}

.nodes-section {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.cluster-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafd;
  border-radius: 8px;
  margin: 0 0 10px 0;
  padding: 18px 24px 12px 24px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
}
.cluster-info-main {
  display: flex;
  align-items: center;
  gap: 16px;
}
.cluster-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
  i { color: #409EFF; }
}
.cluster-info-ops {
  display: flex;
  gap: 10px;
}

.nodes-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.nodes-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
  i { color: #409EFF; }
}

.nodes-table {
  border-radius: 6px;
  overflow: hidden;
}
.node-address {
  display: flex;
  align-items: center;
  gap: 8px;
  i { color: #409EFF; }
}
.detail-card {
  margin: 10px;
  border-radius: 6px;
}
.detail-header {
  display: flex;
  align-items: center;
}
.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  i { margin-right: 6px; color: #409EFF; }
}
.detail-content { padding: 10px 0; }
.metadata-content {
  display: block;
  padding: 15px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}
.edit-dialog {
  :deep(.el-dialog__header) {
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }
  :deep(.el-dialog__title) {
    font-weight: 600;
    color: #303133;
  }
}
.edit-form { padding: 20px 0; }
.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
.cluster-form-card {
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.06);
  padding: 20px;
}
.add-cluster-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: 1px solid #e4e7ed;
    padding: 20px 24px;
  }
  :deep(.el-dialog__title) {
    font-weight: 600;
    color: #fff;
    font-size: 18px;
  }
  :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: #fff;
    font-size: 18px;
  }
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.cluster-form {
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }
  :deep(.el-input__inner) {
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.05);
    border: 1px solid #dcdfe6;
    transition: all 0.3s ease;
    &:focus {
      border-color: #409EFF;
      box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
    }
  }
  :deep(.el-textarea__inner) {
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.05);
    border: 1px solid #dcdfe6;
    transition: all 0.3s ease;
    &:focus {
      border-color: #409EFF;
      box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
    }
  }
  :deep(.el-button) {
    border-radius: 10px;
    font-weight: 600;
    padding: 12px 24px;
    transition: all 0.3s ease;
  }
}

.form-input {
  :deep(.el-input__inner) {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
  }
}

.form-textarea {
  :deep(.el-textarea__inner) {
    font-size: 14px;
    line-height: 1.6;
  }
}
@media (max-width: 768px) {
  .app-container { padding: 10px; }
  .cluster-info-bar { flex-direction: column; gap: 10px; align-items: flex-start; }
  .cluster-info-main { flex-direction: column; gap: 8px; align-items: flex-start; }
  .nodes-header { flex-direction: column; gap: 10px; align-items: flex-start; }
  .cluster-selector-bar { flex-wrap: wrap; }
}

.cluster-card:hover,
.form-card:hover,
.detail-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.10);
  transition: box-shadow 0.3s ease;
}
.el-tag { border-radius: 6px; font-size: 14px; }
.nodes-table .el-table__row:hover { background-color: #f0f9ff !important; }
</style>
