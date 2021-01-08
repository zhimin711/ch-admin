<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({

        title: {
          text: 'Topic TOP 10'
        },
        tooltip: {},
        legend: {
          data: ['TotalMsg']
        },
        axisPointer: {
          type: 'shadow'
        },
        xAxis: {
          data: [],
          axisLabel: {
            inside: false,
            textStyle: {
              color: '#000000'
            },
            rotate: 0,
            interval: 0
          },
          axisTick: {
            show: true
          },
          axisLine: {
            show: true
          },
          z: 10
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          axisLabel: {
            formatter: function(value) {
              return value.toFixed(2)
            }
          },
          splitLine: {
            show: true
          }
        },
        series: [{
          name: 'TotalMsg',
          type: 'bar',
          data: []
        }]
      })
    },
    setOptions({ xData, yData } = {}) {
      this.chart.setOption({
        xAxis: {
          data: xData,
          axisLabel: {
            inside: false,
            textStyle: {
              color: '#000000'
            },
            rotate: 60,
            interval: 0
          },
          axisTick: {
            show: true
          },
          axisLine: {
            show: true
          },
          z: 10
        },
        series: [{
          name: 'TotalMsg',
          type: 'bar',
          data: yData
        }]
      })
    }
  }
}
</script>
