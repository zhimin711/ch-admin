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

          <el-col :span="24">
            <el-tabs v-if="params.topicName" v-model="activeConf" type="card" editable @tab-click="selectConf" @tab-add="handleAddMock" @tab-remove="handleDelMock">
              <el-tab-pane v-for="(item, index) in confs" :key="item.id" :label="'配置 ' + (index+1) + (item.description ? ' [' + item.description + ']' : '')" :name="item.id + ''">
                <el-col :span="12">
                  <el-form-item label="配置名称">
                    <el-input v-model="params.description" />
                  </el-form-item>
                </el-col>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
        <el-row>
          <!--<el-col :span="12">
            <el-form-item label="上传间隔（分钟）">
              <el-input-number v-model="params.batchSize" :min="1" :max="100" />
            </el-form-item>
          </el-col>-->
          <el-col :span="12">
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
          <el-button type="text" size="small" icon="el-icon-place" @click="openMap">添加或修改轨迹</el-button>
          <span style="padding-left: 15px">至少两个轨迹点（始发 -> 目的）</span>
        </el-form-item>
        <el-table
          :data="mapPoints"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column width="80" type="index" label="序号" />
          <el-table-column prop="lng" label="经度" width="150" />
          <el-table-column prop="lat" label="纬度" width="150" />
          <el-table-column prop="addr" label="地址" />
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
                <el-select v-model="row.type" :disabled="row.typeNonEdit" placeholder="请选择" size="small" @change="changeRules(row)">
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
          <el-table-column prop="name" label="属性名称" width="120">
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
        <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="loadConf()">
          重置
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
    ><!--
      <div>
        <el-button type="primary" @click="addGPSPoint">确 定</el-button>
        <el-button type="success" @click="getMapLine">获取规划路径</el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </div>-->
      <div ref="mapContainer" class="amap-page-container">
        <el-amap-search-box class="search-box" :search-option="searchOption" :on-search-result="onSearchResult" />
        <el-amap vid="amap" class="amap-demo" :zoom="12" :center="mapCenter" :events="events">
          <el-amap-marker v-if="point" :position="point.pos" />
          <el-amap-marker v-for="marker in markers" :position="marker.pos" :icon="marker.icon" />
        </el-amap>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanGPSPoints">清空轨迹点</el-button>
        <el-button type="primary" @click="addGPSPoint(0)">设置为始发地</el-button>
        <el-button type="primary" @click="addGPSPoint(-1)">设置为目的地</el-button>
        <el-button type="primary" @click="addGPSPoint(1)">设置为经过点</el-button>
        <!--<el-button type="success" @click="getMapLine">获取规划路径</el-button>-->
        <!--<el-button type="success" @click="cutPic">截 图</el-button>-->
        <el-button type="success" @click="addGPSPoint2">确 认</el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
        <el-table
          :data="markers"
          style="width: 100%; margin-bottom: 10px;"
        >
          <el-table-column width="80" type="index" label="序号" />
          <el-table-column prop="lng" label="经度" width="150" />
          <el-table-column prop="lat" label="纬度" width="150" />
          <el-table-column prop="addr" label="地址" />
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="scope">
              <el-link type="danger" @click="handleDelGPSMark(scope.$index, scope.row)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { lazyAMapApiLoaderInstance } from 'vue-amap'

import { getClusters, getTopics } from '@/api/kafka/content'
import { searchMock, saveMock, doMockGPS, loadMock, deleteMock } from '@/api/kafka/mocker'

