<template>
  <div class="selector-container">
    <el-dialog :title="title" :visible.sync="visible" width="512px" center>
      <el-input v-model="imageQuery.params.name" placeholder="请输入内容" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="searchImages" />
      </el-input>
      <div class="demo-image__lazy" :style="{height:viewHeight}">
        <ul class="el-image-list">
          <li v-for="image in imageList" :key="image.path" :class="{'is-success':value===image.path}" class="el-image-list__item" :style="{height:imageHeight}" @click="selectImage(image)">
            <label class="el-image-list__item-status-label">
              <i class="el-icon-upload-success el-icon-check" />
            </label>
            <el-image :src="image.path" lazy />
          </li>
        </ul>
        <p v-if="!noMore" align="center"><el-button type="text" @click="loadImages">加载更多</el-button></p>
        <p v-if="noMore" align="center">没有更多了</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关 闭</el-button>
        <!--<el-button type="primary" @click="deleteRow">确 定</el-button>-->
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { searchImage } from '@/api/wiki/image-info'

export default {
  name: 'ImageSelector',
  props: {
    title: {
      type: String,
      default: '图片选择'
    },
    show: Boolean,
    viewHeight: {
      type: String,
      default: '400px'
    },
    imageHeight: {
      type: String,
      default: '180px'
    },
    type: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // visible: false,
      imageList: [],
      imageQuery: {
        page: 1,
        limit: 5,
        total: 0,
        params: {}
      },
      noMore: false
    }
  },
  computed: {
    visible: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      }
    }
  },
  mounted() {
    this.getImageList()
  },
  methods: {
    getImageList() {
      this.loading = true
      this.imageQuery.params = Object.assign({}, this.imageQuery.params, { srcType: this.type })
      searchImage(this.imageQuery).then(response => {
        if (this.imageQuery.page === 1) {
          this.imageList = response.rows
        } else {
          this.imageList = this.imageList.concat(response.rows)
        }
        this.imageQuery.total = response.total
        this.noMore = this.imageQuery.page * this.imageQuery.limit > this.imageQuery.total
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    loadImages() {
      if (this.imageQuery.page * this.imageQuery.limit > this.imageQuery.total) {
        this.$message.warning('已加载到后一页！')
        return
      }
      this.imageQuery.page++
      this.getImageList()
    },
    searchImages() {
      this.imageList = []
      this.imageQuery.page = 1
      this.getImageList()
    },
    selectImage(row) {
      this.$emit('input', row.path)
    }
  }
}
</script>

<style scoped>
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}

.demo-image__lazy {
  height: 400px;
  overflow-y: auto;
}

.demo-image__lazy .el-image {
  display: block;
  height: 100%;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
}

.el-image-list__item {
  transition: all .5s cubic-bezier(.55, 0, .1, 1);
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-top: 5px;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
}

.el-image-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.el-image-list .el-image-list__item {
  overflow: hidden;
  z-index: 0;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 15px 15px 15px 15px;
  height: 213px;
}

.el-image-list__item:first-child {
  margin-top: 10px;
}

.el-image-list__item-status-label {
  position: absolute;
  right: 5px;
  top: 0;
  line-height: inherit;
  display: none;
}

.el-image-list .el-image-list__item-status-label {
  position: absolute;
  right: -17px;
  top: -7px;
  width: 46px;
  height: 26px;
  background: #13ce66;
  text-align: center;
  transform: rotate(45deg);
  box-shadow: 0 1px 1px #ccc;
}

.el-image-list__item.is-success .el-image-list__item-status-label {
  display: block;
}

.el-image-list .el-image-list__item .el-icon-check, .el-image-list .el-image-list__item .el-icon-circle-check {
  color: #fff;
}

.el-image-list .el-image-list__item-status-label i {
  font-size: 12px;
  margin-top: 12px;
  transform: rotate(-45deg);
}

.el-image-list__item .el-icon-upload-success {
  color: #67c23a;
}
</style>
