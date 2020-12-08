<template>
  <div class="app-container">
    <div class="filter-container">

      <el-form :model="params" label-width="180px" label-position="left">
        <el-row>
          <el-col :span="12">
            <el-form-item label="集群名称">
              <el-select v-model="params.clusterName" placeholder="请选择" class="filter-item" @change="handleClusterChange">
                <el-option
                  v-for="item in options.clusters"
                  :key="item.clusterName"
                  :label="item.clusterName"
                  :value="item.clusterName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题名称">
              <el-select
                v-model="params.topicName"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="remoteMethod"
                :loading="loading"
                @change="handleTopicChange"
              >
                <el-option
                  v-for="item in options.topics"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Mock线程数">
              <el-input-number v-model="params.threadSize" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单线程Mock数据量">
              <el-input-number v-model="params.batchSize" :min="1" :max="1000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="GPS轨迹时间">
              <el-date-picker
                v-model="params.value1"
                value-format="timestamp"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Mock属性" style="margin-bottom: 0">
          <el-button type="text" size="small" icon="el-icon-plus" @click="handleAddNode()">添加属性</el-button>
        </el-form-item>
        <!--default-expand-all-->
        <el-table
          :data="subParams"
          row-key="uid"
          default-expand-all
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column width="80" label="展开" />
          <el-table-column prop="code" label="属性代码">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.code" :disabled="row.codeNonEdit" type="textarea" size="small" placeholder="属性代码，空为单参数，[]为Array，<>为Collection" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="属性类型" width="120">
            <template slot-scope="{row}">
              <template>
                <!--<el-input v-model="row.type" size="small" placeholder="属性类型" />-->
                <el-select v-model="row.type" :disabled="row.typeNonEdit" placeholder="请选择" size="small">
                  <el-option v-for="item in options.propTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="valRegex" label="Mock规则">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valRegex" :disabled="row.valNonEdit" type="textarea" size="small" placeholder="[1-100]值或正则（多个&quot;,&quot;拼接，空为自动）" />
              </template>
            </template>
          </el-table-column>
          <!--<el-table-column prop="sort" label="序号" width="80">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.sort" size="small" placeholder="序号" />
              </template>
            </template>
          </el-table-column>-->
          <el-table-column prop="name" label="属性名称">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.name" size="small" :disabled="row.nameNonEdit" placeholder="属性名称" />
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link v-if="!scope.row.nonDelete" type="danger" @click="handleDelNode(scope.$index, scope.row)">
                删除
              </el-link>
              <el-link v-if="scope.row.type==='{}'" type="primary" @click="handleAddNode(scope.row)">
                添加属性
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="getList">
          刷新
        </el-button>
        <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleSubmit">
          保存
        </el-button>
        <el-button class="filter-item" type="success" icon="el-icon-share" @click="handleMock">
          MOCK
        </el-button>
        <div id="amap-main" />
      </el-form>
    </div>

  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { getClusters, getTopics } from '@/api/kafka/content'
import { searchMock, saveMock, doMockGPS } from '@/api/kafka/mocker'
import AMap2, { lazyAMapApiLoaderInstance } from 'vue-amap'

AMap2.initAMapApiLoader({
  key: '40125e541facc667f3c33a229a9b5493', // 刚刚开发者申请哪里的key
  plugin: ['AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType']
})

