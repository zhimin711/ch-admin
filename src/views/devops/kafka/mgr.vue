<template>
  <div class="app-container">

    <el-tabs v-model="activeName" style="margin-bottom: 15px" @tab-click="handleChangeInfo">
      <el-tab-pane label="Kafka Topics" name="topics">
        Topic Info
      </el-tab-pane>
      <el-tab-pane label="Kafka Brokers" name="brokers">
        Broker Info
      </el-tab-pane>
      <el-tab-pane label="Consumer Groups" name="consumerGroups">
        Consumer Group
      </el-tab-pane>
    </el-tabs>
    <div v-show="activeName === 'topics'" class="filter-container">
      <el-input v-model="listQuery.params.topicName" placeholder="主题名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="'KAFKA_TOPIC_PAGE'" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-permission="'KAFKA_TOPIC_ADD'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        创建主题
      </el-button>
      <el-button v-permission="'KAFKA_TOPIC_SYNC'" class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-refresh" @click="handleSync">
        同步集群主题
      </el-button>
    </div>
    <el-table v-show="activeName === 'topics'" :loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
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
          <el-link v-permission="'KAFKA_TOPIC_EDIT'" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-permission="'KAFKA_TOPIC_EDIT'" type="primary" icon="el-icon-chat-line-round" @click="handleTopicDetail(scope.row, scope.$index)">详情</el-link>
          <!--          <el-link v-permission="'KAFKA_TOPIC_REFRESH'" type="warning" icon="el-icon-refresh" @click="handleMgr(scope.row)">重建</el-link>-->
          <el-link v-permission="'KAFKA_TOPIC_DELETE'" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="activeName === 'topics' && listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-table v-show="activeName === 'brokers'" :loading="listLoading" :data="list.brokers">
      <el-table-column label="ID" prop="id" width="50" />
      <el-table-column label="Host" prop="host" />
      <el-table-column label="Port" prop="port" width="80" />
      <el-table-column label="Partitions as Leader" prop="leaderPartitions" width="160">
        <template slot-scope="{row}">
          {{ row.leaderPartitions.length }}
        </template>
      </el-table-column>
      <el-table-column label="Partitions as Follower" prop="followerPartitions" width="180">
        <template slot-scope="{row}">
          {{ row.followerPartitions.length }}
        </template>
      </el-table-column>
    </el-table>
    <el-table v-show="activeName === 'consumerGroups'" :loading="listLoading" :data="list.consumerGroups">
      <!--      <el-table-column label="序号" prop="id" width="50" />-->
      <el-table-column label="名称" prop="groupId" />
      <el-table-column label="主题数量" prop="topics" width="160">
        <template slot-scope="{row}">
          {{ row.topics.length }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="lag" width="150">
        <template slot-scope="scope">
          <el-link
            v-permission="'KAFKA_CONSUMER_GROUPS_DESCRIBE'"
            type="primary"
            icon="el-icon-view"
            @click="handleConsumerGroupsDetail(scope.row, scope.$index)"
          >订阅列表
          </el-link>
          <el-link v-permission="'KAFKA_CONSUMER_GROUPS_DEL'" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">
            删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改主题信息':'创建主题'">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="主题名称">
          <el-input v-model="record.topicName" placeholder="主题名称" :disabled="propDisabled" />
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
    <el-dialog :visible.sync="dialogConsumer" :title="'已订阅的主题'" width="90%">
      <div>
        <el-table :data="list.describe" max-height="500">
          <el-table-column label="TOPIC" prop="topic" />
          <el-table-column label="PARTITION" prop="partition" width="100" />
          <el-table-column label="END-OFFSET" prop="logEndOffset" width="120" align="center" />
          <el-table-column label="CURRENT-OFFSET" prop="currentOffset" width="130" align="center" />
          <el-table-column label="Lag" prop="lag" width="100" align="center" />
          <el-table-column label="CONSUMER-ID" prop="consumerId" width="100" align="center" />
          <el-table-column label="HOST" prop="host" width="100" align="center" />
          <el-table-column label="CLIENT-ID" prop="clientId" width="100" align="center" />
        </el-table>
      </div>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialogConsumer=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogTopicDetail" :title="'主题详情'" width="80%">
      <el-descriptions :title="'名称: '+topic.name">
        <el-descriptions-item label="分区数量">{{ topic.partitions ? topic.partitions.length : 0 }}</el-descriptions-item>
        <el-descriptions-item label="副本数量">{{ topic.replicaSize }}</el-descriptions-item>
        <el-descriptions-item label="数据大小">{{ topic.totalLogSize }}</el-descriptions-item>
      </el-descriptions>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>详细信息</span>
        </div>
        <el-tabs v-model="activeTopicInfo" @tab-click="changeTopicInfo">
          <el-tab-pane label="分区" name="partitions">
            <el-table :data="topicDetail.partitions" max-height="500">
              <el-table-column label="Partition" prop="partition" />
              <el-table-column label="Leader" prop="leader.id" />
              <el-table-column label="Beginning Offset" prop="beginningOffset" />
              <el-table-column label="End Offset" prop="endOffset" />
              <el-table-column label="Log Size" prop="leader.logSize" />
              <el-table-column label="Replicas" prop="replicas.id" />
              <el-table-column label="ISR" prop="isr.id" />
              <el-table-column label="Sync" prop="sync" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="Brokers" name="brokers">
            <el-table :data="topicDetail.brokers" max-height="500">
              <el-table-column label="ID" prop="id" />
              <el-table-column label="Host" prop="host" />
              <el-table-column label="Port" prop="port" />
              <el-table-column label="Partitions as Leader" prop="leaderPartitions" />
              <el-table-column label="Partitions as Follower" prop="followerPartitions" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="消费组列表" name="consumerGroups">
            <el-table :data="topicDetail.consumerGroups" max-height="500">
              <el-table-column label="Group ID" prop="groupId" />
              <el-table-column label="Lag" prop="lag" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="主题配置" name="configs">
            <el-table :data="topicDetail.configs" max-height="500">
              <el-table-column label="Name" prop="name" />
              <el-table-column label="Value" prop="value" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <div slot="footer" style="text-align:right;">
        <el-button @click="dialogTopicDetail=false">{{ $t('btn.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { deepClone } from '@/utils'
import {
  pageKafkaTopics,
  addKafkaTopic,
  editKafkaTopic,
  delKafkaTopic,
  getKafkaTopic,
  getKafkaTopicPartitions,
  getKafkaTopicBrokers,
  getKafkaTopicConsumerGroups,
  getKafkaTopicConfigs,
  getTopics,
  syncAll,
  refresh2
} from '@/api/devops/kafka/topic'
import { getKafkaClusterBrokers } from '@/api/devops/kafka/cluster'
import { getKafkaConsumerGroupDescribe, getKafkaConsumerGroups } from '@/api/devops/kafka/consumerGroups'

export default {
  name: 'KafkaClusterMGR',
  data() {
    return {
      listLoading: true,
      clusterId: -1,
      activeName: 'topics',
      groupId: '',
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      list: {
        brokers: [],
        describe: [],
        consumerGroups: []
      },
      dialogTopic: false,
      activeTopicInfo: 'partitions',
      topic: {},
      topicDetail: {
        brokers: [],
        consumerGroups: [],
        configs: [],
        partitions: []
      },
      record: {},
      dialogVisible: false,
      dialogType: false,
      propDisabled: false,
      dialogVisible2: false,
      dialogConsumer: false,
      dialogTopicDetail: false,
      loading: false,
      options: {
        clusters: [],
        topics: []
      }
    }
  },
  created() {
    this.clusterId = this.$route.params && this.$route.params.id
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.params.clusterId = this.clusterId
      pageKafkaTopics(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.loading = false })
    },
    handleChangeInfo(tab) {
      if (tab.name === 'brokers' && this.list.brokers.length === 0) {
        this.getBrokerList()
      } else if (tab.name === 'consumerGroups' && this.list.consumerGroups.length === 0) {
        this.getConsumerGroupList()
      }
    },
    getBrokerList() {
      this.listLoading = true
      getKafkaClusterBrokers(this.clusterId).then(resp => {
        if (resp.success) {
          this.list.brokers = resp.rows
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    getConsumerGroupList() {
      this.listLoading = true
      getKafkaConsumerGroups(this.clusterId, this.groupId).then(resp => {
        if (resp.success) {
          this.list.consumerGroups = resp.rows
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleConsumerGroupsDetail(row) {
      this.dialogConsumer = true
      this.loading = true
      getKafkaConsumerGroupDescribe(this.clusterId, row.groupId).then(resp => {
        if (resp.success) {
          this.list.describe = resp.rows
        }
      }).finally(() => {
        this.loading = false
      })
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
    handleTopicDetail(row) {
      this.dialogTopicDetail = true
      this.topic = Object.assign({}, row)
      getKafkaTopic(row.id).then(resp => {
        if (resp.success) {
          this.topic = Object.assign(row, resp.rows[0])
        }
      })
      getKafkaTopicPartitions(row.id).then(resp => {
        if (resp.success) {
          this.topicDetail.partitions = resp.rows
        }
      })
    },
    changeTopicInfo(tab) {
      if (tab.name === 'brokers' && this.topicDetail.brokers.length === 0) {
        getKafkaTopicBrokers(this.topic.id).then(resp => {
          if (resp.success) {
            this.topicDetail.brokers = resp.rows
          }
        })
      } else if (tab.name === 'consumerGroups' && this.topicDetail.consumerGroups.length === 0) {
        getKafkaTopicConsumerGroups(this.topic.id).then(resp => {
          if (resp.success) {
            this.topicDetail.configs = resp.rows
          }
        })
      } else if (tab.name === 'configs' && this.topicDetail.configs.length === 0) {
        getKafkaTopicConfigs(this.topic.id).then(resp => {
          if (resp.success) {
            this.topicDetail.configs = resp.rows
          }
        })
      }
    },
    handleDel(row) {
      const _this = this
      this.$confirm('请确认是否删除主题，删除不可恢复?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await delKafkaTopic(row.id)
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
        resp = await addKafkaTopic(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editKafkaTopic(this.record.id, this.record)
      }
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
    },
    handleSync() {
      this.$confirm('请确认是否同步当前集群主题?', '同步主题', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const data = { clusterId: this.clusterId }
          await this.handleSyncSubmit(data)
          this.$message.success('同步主题成功!')
        })
        .catch(err => { console.error(err) })
    },
    async handleSyncSubmit(data) {
      this.dialogVisible2 = false
      const loadingS = Loading.service({ target: document.querySelector('.app-container'), text: `正在同步主题，请稍后......`, fullscreen: false })
      const _this = this
      const resp = await syncAll(data).catch(() => { loadingS.close() })
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
