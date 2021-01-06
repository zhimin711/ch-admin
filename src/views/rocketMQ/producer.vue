<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="params" label-width="180px" label-position="left">
        <el-form :model="params" :inline="true" label-width="180px" label-position="left">
          <el-form-item label="主题">
            <el-select v-model="params.topic" placeholder="请选择" class="filter-item" @change="handleClusterChange">
              <el-option
                v-for="item in options.topics"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生产组">
            <el-input v-model="params.producerGroup" />
          </el-form-item>
          <el-form-item>
            <el-button v-permission="'ROCKET_MQ_PRODUCER_SEARCH'" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
              {{ $t('btn.search') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-form>
    </div>
    <el-table v-loading="table.m.loading" :data="table.m.data">
      <el-table-column label="clientId" prop="clientId" />
      <el-table-column label="地址" prop="clientAddr" />
      <el-table-column label="language" prop="language" />
      <el-table-column label="版本" prop="versionDesc" />
    </el-table>

  </div>
</template>

<script>
import {
  listRocketMQTopic
} from '@/api/rocketmq/topic'
import { listRocketMQProducer } from '@/api/rocketmq/producer'

export default {
  name: 'RocketMQProducer',
  data() {
    return {
      listLoading: true,
      params: {},
      record: {},
      brokerServer: {},
      brokers: {},
      table: {
        m: {
          loading: false,
          page: 1,
          limit: 10,
          total: 0,
          params: {},
          data: []
        }
      },
      options: {
        topics: []
      }
    }
  },
  created() {
    this.getTopics()
  },
  methods: {
    getTopics() {
      listRocketMQTopic().then(resp => {
        if (resp.success) {
          const { topicList } = resp.rows[0]
          topicList.sort()
          this.options.topics = []
          for (let i = 0; i < topicList.length; i++) {
            this.options.topics.push({ label: topicList[i], value: topicList[i] })
          }
        }
      })
    },
    getList() {
      this.table.m.loading = true
      this.table.m.data = []
      listRocketMQProducer(this.params).then(resp => {
        if (resp.success) {
          this.table.m.data = resp.rows
        }
      }).finally(() => { this.table.m.loading = false })
    },
    handleClusterChange(val) {
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
  .info-cell {
    padding: 5px 5px;
    border: 1px solid #d9d9d9
  }
</style>