const objs = [{
  clazz: '',
  type: '{}',
  params: '',
  name: '经纬度',
  status: '1',
  clazzNonEdit: true,
  typeNonEdit: true,
  nameNonEdit: true,
  valNonEdit: true,
  nonDelete: true,
  children: [
    {
      code: '',
      type: 'java.lang.String',
      params: '',
      name: ' 经度',
      status: '1',
      // codeNonEdit: true,
      typeNonEdit: true,
      nameNonEdit: true,
      valNonEdit: true,
      nonDelete: true
    },
    {
      code: '',
      type: 'java.lang.String',
      params: '',
      name: '纬度',
      status: '1',
      // codeNonEdit: true,
      typeNonEdit: true,
      valNonEdit: true,
      nameNonEdit: true,
      nonDelete: true
    }
  ]
},
{
  clazz: '',
  type: 'java.util.Date',
  params: '',
  name: '上传时间',
  status: '1',
  clazzNonEdit: true,
  typeNonEdit: true,
  nameNonEdit: true,
  valNonEdit: true,
  nonDelete: true
}
]
export default {
  name: 'KafkaGPSMock',
  data() {
    return {
      listLoading: false,
      params: {
        clusterName: '',
        topicName: '',
        threadSize: 4,
        batchSize: 10
      },
      subParams: [],
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {
          type: '1', limit: 12
        }
      },
      limitDisabled: false,
      record: {},
      content: '',
      contentType: '',
      loading: false,
      options: {
        clusters: [],
        topics: [],
        propTypes: [
          // { value: '', label: '自动' },
          { value: 'java.lang.String', label: 'String' },
          { value: 'java.lang.Integer', label: 'Integer' },
          { value: 'java.lang.Float', label: 'Float' },
          { value: 'java.util.Date', label: 'Date' },
          { value: 'java.lang.Boolean', label: 'Boolean' },
          { value: 'java.lang.Double', label: 'Double' },
          { value: 'java.lang.Long', label: 'Long' },
          { value: 'java.lang.Short', label: 'Short' },
          { value: '{}', label: 'Object' },
          { value: '-', label: '放空' }
        ]
      },
      timer: '',
      loadingIns: null
    }
  },
  created() {
    this.getClusters()
    this.initGPSData()
  },
  mounted() {
    lazyAMapApiLoaderInstance.load().then(() => {
      this.map = new AMap.Map('amap-main', { center: new AMap.LngLat(113.929208, 22.50641) })
    })
  },
  methods: {
    initGPSData() {
      const records = Object.assign([], objs)
      records.forEach(item => {
        item.uid = this.guid()
        if (item.children) {
          item.children.forEach(e => { e.uid = this.guid() })
        }
        console.log(item)
        this.subParams.push(item)
      })
    },
    async getClusters() {
      const resp = await getClusters()
      if (resp && resp.success) this.options.clusters = resp.rows
    },
    getList() {
      if (!this.params.clusterName || this.params.clusterName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (!this.params.topicName || this.params.topicName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择主题...'
        })
        return
      }
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

      // this.listLoading = true
      this.params.props = undefined
      this.params.createAt = undefined
      this.params.updateAt = undefined
      this.subParams = []
      searchMock(this.params).then(resp => {
        if (resp.success) {
          this.params = Object.assign(this.params, resp.rows[0])
          this.subParams = resp.rows[0].props || []
        }
      }).finally(() => {
        this.loadingIns.close()
      })
    },
    handleAddNode(row) {
      this.addPropRow(this.subParams, { clazz: '', params: '', uid: this.guid() }, row)
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    handleDelNode(index, row) {
      // this.subParams.splice(index, 1)
      this.removeRow(this.subParams, row)
    },
    addPropRow(data, subRow, row) {
      if (!row) {
        data.push(subRow)
        return
      }

      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (row.uid === item.uid) {
          if (item.children) {
            item.children.push(subRow)
          } else {
            item.children = [subRow]
          }
          break
        } else if (item.children && item.children.length > 0) {
          this.addPropRow(item.children, subRow, row)
        }
      }
    },
    removeRow(data, row) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (row.uid === item.uid) {
          data.splice(i, 1)
          break
        } else if (item.children && item.children.length > 0) {
          this.removeRow(item.children, row)
        }
      }
      /* data.forEach((item, index) => {
        if (row.uid === item.uid) {
          data.splice(index, 1)
        } else if (item.children && item.children.length > 0) {
          this.removeRow(item.children, row)
        }
      })*/
    },
    async handleSubmit() {
      const resp = await saveMock(this.params).catch(() => {})
      if (resp && resp.success) {
        this.$notify({
          title: `保存配置成功!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: </div>
            <div>${this.params.clusterName}</div>
            <div>主题名称: </div>
            <div>${this.params.topicName}</div>
          `,
          type: 'success'
        })
      }
    },
    async handleMock() {
      if (!this.params.props) {
        this.params.props = this.subParams
      }
      const resp = await doMockGPS(this.params).catch(() => {})
      if (resp && resp.success) {
        this.dialogVisible2 = false
        this.$notify({
          title: `集群名称: ${this.params.clusterName}`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>推送 ${resp.rows.length} 条消息 Success! </div>
          `,
          type: 'success'
        })
      }
    },
    async remoteMethod(query) {
      if (!this.params.clusterName || this.params.clusterName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择集群...'
        })
        return
      }
      if (query !== '') {
        this.loading = true
        getTopics(this.params.clusterName, query).then(response => {
          this.loading = false
          if (response.success) {
            this.options.topics = response.rows.map(item => {
              return { value: item.topicName, label: item.topicName }
            })
          }
        })
      } else {
        this.options.topics = []
      }
    },
    handleTopicChange(val) {
      console.log('handleTopicChange: ', val)
      this.getList()
    },
    handleClusterChange(val) { this.options.topics = [] }
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
  #amap-main {
    height: 600px
  }
</style>
