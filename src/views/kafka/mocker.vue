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
                v-model="topicName"
                filterable
                remote
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
          <el-col :span="24">
            <!--<el-menu :default-active="activeConf" class="el-menu-conf" mode="horizontal" @select="selectConf">
              <el-menu-item v-for="(item,index) in confs" :key="item.id" :index="item.id + ''">
                 {{ item.description || '配置 ' + (index+1) }}
              </el-menu-item>
              <el-menu-item index="plus"><i class="el-icon-plus"></i></el-menu-item>
            </el-menu>-->

            <el-tabs v-if="params.topicName" v-model="activeConf" type="card" editable @tab-click="selectConf" @tab-add="handleAddMock" @tab-remove="handleDelMock">
              <el-tab-pane v-for="(item, index) in confs" :key="item.id" :label="'配置 ' + (index+1) + (item.description ? ' [' + item.description + ']' : '')" :name="item.id + ''">
                <!--{{ item.description || '配置 ' + (index+1) }}-->
                <el-col :span="12">
                  <el-form-item label="配置名称">
                    <el-input v-model="params.description" />
                    <!--<span v-else>{{ item.description || '-' }}</span>-->
                  </el-form-item>
                </el-col>
                <!--<el-col :span="12">
                  <el-button type="text" size="small" icon="el-icon-edit" @click="nameEdit = !nameEdit">修改名称</el-button>
                </el-col>-->
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
        <div v-if="params.topicName">
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
              <el-form-item label="开启调整">
                <el-switch v-model="params.enableEdit" />
              </el-form-item>
            </el-col>
            <el-col v-if="params.enableEdit" :span="12">
              <el-form-item label="调整延迟（秒）">
                <el-input-number v-model="params.batchSize" :min="1" :max="1000" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="开启删除">
                <el-switch v-model="params.enableDel" />
              </el-form-item>
            </el-col>
            <el-col v-if="params.enableDel" :span="12">
              <el-form-item label="删除延迟（秒）">
                <el-input-number v-model="params.batchSize" :min="1" :max="1000" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="开启属性排序">
                <el-switch v-model="params.enableSort" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item label="Mock属性" style="margin-bottom: 0">
          <el-button type="text" size="small" icon="el-icon-plus" @click="handleAddNode()">添加属性</el-button>
        </el-form-item>
        <!--default-expand-all-->
        <el-table
          :data="subParams"
          row-key="uid"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column width="80" label="展开" />
          <el-table-column prop="code" label="属性代码">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.code" type="textarea" size="small" placeholder="属性代码，-为单参数，[]为Array，<>为Collection" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="属性类型" width="120">
            <template slot-scope="{row}">
              <template>
                <!--<el-input v-model="row.type" size="small" placeholder="属性类型" />-->
                <el-select v-model="row.type" placeholder="请选择" size="small" @change="changeRules(row)">
                  <el-option v-for="item in options.propTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="规则" width="130">
            <template slot-scope="{row}">
              <template>
                <el-select v-model="row.rule" :disabled="row.typeNonEdit" placeholder="请选择" size="small">
                  <el-option v-for="item in (row.rules2 || changeRules(row))" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="valRegex" label="Mock规则">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valRegex" type="textarea" size="small" placeholder="[1-100]值或正则（多个&quot;,&quot;拼接，空为自动）" />
              </template>
            </template>
          </el-table-column>
          <el-table-column v-if="params.enableEdit" prop="valEdit" label="调整值" width="100">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valEdit" size="small" placeholder="调整值" />
              </template>
            </template>
          </el-table-column>
          <el-table-column v-if="params.enableDel" prop="valDel" label="删除值" width="100">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.valDel" size="small" placeholder="删除值" />
              </template>
            </template>
          </el-table-column>
          <el-table-column v-if="params.enableSort" prop="sort" label="序号" width="80">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.sort" size="small" placeholder="序号" />
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="属性名称">
            <template slot-scope="{row}">
              <template>
                <el-input v-model="row.name" size="small" placeholder="属性名称" />
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link type="danger" @click="handleDelNode(scope.$index, scope.row)">
                删除
              </el-link>
              <el-link v-if="scope.row.type==='{}'" type="primary" @click="handleAddNode(scope.row)">
                添加属性
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="loadConf()">
          重置
        </el-button>
        <el-button v-if="params.topicName" class="filter-item" type="primary" icon="el-icon-edit" @click="handleSubmit">
          保存
        </el-button>
        <el-button class="filter-item" type="success" icon="el-icon-share" @click="handleMock">
          MOCK
        </el-button>
      </el-form>
    </div>

  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { getClusters, getTopics } from '@/api/kafka/content'
import { searchMock, saveMock, doMock, loadMock, deleteMock } from '@/api/kafka/mocker'

