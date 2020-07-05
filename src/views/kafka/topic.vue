<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input v-model="listQuery.params.clusterName" placeholder="集群名称" style="width: 200px;" class="filter-item" />-->
      <el-select v-model="listQuery.params.clusterName" placeholder="请选择" class="filter-item">
        <el-option
          v-for="item in options.clusters"
          :key="item.clusterName"
          :label="item.clusterName"
          :value="item.clusterName"
        />
      </el-select>
      <el-input v-model="listQuery.params.topicName" placeholder="主题名称" style="width: 200px;" class="filter-item" />
      <el-button v-if="checkPermission2(['KAFKA_TOPIC_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['KAFKA_TOPIC_SYNC'])" class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-refresh" @click="handleSync">
        同步集群主题
      </el-button>
      <el-button v-if="checkPermission2(['KAFKA_TOPIC_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        创建主题
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="133px" label="集群名称">
        <template slot-scope="scope">
          <span>{{ scope.row.clusterName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主题名称">
        <template slot-scope="scope">
          <span>{{ scope.row.topicName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="存储类型" width="127">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分区数" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.partitionSize }}</span>
        </template>
      </el-table-column>
      <el-table-column label="复制数" width="70" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.replicaSize }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-link v-if="checkPermission2(['KAFKA_TOPIC_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['KAFKA_TOPIC_REFRESH'])" type="warning" icon="el-icon-refresh" @click="handleRefresh(scope.row)">重建</el-link>
          <el-link v-if="checkPermission2(['KAFKA_TOPIC_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改主题信息':'创建主题'">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="集群名称">
          <!--<el-input v-model="record.clusterName" placeholder="集群名称" :disabled="dialogCodeEdit" />-->
          <el-select v-model="record.clusterName" placeholder="请选择" :disabled="propDisabled">
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主题名称">
          <el-input v-model="record.topicName" placeholder="主题名称" :disabled="propDisabled" />
          <!--<el-select
            v-model="record.topicName"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
            style="width:100%"
          >
            <el-option
              v-for="item in options.topics"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>-->
        </el-form-item>
        <el-form-item label="分区数">
          <el-input-number v-model="record.partitionSize" :min="1" :max="50" :step="2" :disabled="propDisabled" />
        </el-form-item>
        <el-form-item label="复制数">
          <el-input-number v-model="record.replicaSize" :min="0" :max="10" :disabled="propDisabled" />
        </el-form-item>
        <el-form-item label="存储类型">
          <!--<el-input v-model="record.type" placeholder="存储类型" />-->
          <el-select v-model="record.type" placeholder="请选择">
            <el-option key="JSON" label="JSON" value="JSON" />
            <el-option key="STRING" label="STRING" value="STRING" />
            <el-option key="PROTO_STUFF" label="PROTO_STUFF" value="PROTO_STUFF" />
          </el-select>
        </el-form-item>
        <el-form-item label="存储Jar包">
          <el-input v-model="record.classFile" placeholder="存储Jar包" />
        </el-form-item>
        <el-form-item label="存储对象">
          <el-input v-model="record.className" placeholder="存储对象" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="record.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="主题说明"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible2" :title="'同步Kafka集群主题'" width="400px">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="集群名称">
          <el-select v-model="record.clusterName" placeholder="请选择">
            <el-option
              v-for="item in options.clusters"
              :key="item.clusterName"
              :label="item.clusterName"
              :value="item.clusterName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="primary" @click="handleSyncSubmit">提交</el-button>
        <el-button type="danger" @click="dialogVisible2=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list, add, edit, del, getClusters, getTopics, syncAll, refresh2 } from '@/api/kafka/topic'

export default {
  name: 'KafkaTopic',
  components: { Pagination },
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
      dialogVisible: false,
      dialogType: false,
      propDisabled: false,
      dialogVisible2: false,
      loading: false,
      options: {
        clusters: [],
        topics: []
      }
    }
  },
  created() {
    this.getList()
    this.getClusters()
  },
  methods: {
    checkPermission2,
    async getClusters() {
      const resp = await getClusters()
      if (resp && resp.success) this.options.clusters = resp.rows
    },
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.loading = false })
    },
    handleAdd() {
      this.record = { partitionSize: 4, replicaSize: 3, type: 'JSON' }
      this.dialogType = 'new'
      this.dialogVisible = true
      this.propDisabled = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.propDisabled = true
    },
    handleDel(row) {
      const _this = this
      this.$confirm('请确认是否删除主题，删除不可恢复?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await del(row.id)
          _this.getList()
          this.$message.success('删除成功!')
        })
        .catch(err => { console.error(err) })
    },
    handleRefresh(row) {
      this.$confirm('请确认是否重建主题，当前主题消息将删除?', '重建主题', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await refresh2(row)
          this.$message.success('重建主题成功!')
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        resp = await add(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await edit(this.record.id, this.record)
      }
      if (resp.success) {
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
    },
    handleSync() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible2 = true
    },
    async handleSyncSubmit() {
      this.dialogVisible2 = false
      const loadingS = Loading.service({ target: document.querySelector('.app-container'), text: `正在同步${this.record.clusterName}主题，请稍后......`, fullscreen: false })
      const _this = this
      const resp = await syncAll(_this.record).catch(() => { loadingS.close() })
      loadingS.close()
      if (resp && resp.success) {
        this.$notify({
          title: `Kafka集群主题同步成功!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.clusterName}</div>
          `,
          type: 'success'
        })
        _this.getList()
      } else {
        // _this.dialogVisible2 = true
        _this.$message.error('同步失败！')
      }
    },
    async remoteMethod(query) {
      if (!this.record.clusterName || this.record.clusterName === '') {
        this.$message.warn('请先选择集群...')
        return
      }
      if (query !== '') {
        this.loading = true
        getTopics(this.record.clusterName, query).then(response => {
          this.loading = false
          if (response.success) {
            this.options.topics = response.rows.map(item => {
              return { value: item, label: item }
            })
          }
        })
      } else {
        this.options.topics = []
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

  .el-select .el-input__inner {
    width: 360px;
  }
</style>
