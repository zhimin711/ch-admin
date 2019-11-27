<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="searchParams.insId"
        class="filter-item"
        filterable
        remote
        reserve-keyword
        placeholder="(应用实例)请输入关键词"
        :remote-method="queryInstances"
        :loading="loadingIns"
        @change="changeIns"
      >
        <el-option
          v-for="item in options.instances"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
          {{ item.name }}
        </el-option>
      </el-select>
      <!--<el-input v-model="listQuery.params.name" placeholder="名称" style="width: 200px;" class="filter-item" />-->
      <!--<el-select v-model="searchParams.type" placeholder="类型" class="filter-item" clearable>
        <el-option label="日志" value="1">日志</el-option>
        <el-option label="配置" value="0">配置</el-option>
      </el-select>-->
      <el-select v-model="searchParams.env" placeholder="环境" class="filter-item" clearable @change="changeEnv">
        <el-option label="DEV" value="1">DEV</el-option>
        <el-option label="TEST" value="2">TEST</el-option>
        <el-option label="PROD" value="3">PROD</el-option>
      </el-select>
      <el-input v-model="searchParams.fileName" placeholder="文件名匹配（info.log）" style="width: 200px;" class="filter-item" />
      <el-input v-model="searchParams.fileContent" placeholder="日志内容匹配" style="width: 300px;" class="filter-item" />
      <el-button v-if="checkPermission2(['SYS_APP_LOGS_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="searchParams = {}">
        重置
      </el-button>
    </div>

    <el-card class="box-card res-container">
      <div slot="header" class="clearfix">
        <span>搜索结果</span>
        <!--<el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>-->
      </div>
      <div v-for="item in searchResults" :key="item.ip" class="text item">
        <span>{{ item.ip }} - {{ item.dir }}</span>
        <el-collapse>
          <el-collapse-item v-for="e1 in item.records" :key="(item.ip + e1.fileName)" :title="e1.fileName" :name="e1.fileName">
            <div v-for="(e2,i) in e1.data" :key="(item.ip + e1.fileName + i)">
              <el-button v-if="e2.number" icon="el-icon-view" size="mini" @click="handleDetail(item.searchInfo, e1, e2.number)">查看明细</el-button>
              <el-tag v-if="e2.number" size="medium">第{{ e2.number }}行</el-tag>
              {{ e2.data }}
            </div>
            <el-button-group v-if="e1.type!=='0'">
              <el-button type="primary" icon="el-icon-arrow-left" :loading="loadingPage" @click="handlePage(item.searchInfo, e1, -1)">上一页</el-button>
              <el-button type="primary" :loading="loadingPage" @click="handlePage(item.searchInfo, e1, 1)">下一页<i class="el-icon-arrow-right el-icon--right"></i></el-button>
            </el-button-group>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <el-dialog :visible.sync="dialogVisible" :title="'搜索明细'" width="80%">
      <div v-for="(e2,i) in detailResult" :key="(detailInfo.dir + (detailInfo.beforeLineNum + i))">
        {{ e2.data }}
      </div>
      <div style="text-align:center;">
        <el-button type="primary" :loading="loadingPage" icon="el-icon-arrow-left" @click="handleDetailPage(-1)">上一页</el-button>
        <el-button type="primary" :loading="loadingPage" @click="handleDetailPage(1)">下一页<i class="el-icon-arrow-right el-icon--right"></i></el-button>
        <el-button type="danger" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { Loading } from 'element-ui'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { search } from '@/api/sys/app/logs'
import { getUserInstances, getUserNodes } from '@/api/sys/app/instance'