const objs = [
  {
    code: 'ts',
    type: 'java.util.Date',
    params: '',
    name: '轨迹时间',
    status: '9',
    clazzNonEdit: true,
    typeNonEdit: true,
    nameNonEdit: true,
    valNonEdit: true,
    nonDelete: true
  },
  {
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
  }
]
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
  name: 'KafkaGPSMock',
  data() {
    return {
      listLoading: false,
      dialogVisible: false,
      confs: [],
      activeConf: '',
      params: {
        clusterName: '',
        topicName: '',
        threadSize: 1,
        batchSize: 1
      },
      map: { a: 'a' },
      mapDriving: null,
      mapRouteLine: null,
      mapPoints: [],
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
          // console.log(o.getCenter())
          this.map = o
          o.getCity(result => {
            console.log(result)
          })
        },
        'moveend': () => {
        },
        'zoomchange': () => {
        },
        'click': (e) => {
          this.markPoint(e.lnglat.getLng(), e.lnglat.getLat())
        }
      },
      gpsDates: [],
      gpsPoints: [],
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
          { value: 'java.lang.Double', label: 'Double' },
          { value: 'java.util.Date', label: 'Date' },
          { value: 'java.lang.Boolean', label: 'Boolean' },
          { value: '{}', label: 'Object' },
          { value: 'java.lang.Long', label: 'Long' },
          { value: 'java.lang.Float', label: 'Float' },
          { value: 'java.lang.Short', label: 'Short' }
        ]
      },
      timer: '',
      dataURL: '',
      loadingIns: null
    }
  },
  created() {
    this.getClusters()
    this.initGPSData()
    this.initMap()
    const start = new Date()
    const end = new Date()
    start.setTime(start.getTime() - 3600 * 1000)
    this.gpsDates = [start, end]
  },
  mounted() {
  },
  methods: {
    selectConf(tab, event) {
      const row = { id: tab.name, clusterName: this.params.clusterName, topicName: this.params.topicName }
      this.loadConf(row)
    },
    loadConf(row) {
      const params2 = row || { id: this.activeConf, clusterName: this.params.clusterName, topicName: this.params.topicName }
      loadMock(params2).then(resp => {
        if (resp.success) {
          // this.params = Object.assign({}, row)
          const row = resp.rows[0]
          row.createAt = undefined
          row.updateAt = undefined
          this.params = Object.assign({}, row)
          if (this.params.id) this.params.id = 0
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
            this.subParams = []
            this.initGPSData()
          }
        }
      })
    }, handleAddMock() {
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
    onSearchResult(pois) {
      let latSum = 0
      let lngSum = 0
      if (pois.length > 0) {
        this.markPoint(pois[0].lng, pois[0].lat)
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
      // this.markers = []
      this.point = null
      // this.mapRouteLine.setPath([])
    },
    initMap() {
      const _this = this
      lazyAMapApiLoaderInstance.load().then(() => {
        _this.geoCoder = new AMap.Geocoder({
          // city: "010", //城市设为北京，默认：“全国”
          radius: 1000 // 范围，默认：500
        })
        _this.mapDriving = new AMap.Driving({
          policy: AMap.DrivingPolicy.LEAST_TIME, // 其它policy参数请参考 https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingPolicy
          ferry: 1, // 是否可以使用轮渡
          province: '粤' // 车牌省份的汉字缩写
        })

        _this.mapRouteLine = new AMap.Polyline({
          path: [],
          isOutline: true,
          outlineColor: '#ffeeee',
          borderWeight: 2,
          strokeWeight: 5,
          strokeColor: '#0091ff',
          lineJoin: 'round'
        })
      })
    },
    markPoint(lng, lat) {
      const mark = { pos: [lng, lat] }
      const _this = this
      this.geoCoder.getAddress(mark.pos, function(status, result) {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress
          if (address === '中华人民共和国') {
            _this.$message.warning('轨迹点无效，请重新选择轨迹点......')
          } else {
            mark.addr = address
            mark.lng = lng
            mark.lat = lat
            _this.point = mark
          }
        } else {
          console.error('根据经纬度查询地址失败')
        }
      })
    },
    addGPSPoint(op) {
      if (!this.point) {
        this.$message.warning('请选择轨迹点......')
        return
      } else if (this.markers.length === 0 && op !== 0) {
        this.$message.warning('请先设置始发点......')
        return
      }

      const mark = Object.assign({}, this.point)
      mark.type = op
      if (op === 0) {
        mark.icon = 'https://webapi.amap.com/theme/v1.3/markers/n/start.png'
        if (this.markers.length > 0) {
          if (this.markers[0].type === 0) {
            this.markers[0].icon = 'https://webapi.amap.com/theme/v1.3/markers/n/mid.png'
            this.markers[0].type = 1
          }
        }
        this.markers = [mark].concat(this.markers)
      } else if (op === -1) {
        mark.icon = 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'

        const em = this.markers.pop()

        if (em.type === -1) {
          em.type = 0
          em.icon = 'https://webapi.amap.com/theme/v1.3/markers/n/mid.png'
        }
        this.markers.push(em)
        this.markers.push(mark)
      } else {
        mark.icon = 'https://webapi.amap.com/theme/v1.3/markers/n/mid.png'
        const em = this.markers.pop()
        if (em.type !== -1) {
          this.markers.push(em)
        }
        this.markers.push(mark)
        if (em.type === -1) this.markers.push(em)
      }
      this.point = null
      if (this.markers.length > 1) this.getMapLine()
    },
    cleanGPSPoints() {
      this.markers = []
      this.mapRouteLine.setPath([])
    },
    addGPSPoint2() {
      this.dialogVisible = false
      this.mapPoints = Object.assign([], this.markers)
    },
    handleDelGPSMark(index, row) {
      this.markers.splice(index, 1)
      if (index === 0 && this.markers[0].type !== -1) {
        this.markers[0].icon = 'https://webapi.amap.com/theme/v1.3/markers/n/start.png'
        this.markers[0].type = 1
        console.log('reset start')
      } else if (this.markers[this.markers.length - 1].type !== -1 && this.markers[this.markers.length - 1].type !== 0) {
        this.markers[this.markers.length - 1].icon = 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
        this.markers[this.markers.length - 1].type = -1
        console.log('reset end')
      }
      if (this.markers.length > 1) {
        this.getMapLine()
      } else {
        this.mapRouteLine.setPath([])
      }
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
    getMapLine() {
      const _this = this
      if (this.markers.length < 2) {
        this.$message.error('轨迹点不足，请添加轨迹点......')
        return
      }
      const sp = new AMap.LngLat(this.markers[0].lng, this.markers[0].lat)
      const ep = new AMap.LngLat(this.markers[this.markers.length - 1].lng, this.markers[this.markers.length - 1].lat)
      const options = {
        waypoints: []
      }
      if (this.markers.length > 2) {
        for (let i = 1; i < this.markers.length - 1; i++) {
          options.waypoints.push(new AMap.LngLat(this.markers[i].lng, this.markers[i].lat))
        }
      }
      this.mapDriving.search(sp, ep, options, function(status, result) {
        // result即是对应的驾车导航信息，相关数据结构文档请参考 https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
        if (status === 'complete') {
          if (result.routes && result.routes.length) {
            // 绘制第一条路线，也可以按需求绘制其它几条路线
            _this.drawRoute(result.routes[0])
            console.log('绘制驾车路线完成')
          }
        } else {
          console.error('获取驾车数据失败：' + result)
        }
      })
    },
    drawRoute(route) {
      const path = this.parseRouteToPath(route)
      this.gpsPoints = path
      /* let routeLine = new AMap.Polyline({
        path: path,
        isOutline: true,
        outlineColor: '#ffeeee',
        borderWeight: 2,
        strokeWeight: 5,
        strokeColor: '#0091ff',
        lineJoin: 'round'
      })*/

      this.mapRouteLine.setPath(path)
      this.mapRouteLine.setMap(this.map)
    },
    parseRouteToPath(route) {
      const path = []

      for (let i = 0, l = route.steps.length; i < l; i++) {
        const step = route.steps[i]
        for (let j = 0, n = step.path.length; j < n; j++) {
          path.push(step.path[j])
        }
      }
      return path
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
      this.params.contentType = 'GPS'
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
      if (this.gpsPoints.length < 2) {
        this.$message.warning('至少2个轨迹点,请添重新选择添加轨迹点...')
        return
      }
      this.params.points = this.gpsPoints.map(e => {
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
    handleClusterChange(val) {
      this.params.topicName = ''
      this.options.topics = []
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
