<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.clusterName" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-permission="['KAFKA_CLUSTER_PAGE']" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        {{ $t('btn.search') }}
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        {{ $t('btn.reset') }}
      </el-button>
      <el-button v-permission="'KAFKA_CLUSTER_ADD'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        {{ $t('cluster.add') }}
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="120px" :label="$t('cluster.name')" prop="clusterName" />
      <el-table-column :label="'ZK ' + $t('label.address')">
        <template slot-scope="scope">
          <span>{{ scope.row.zookeeper }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="BROKERS">
        <template slot-scope="scope">
          <span>{{ scope.row.brokers }}</span>
        </template>
      </el-table-column>-->
      <el-table-column label="Brokers" prop="brokerCount">
        <!-- <template slot-scope="scope">
          <span>{{ scope.row.brokerCount }}</span>
        </template>-->
      </el-table-column>
      <el-table-column label="Topics">
        <template slot-scope="{row}">
          <span>{{ row.topicCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Consumer Groups">
        <template slot-scope="{row}">
          <span>{{ row.consumerCount }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center" :label="$t('table.createDate')">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="120">
        <template slot-scope="scope">
          <el-link v-permission="'KAFKA_CLUSTER_EDIT'" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">{{ $t('btn.edit') }}</el-link>
          <router-link v-if="checkOperation('KAFKA_CLUSTER_MGR', scope.row)" :to="'/kafka/cluster/mgr/'+scope.row.id">
            <el-button type="text" icon="el-icon-setting">{{ $t('btn.mgr') }}</el-button>
          </router-link>
          <!--          <el-link v-permission="'KAFKA_CLUSTER_EDIT'" type="success" icon="el-icon-setting" @click="handleEdit(scope.row, scope.$index)">{{ $t('btn.mgr') }}</el-link>-->
          <el-link v-permission="'KAFKA_CLUSTER_DELETE'" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">{{ $t('btn.delete') }}</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'? $t('cluster.edit'): $t('cluster.add')">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item :label="$t('cluster.name')">
          <el-input v-model="record.clusterName" placeholder="集群名称" :disabled="dialogCodeEdit" />
        </el-form-item>
        <el-form-item label="zookeeper">
          <el-input v-model="record.zookeeper" placeholder="zookeeper" />
        </el-form-item>
        <el-form-item label="brokers">
          <el-input v-model="record.brokers" placeholder="brokers" :disabled="true" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button :loading="loading.handleSubmit" type="primary" @click="handleSubmit">{{ $t('btn.save') }}</el-button>
        <el-button :disabled="loading.handleSubmit" type="danger" @click="dialogVisible=false">{{ $t('btn.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { pageKafkaCluster, addKafkaCluster, editKafkaCluster, delKafkaCluster, getKafkaCluster } from '@/api/devops/kafka/cluster'

export default {
  name: 'KafkaCluster1',
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
      loading: { handleSubmit: false },
      record: {},
      recordRoles: [],
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      roles: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkOperation(op, row) {
      let isEnabled = checkPermission2([op])
      if (!isEnabled) {
        return false
      }
      if (row.brokers.length > 0) {
        isEnabled = false
      }
      return isEnabled
    },
    getList() {
      this.listLoading = true
      pageKafkaCluster(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
        this.fetchSyncInfo(response.rows)
      }).catch(() => { this.loading = false })
    },
    async fetchSyncInfo(rows) {
      for (const item of rows) {
        await getKafkaCluster(item.id).then(resp => {
          if (resp.success) {
            const obj = resp.rows[0]
            item.brokerCount = obj.brokerCount
            item.topicCount = obj.topicCount
            item.consumerCount = obj.consumerCount
          }
        })
      }
      console.log(rows)
      this.listQuery.list = rows
    },
    handleAdd() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
    },
    handleDel(row) {
      const _this = this
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await delKafkaCluster(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'
      _this.loading.handleSubmit = true
      if (this.dialogType === 'new') {
        resp = await addKafkaCluster(this.record).catch(() => { _this.loading.handleSubmit = false })
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editKafkaCluster(this.record.id, this.record).catch(() => { _this.loading.handleSubmit = false })
      }
      _this.loading.handleSubmit = false
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$notify({
          title: `${opName}集群名称 Success!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.clusterName}</div>
          `,
          type: 'success'
        })
        _this.getList()
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
</style>
