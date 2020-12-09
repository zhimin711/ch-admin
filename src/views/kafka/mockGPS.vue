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
            <el-form-item label="上传间隔（分钟）">
              <el-input-number v-model="params.batchSize" :min="1" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="GPS轨迹时间">
              <el-date-picker
                v-model="gpsDates"
                value-format="timestamp"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="GPS轨迹点" style="margin-bottom: 0">
          <el-button type="text" size="small" icon="el-icon-place" @click="openMap">添加轨迹点</el-button>
          <span style="padding-left: 15px">至少两个轨迹点（始发 -> 目的）</span>
        </el-form-item>
        <el-table
          :data="gpsPositions"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column width="80" type="index" label="序号" />
          <el-table-column prop="lng" label="经度" width="150" />
          <el-table-column prop="lat" label="纬度" width="150" />
          <el-table-column prop="addr" label="地址" />
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link type="danger" @click="handleDelNode(scope.$index, scope.row)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
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
        <!--<el-button class="filter-item" type="success" icon="el-icon-place" @click="openMap">
          地图
        </el-button>-->
      </el-form>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="80%"
    >
      <div class="amap-page-container">
        <el-amap-search-box class="search-box" :search-option="searchOption" :on-search-result="onSearchResult" />
        <el-amap vid="amap" class="amap-demo" :zoom="12" :center="mapCenter" :events="events">
          <el-amap-marker v-for="marker in markers" :position="marker" />
        </el-amap>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGPSPoint">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { lazyAMapApiLoaderInstance } from 'vue-amap'

import { getClusters, getTopics } from '@/api/kafka/content'
import { searchMock, saveMock, doMockGPS } from '@/api/kafka/mocker'

const objs = [{
  clazz: '',
  code: 'position',
  type: 'java.lang.String',
  params: '',
  name: '经纬度',
  status: '1',
  clazzNonEdit: true,
  typeNonEdit: true,
  nameNonEdit: true,
  valNonEdit: true,
  nonDelete: true,
  children: [
  ]
},
{
  code: 'longitude',
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
  code: 'latitude',
  type: 'java.lang.String',
  params: '',
  name: '纬度',
  status: '1',
  // codeNonEdit: true,
  typeNonEdit: true,
  valNonEdit: true,
  nameNonEdit: true,
  nonDelete: true
},
{
  code: 'ts',
  type: 'java.util.Date',
  params: '',
  name: '上传时间',
  status: '9',
  clazzNonEdit: true,
  typeNonEdit: true,
  nameNonEdit: true,
  valNonEdit: true,
  nonDelete: true
}
]
export default {
  name: 'KafkaGPSMock1',
  data() {
    return {
      listLoading: false,
      dialogVisible: false,
      params: {
        clusterName: '',
        topicName: '',
        threadSize: 4,
        batchSize: 10
      },
      map: null,
      geoCoder: null,
      markers: [
      ],
      searchOption: {
        city: '深圳',
        citylimit: true
      },
      mapCenter: [113.929208, 22.50641],
      events: {
        init: (o) => {
          console.log(o.getCenter())
          // console.log(this.$refs.map.$$getInstance())
          o.getCity(result => {
            console.log(result)
          })
        },
        'moveend': () => {
        },
        'zoomchange': () => {
        },
        'click': (e) => {
          this.addPos(e.lnglat.getLng(), e.lnglat.getLat())
        }
      },
      gpsDates: [],
      gpsPositions: [],
      point: {},
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
    this.initMap()
  },
  mounted() {
  },
  methods: {
    onSearchResult(pois) {
      let latSum = 0
      let lngSum = 0
      if (pois.length > 0) {
        this.addPos(pois[0].lng, pois[0].lat)
        pois.forEach(poi => {
          const { lng, lat } = poi
          lngSum += lng
          latSum += lat
          // this.markers.push([poi.lng, poi.lat]);
        })
        const center = {
          lng: lngSum / pois.length,
          lat: latSum / pois.length
        }
        this.mapCenter = [center.lng, center.lat]
      }
    },
    openMap() {
      this.dialogVisible = true
      this.markers = []
      this.point = null
    },
    initMap() {
      const _this = this
      lazyAMapApiLoaderInstance.load().then(() => {
        _this.geoCoder = new AMap.Geocoder({
          // city: "010", //城市设为北京，默认：“全国”
          radius: 1000 // 范围，默认：500
        })
      })
    },
    addPos(lng, lat) {
      this.markers = [[lng, lat]]
      this.point = {}
      this.point.lng = lng
      this.point.lat = lat
      const _this = this
      this.geoCoder.getAddress(this.markers[0], function(status, result) {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress
          _this.point.addr = address
        } else {
          console.error('根据经纬度查询地址失败')
        }
      })
    },
    addGPSPoint() {
      if (this.point) {
        this.gpsPositions.push({
          lng: this.point.lng,
          lat: this.point.lat,
          addr: this.point.addr
        })
      }
      this.dialogVisible = false
    },
    initGPSData() {
      const records = Object.assign([], objs)
      records.forEach(item => {
        item.uid = this.guid()
        if (item.children) {
          item.children.forEach(e => { e.uid = this.guid() })
        }
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
      const param = Object.assign({}, this.params)
      param.points = null
      searchMock(param).then(resp => {
        if (resp.success) {
          this.params = Object.assign(this.params, resp.rows[0])
          if (this.params.props && this.params.props.length > 0) {
            for (let i = 0; i < this.params.props.length; i++) {
              const e = this.params.props[i]
              if (i < 4) {
                e.typeNonEdit = true
                e.nameNonEdit = true
                e.valNonEdit = true
                e.nonDelete = true
              }
            }
            this.subParams = resp.rows[0].props
          } else {
            this.initGPSData()
          }
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
      }
    },
    async handleMock() {
      if (this.gpsDates.length < 2) {
        this.$message.warning('请选择轨迹时间')
        return
      }
      this.params.createAt = this.gpsDates[0]
      this.params.updateAt = this.gpsDates[1]
      if (this.gpsPositions.length < 2) {
        this.$message.warning('请添加轨迹点，至少2个轨迹点...')
        return
      }
      this.params.points = this.gpsPositions.map(e => {
        return e.lng + ',' + e.lat
      })
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

  .amap-page-container {
    position: relative;
  }
  #amap-main {
    height: 600px
  }
  .amap-demo {
    height: 600px;
  }

  .search-box {
    position: absolute;
    top: 25px;
    left: 20px;
  }
</style>
