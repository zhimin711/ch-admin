<template>
  <div ref="viewContainer" class="view-container">
    <sticky :z-index="10" :class-name="'sub-navbar published'">
      <el-button v-loading="loading" type="warning" @click="getBookPreview">
        刷新
      </el-button>
    </sticky>
    <div class="demo-image__lazy" :style="{height:previewHeight, paddingLeft: padd, paddingRight: padd}">
      <el-image v-for="url in urls" :key="url" :src="url" lazy :style="{'min-height':imgHeight}" />
    </div>
  </div>

</template>

<script>
import Sticky from '@/components/Sticky' // 粘性header组件
import { getToken } from '@/utils/auth'
import { getBook } from '@/api/wiki/books'

export default {
  name: 'BookPreview',
  components: { Sticky },
  data() {
    return {
      id: -1,
      loading: true,
      previewHeight: '900px',
      imgHeight: '1000px',
      padd: '0px',
      urls: []
    }
  },
  created() {
    this.id = this.$route.params && this.$route.params.id
    this.imgHeight = (window.innerHeight - 150) + 'px'
    this.padd = window.innerWidth > 1200 ? (window.innerWidth / 100) + '%' : 0
    this.getBookPreview()
  },
  mounted() {
    this.previewHeight = (window.innerHeight - 135) + 'px'
    this.imgHeight = this.calcImageMinH() + 'px'
    this.padd = window.innerWidth > 1200 ? (window.innerWidth / 100) + '%' : 0
  },
  methods: {
    getBookPreview() {
      this.loading = true
      this.urls = []
      getBook(this.id).then((resp) => {
        if (resp.success) {
          //
          const len = resp.rows[0].latestChapter
          for (let i = 1; i <= len; i++) {
            this.urls.push('/api/wiki/admin' + resp.rows[0].latestChapterUrl + '/' + i + '.jpg?token=' + getToken())
          }
        }
      }).finally(() => { this.loading = false })
    },
    calcImageMinH() {
      const w = this.$refs.viewContainer.clientWidth
      let h = window.innerHeight - 150
      if (w / h < 0.7) {
        h = 0
      }
      return h
    }
  }
}
</script>

<style scoped>
  .view-container{
  }
  .demo-image__lazy {
    display:block;
    text-align: center;
    height: 800px;
    overflow-y: auto;
  }
  .demo-image__lazy .el-image {
    width: 100%;
    max-width: 900px;
    margin-bottom: 10px;
  }
</style>
