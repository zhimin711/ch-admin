<template>
  <div class="app-container">
    <sticky :z-index="10" :class-name="'sub-navbar2 '">
      <tenant v-model="namespace" @change="fetchData" />
    </sticky>
    <div class="query-container">
      <el-form ref="queryForm" :model="listQuery" :inline="true" :rules="rules">
        <el-form-item label="查询方式">
          <el-select v-model="queryType" @change="queryTypeChange">
            <el-option key="1" label="配置" value="1" />
            <el-option key="2" label="IP" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="queryType === '1'" label="Data ID" prop="dataId">
          <el-input v-model="listQuery.dataId" placeholder="请输入Data ID" style="width: 200px;" />
        </el-form-item>
        <el-form-item v-if="queryType === '1'" label="分组" prop="group">
          <el-input v-model="listQuery.group" placeholder="分组名称" style="width: 200px;" />
        </el-form-item>
        <el-form-item v-if="queryType === '2'" label="IP" prop="ip">
          <el-input v-model="listQuery.ip" placeholder="请输入IP" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <el-button class="filter-item" type="primary" icon="el-icon-search" plain @click="queryData()">查询</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column v-if="queryType === '1'" label="IP" min-width="200" prop="ip" />
      <el-table-column v-if="queryType === '2'" label="Data ID" min-width="200" prop="dataId" />
      <el-table-column v-if="queryType === '2'" label="Group" min-width="200" prop="group" />
      <el-table-column label="MD5" min-width="100" prop="md5" />
    </el-table>
    <!--<pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData()" />-->
  </div>
</template>

<script>
import { getNacosConfigsListener, getNacosListener } from '@/api/nacos/listener'
// import Pagination from '@/components/Pagination'
import Sticky from '@/components/Sticky' // 粘性header组件
import Tenant from '../components/tenant' // 粘性header组件

export default {
  name: 'NacosConfigsListener',
  components: { Sticky, Tenant },
  data() {
    return {
      list: null,
      listLoading: false,
      queryType: '1',
      count: 0,
      listQuery: {
        group: 'DEFAULT_GROUP'
      },
      rules: {
        dataId: [{ required: true, message: 'Server 名称不能为空', trigger: 'change' }],
        group: [{ required: true, message: 'Group不能为空', trigger: 'change' }],
        ip: [{ required: true, message: 'IP不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
  },
  methods: {
    fetchData() {
      this.listLoading = true
      this.listQuery.tenant = this.$store.getters.tenant
      if (this.queryType === '1') {
        getNacosConfigsListener(this.listQuery).then(res => {
          this.list = []
          if (res.lisentersGroupkeyStatus) {
            for (const p in res.lisentersGroupkeyStatus) {
              this.list.push({ ip: p, md5: res.lisentersGroupkeyStatus[p] })
            }
          }
          // this.count = res.collectStatus
        }).finally(() => {
          this.listLoading = false
        })
      } else if (this.queryType === '2') {
        getNacosListener(this.listQuery).then(res => {
          this.list = []
          if (res.lisentersGroupkeyStatus) {
            for (const p in res.lisentersGroupkeyStatus) {
              const keys = p.split('+')
              this.list.push({ dataId: keys[0], group: keys[1], md5: res.lisentersGroupkeyStatus[p] })
            }
          }
          // this.count = res.collectStatus
        }).finally(() => {
          this.listLoading = false
        })
      }
    },
    queryTypeChange(val) {
      this.list = []
      this.$nextTick(() => {
        this.$refs['queryForm'].clearValidate()
      })
    },
    queryData() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.fetchData()
        }
      })
    }
  }
}
</script>
