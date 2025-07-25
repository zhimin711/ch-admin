<template>
  <div class="app-container">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <i class="el-icon-s-operation" />
          操作日志
        </h2>
        <p class="page-description">查看系统操作记录，监控用户操作活动和异常情况</p>
      </div>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-form :inline="true" class="filter-form" label-width="100px">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="listQuery.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px;"
            class="date-picker"
          />
        </el-form-item>

        <el-form-item label="请求地址">
          <el-input
            v-model="listQuery.params.url"
            :placeholder="$t('label.address')"
            style="width: 300px;"
            class="filter-input"
            prefix-icon="el-icon-link"
          />
        </el-form-item>

        <el-form-item label="授权码">
          <el-input
            v-model="listQuery.params.authCode"
            :placeholder="$t('label.code')"
            style="width: 300px;"
            class="filter-input"
            prefix-icon="el-icon-key"
          />
        </el-form-item>

        <el-form-item class="filter-buttons">
          <el-button type="primary" icon="el-icon-search" class="search-btn" @click="getList">
            {{ $t('btn.search') }}
          </el-button>
          <el-button type="default" icon="el-icon-refresh" class="reset-btn" @click="listQuery.params = {}">
            {{ $t('btn.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        :data="listQuery.list"
        border
        fit
        highlight-current-row
        class="operate-table"
        :header-cell-style="{ background: '#f8f9fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column :label="$t('label.address')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div class="url-cell">
              <i class="el-icon-link" />
              <span>{{ scope.row.url }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('label.method')" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="getMethodType(scope.row.method)" size="mini">
              {{ scope.row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('label.code')" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div class="code-cell">
              <i class="el-icon-key" />
              <span>{{ scope.row.authCode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="120" align="center">
          <template slot-scope="scope">
            <div class="user-cell">
              <i class="el-icon-user" />
              <span>{{ scope.row.operator }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作IP" width="140">
          <template slot-scope="scope">
            <div class="ip-cell">
              <i class="el-icon-location" />
              <span>{{ scope.row.requestIp }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="180" align="center">
          <template slot-scope="scope">
            <div class="time-cell">
              <i class="el-icon-time" />
              <span>{{ scope.row.requestTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="耗时（毫秒）" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getDurationType(scope.row.responseTime - scope.row.requestTime)"
              size="mini"
            >
              {{ scope.row.responseTime - scope.row.requestTime }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="错误信息" min-width="200">
          <template slot-scope="scope">
            <div class="error-cell">
              <span v-if="scope.row.errorMessage" class="error-message">
                <i class="el-icon-warning" />
                {{ scope.row.errorMessage }}
              </span>
              <span v-else class="success-message">
                <i class="el-icon-success" />
                成功
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <pagination
          v-show="listQuery.total>0"
          :total="listQuery.total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { listOPRecord } from '@/api/logs/op-record'
import { parseTime } from '@/utils'

export default {
  name: 'LogsOperate',
  components: { Pagination },
  data() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        // 初始化时间范围参数为今天
        dateRange: [startOfDay, endOfDay],
        params: {
        }
      },
      record: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.params.startTime = parseTime(this.listQuery.dateRange[0], '{y}-{m}-{d} {h}:{i}:{s}')
      this.listQuery.params.endTime = parseTime(this.listQuery.dateRange[1], '{y}-{m}-{d} {h}:{i}:{s}')
      listOPRecord(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
      }).finally(() => { this.listLoading = false })
    },
    // 获取HTTP方法对应的标签类型
    getMethodType(method) {
      const methodMap = {
        'GET': 'success',
        'POST': 'primary',
        'PUT': 'warning',
        'DELETE': 'danger',
        'PATCH': 'info'
      }
      return methodMap[method] || 'info'
    },
    // 获取耗时对应的标签类型
    getDurationType(duration) {
      if (duration < 100) {
        return 'success'
      } else if (duration < 500) {
        return 'warning'
      } else {
        return 'danger'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 20px;

  // 页面标题区域
  .page-header {
    margin-bottom: 24px;

    .header-content {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      border-radius: 12px;
      padding: 24px;
      color: white;
      box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);

      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;

        i {
          font-size: 28px;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .page-description {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
        line-height: 1.5;
      }
    }
  }

  // 搜索过滤区域
  .filter-container {
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-end;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;

        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .date-picker {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #ff9a9e;
              box-shadow: 0 0 0 3px rgba(255, 154, 158, 0.1);
            }
          }
        }

        .filter-input {
          ::v-deep .el-input__inner {
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            &:focus {
              border-color: #ff9a9e;
              box-shadow: 0 0 0 3px rgba(255, 154, 158, 0.1);
            }
          }
        }
      }

      .filter-buttons {
        margin-left: auto;
        display: flex;
        gap: 12px;

        .search-btn {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 154, 158, 0.3);
          }
        }

        .reset-btn {
          border-radius: 8px;
          padding: 10px 20px;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
            transform: translateY(-1px);
          }
        }
      }
    }
  }

  // 数据表格区域
  .table-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 0px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);

    .operate-table {
      border-radius: 8px;
      overflow: hidden;

      ::v-deep .el-table__header-wrapper {
        .el-table__header {
          th {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: #495057;
          }
        }
      }

      ::v-deep .el-table__body-wrapper {
        .el-table__body {
          tr {
            transition: all 0.3s;

            &:hover {
              background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
              transform: scale(1.01);
            }
          }
        }
      }

      .url-cell,
      .code-cell,
      .user-cell,
      .ip-cell,
      .time-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          color: #ff9a9e;
          font-size: 14px;
          flex-shrink: 0;
        }

        span {
          color: #606266;
          font-weight: 500;
        }
      }

      .error-cell {
        .error-message {
          color: #f56c6c;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;

          i {
            font-size: 14px;
          }
        }

        .success-message {
          color: #67c23a;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;

          i {
            font-size: 14px;
          }
        }
      }
    }

    .pagination-wrapper {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;

    .page-header .header-content {
      padding: 20px;

      .page-title {
        font-size: 20px;
      }

      .page-description {
        font-size: 13px;
      }
    }

    .filter-container {
      padding: 20px;

      .filter-form {
        flex-direction: column;
        gap: 12px;

        .el-form-item {
          width: 100%;

          .el-input,
          .el-date-picker {
            width: 100% !important;
          }
        }

        .filter-buttons {
          margin-left: 0;
          justify-content: center;

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .table-container {
      padding: 16px;
      overflow-x: auto;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-container {
  animation: fadeInUp 0.6s ease-out;

  .page-header,
  .filter-container,
  .table-container {
    animation: fadeInUp 0.6s ease-out;
  }
}

.edit-input {
  padding-right: 100px;
}

.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