const rules2 = [
  { value: 'RANDOM', label: '随机', types: [], filterTypes: [] },
  { value: 'FIXED', label: '固定值', types: [], filterTypes: ['{}'] },
  { value: 'EMPTY', label: '放空', types: [], filterTypes: [] },
  { value: 'RANDOM_LENGTH', label: '随机+长度', types: [], filterTypes: ['{}', 'java.lang.Boolean', 'java.util.Date'] },
  { value: 'RANDOM_RANGE', label: '随机+范围', types: [], filterTypes: ['{}', 'java.lang.Boolean'] },
  { value: 'AUTO_INCR', label: '递增', types: [], filterTypes: ['{}', 'java.lang.String', 'java.lang.Boolean'] },
  { value: 'AUTO_INCR_RANGE', label: '递增+范围', types: [], filterTypes: ['{}', 'java.lang.String', 'java.lang.Boolean'] },
  { value: 'AUTO_DECR', label: '递减', types: [], filterTypes: ['{}', 'java.lang.String', 'java.lang.Boolean'] },
  { value: 'AUTO_DECR_RANGE', label: '递减+范围', types: [], filterTypes: ['{}', 'java.lang.String', 'java.lang.Boolean'] },
  { value: 'OBJECT', label: '对象', types: ['{}'], filterTypes: [] }
]
export default {
  name: 'KafkaMock',
  data() {
    return {
      listLoading: false,
      nameEdit: false,
      topicName: '',
      params: {
        clusterName: '',
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
          type: '1',
          del: false,
          limit: 12
        }
      },
      limitDisabled: false,
      record: {},
      content: '',
      contentType: '',
      activeConf: '',
      confs: [],
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
    this.handleAddNode()
  },
  methods: {
    selectConf(tab, event) {
      // console.log(tab, event)
      const row = { id: tab.name, clusterName: this.params.clusterName, topicName: this.params.topicName }
      this.loadConf(row)
    },
    changeRules(row) {
      // row.rule = undefined
      row.rules2 = []
      rules2.forEach(item => {
        if (item.types.length === 0 && item.filterTypes.length === 0) {
          row.rules2.push(item)
        } else if (item.types.includes(row.type)) {
          row.rules2.push(item)
        } else if (!item.filterTypes.includes(row.type) && item.types.length === 0) {
          row.rules2.push(item)
        }
      })
      return row.rules2
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
      if (!this.topicName || this.topicName === '') {
        this.$message({
          type: 'warn',
          message: '请先选择主题...'
        })
        return
      }
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

      // this.listLoading = true
      this.params.topicName = this.topicName
      this.params.props = undefined
      this.params.createAt = undefined
      this.params.updateAt = undefined
      this.subParams = []

      searchMock(this.params).then(resp => {
        if (resp.success) {
          this.confs = resp.rows
          if (this.confs.length === 0) {
            this.confs.push({ id: 0 })
          }
          const row = resp.rows[0]
          if (row && row.id) {
            this.activeConf = row.id + ''
            this.loadConf(row)
          } else {
            this.activeConf = '0'
            this.params.id = 0
            this.loadConf(this.params)
          }
        }
      }).finally(() => {
        this.loadingIns.close()
      })
    },
    loadConf(row) {
      const params2 = row || { id: this.activeConf, clusterName: this.params.clusterName, topicName: this.params.topicName }
      loadMock(params2).then(resp => {
        if (resp.success) {
          const row = resp.rows[0]
          this.params = Object.assign({}, row)
          if (this.params.id) this.params.id = 0
          if (row.contentType === 'GPS') {
            /* this.$confirm('该主题为GPS轨迹配置，继续将清除原配置，是否继续?', '提示', {
                confirmButtonText: '继续',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                })
                .catch(() => {
                  this.topicName = undefined
                })*/
            this.$notify({
              title: '该主题为GPS轨迹配置,将清除原配置信息！',
              type: 'warning'
            })
          } else {
            this.subParams = row.props || []
          }
        }
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
      if (!this.params.props) {
        this.params.props = this.subParams
      }
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
        if (this.activeConf === '0') {
          this.confs[this.confs.length - 1].id = resp.rows[0]
          this.confs[this.confs.length - 1].description = this.params.description
          this.activeConf = resp.rows[0] + ''
        }
      }
    },
    async handleMock() {
      if (!this.params.props) {
        this.params.props = this.subParams
      }
      const resp = await doMock(this.params).catch(() => {})
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
    handleAddMock() {
      const tabs = this.confs
      let newTab = false
      tabs.forEach((tab, index) => {
        if (tab.id === 0) {
          newTab = true
        }
      })
      if (newTab) {
        this.$confirm('已存在新增配置未保存，请先保存后再新增，是否切换到新配置?', '提示', {
          confirmButtonText: '切换',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.activeConf !== '0') {
            this.activeConf = '0'
            const row = { id: 0, clusterName: this.params.clusterName, topicName: this.params.topicName }
            this.loadConf(row)
          }
        }).catch(() => {
        })
      } else {
        this.activeConf = '0'
        this.confs.push({ id: 0 })
        const row = { id: 0, clusterName: this.params.clusterName, topicName: this.params.topicName }
        this.loadConf(row)
      }
    },
    handleDelMock(targetName) {
      const tabs = this.confs
      if (tabs.length === 1) {
        this.$message.warning('至少保留一个配置，不允许删除当前配置！')
        return
      }
      let activeName = this.activeConf
      this.$confirm('删除配置，操作不可恢复，是否继续?', '提示', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            const name = tab.id + ''
            if (name === targetName) {
              const nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.id + ''
              }
            }
          })
        }

        if (this.activeConf !== '0') {
          deleteMock({ id: this.activeConf }).then(reps => {
          })
        }

        this.activeConf = activeName
        this.confs = tabs.filter(tab => (tab.id + '') !== targetName)

        const row = { id: activeName, clusterName: this.params.clusterName, topicName: this.params.topicName }
        this.loadConf(row)
      }).catch(() => {
      })
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

      this.$nextTick(() => {
        this.getList()
      })
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
  .el-menu-conf {
    margin-top: -20px;
    margin-bottom: 15px;
  }
</style>