export default {
  name: 'SysAppLogsManager',
  data() {
    return {
      loadingIns: false,
      loadingPage: false,
      options: {
        instances: []
      },
      searchParams: {},
      searchResults: [],
      activeNames: ['1'],
      record: {},
      nodes: [],
      dialogVisible: false,
      detailInfo: {},
      detailResult: []
    }
  },
  created() {
    this.queryInstances('')
    // this.getList()
  },
  methods: {
    checkPermission2,
    queryInstances(query) {
      this.loadingIns = true
      getUserInstances(query).then(response => {
        this.loadingIns = false
        this.options.instances = response.rows
      })
    },
    changeIns(val) {
      getUserNodes(val).then(response => {
        this.nodes = response.rows
      })
    },
    changeEnv(val) {
    },
    handleSearch() {
      const _this = this
      if (!_this.searchParams.insId) {
        _this.$message.error('请选择应用')
        return
      }
      if (!_this.searchParams.env) {
        _this.$message.error('请选择环境')
        return
      }
      const envNodes = _this.nodes.filter(item => {
        return item.env === _this.searchParams.env
      })
      if (envNodes.length === 0) {
        const envName = ['', 'DEV', 'TEST', 'PROD'][_this.searchParams.env]
        _this.$message.error(`请选择应用${envName}没有配置节点`)
        return
      }
      const loadingS = Loading.service({ target: document.querySelector('.res-container'), fullscreen: false })
      _this.searchResults = []
      envNodes.forEach(async node => {
        // this.recordRoles.push(route.id)
        const searchInfo = { insId: node.insId, nodeId: node.id, env: node.env, type: 'FILE_LIST' }
        if (_this.searchParams.fileName) {
          searchInfo.fileName = _this.searchParams.fileName
        }
        if (_this.searchParams.fileContent) {
          searchInfo.fileContent = _this.searchParams.fileContent
        }
        const resp = await search(searchInfo)
        if (resp.success) {
          //
          const obj = resp.rows[0]
          obj.searchInfo = searchInfo
          // obj.insId = searchInfo.insId
          // obj.nodeId = searchInfo.nodeId
          _this.searchResults.push(obj)
          loadingS.close()
        }
      })
    },
    handlePage(info, e, op) {
      const searchInfo = { insId: info.insId, nodeId: info.nodeId, env: info.env, type: 'NEXT' }
      searchInfo.dir = e.fileName
      searchInfo.beforeLineNum = e.startLine
      searchInfo.afterLineNum = e.endLine
      if (op === -1) {
        searchInfo.type = 'PRE'
      }
      this.loadingPage = true
      search(searchInfo).then(resp => {
        this.loadingPage = false
        if (!resp.success) {
          return
        }
        const row = resp.rows[0]
        if (row.code === '-1') {
          this.$message.error(row.msg)
          return
        }
        e.data = row.data
        e.startLine = row.startLine
        e.endLine = row.endLine
      }).catch(() => {
        this.loadingPage = false
      })
    },
    handleDetailPage(op) {
      this.detailInfo.type = 'NEXT'
      if (op === -1) {
        this.detailInfo.type = 'PRE'
      }
      this.loadingPage = true
      search(this.detailInfo).then(resp => {
        this.loadingPage = false
        if (!resp.success) {
          return
        }
        const row = resp.rows[0]
        if (row.code === '-1') {
          this.$message.error(row.msg)
          return
        }
        this.detailResult = row.data
        this.detailInfo.beforeLineNum = row.startLine
        this.detailInfo.afterLineNum = row.endLine
      }).catch(() => {
        this.loadingPage = false
      })
    },
    handleDetail(info, e, number) {
      const searchInfo = { insId: info.insId, nodeId: info.nodeId, env: info.env, type: 'DETAIL' }
      searchInfo.dir = e.fileName
      searchInfo.fileContent = number
      search(searchInfo).then(resp => {
        if (!resp.success) {
          return
        }
        this.dialogVisible = true
        const row = resp.rows[0]
        this.detailResult = row.data

        this.detailInfo = searchInfo
        this.detailInfo.beforeLineNum = row.startLine
        this.detailInfo.afterLineNum = row.endLine
      })
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
