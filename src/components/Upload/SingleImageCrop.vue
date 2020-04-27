<template>
  <div class="upload-container">
    <div class="image-preview image-app-preview" :style="{height:height,width:width}">
      <div class="ad-img-uploader">
        <img v-if="imageUrl.length>1" :src="imageUrl" width="100%" height="100%">
        <i v-else class="el-icon-plus ad-uploader-icon" @click="openUploadImg" />
        <div v-if="imageUrl.length>1" class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage" />
        </div>
      </div>
    </div>
    <!-- 引用el的dialog弹框组件，默认data中设置croppaVisible=true -->
    <el-dialog :title="title" :visible.sync="cropDialogVisible" :width="'60%'">
      <el-row>
        <el-col :span="15">
          <div>
            <VueCropper
              ref="cropper"
              alt="请选择图片！"
              :view-mode="2"
              :aspect-ratio="ratio"
              :src="cropperOptions.img"
              :preview="cropperOptions.preview"
              :img-style="{ 'width': '400px', 'height': '300px' }"
            />
          </div>
        </el-col>
        <el-col :span="8" :offset="1">
          <div class="img-preview ad-avatar" />
        </el-col>
      </el-row>
      <div slot="footer" class="footer-btn dialog-footer">
        <el-row class="align-center">
          <el-col :span="15">
            <div class="scope-btn">
              <label class="btn" for="uploads">更换图片</label>
              <input id="uploads" type="file" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="setImage">
              <el-button @click="changeScale(0.1)">+</el-button>
              <el-button @click="changeScale(-0.1)">-</el-button>
              <el-button @click="changeRotate(-90)">↺</el-button>
              <el-button @click="changeRotate(90)">↻</el-button>
            </div>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="uploadImg">裁剪并上传<i class="el-icon-upload el-icon--right" />
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { uploadCropImage } from '@/api/wiki/upload'
import { isEmpty } from '@/utils/validate'

import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'

const imgCloud = require('@/assets/0_images/0_cloud1.png') // 裁剪图片的地址

export default {
  name: 'SingleImageUpload6',
  components: { VueCropper },
  props: {
    title: {
      type: String,
      default: '图片裁剪'
    },
    width: {
      type: String,
      default: '320px'
    },
    height: {
      type: String,
      default: '180px'
    },
    value: {
      type: String,
      default: ''
    },
    ratio: {
      type: Number,
      default: 1.8
    },
    'data': {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      tempUrl: '',
      dataObj: { type: 'image', srcType: '' },
      cropDialogVisible: false,
      cropperOptions: {
        fileName: '', // 裁剪图片的地址
        img: '', // 裁剪图片的地址
        info: true, // 裁剪框的大小信息
        ratio: 1.8,
        outputSize: 0.8, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        // autoCropWidth: 300, // 默认生成截图框宽度
        // autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true, // 固定截图框大小 不允许改变
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [7, 5], // 截图框的宽高比例
        full: true, // 是否输出原图比例的截图
        canMoveBox: false, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        preview: '.ad-avatar'
      }
    }
  },
  computed: {
    imageUrl() {
      return this.value
    }
  },
  methods: {
    rmImage() {
      this.emitInput('')
    },
    emitInput(val) {
      this.$emit('input', val)
    },
    setImage(e) {
      const file = e.target.files[0]
      if (!file.type.includes('image/')) {
        this.$message.error('Please select an image file')
        return
      }
      this.cropperOptions.fileName = file.name
      if (typeof FileReader === 'function') {
        const reader = new FileReader()
        reader.onload = (event) => {
          // this.imgSrc = event.target.result
          // rebuild cropperjs with the updated source
          this.$refs.cropper.replace(event.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        this.$message.error('Sorry, FileReader API not supported')
      }
    },
    changeScale(ratio) {
      this.$refs.cropper.relativeZoom(ratio)
    },
    changeRotate(degree) {
      this.$refs.cropper.rotate(degree)
    },
    openUploadImg() {
      this.cropDialogVisible = true
      let isChange = true
      if (isEmpty(this.value)) {
        this.cropperOptions.img = imgCloud
      } else {
        isChange = this.cropperOptions.img !== this.value
        this.cropperOptions.img = this.value
      }
      if (isChange && this.$refs.cropper) {
        this.$refs.cropper.replace(this.cropperOptions.img)
      }
    },
    uploadImg() {
      if (isEmpty(this.cropperOptions.fileName)) {
        this.$message.warning('请选择图片...')
        return
      }
      const _this = this
      // 输出
      const _data = this.$refs.cropper.getData((data) => {
      })
      _data.fileName = this.cropperOptions.fileName
      // Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`
      this.$refs.cropper.getCroppedCanvas().toBlob((blob) => {
        const params = Object.assign({}, _data, this.dataObj, this.data)
        uploadCropImage(params, blob).then((resp) => {
          if (resp.success) {
            _this.cropDialogVisible = false
            _this.cropperOptions.fileName = ''
            // _this.$refs.cropper.replace(imgAd)
            _this.$message.success('上传成功！')
            this.emitInput(resp.rows[0].url)
          } else {
            _this.$message.error('上传失败！')
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
.upload-container {
  width: 100%;
  position: relative;
  @include clearfix;
  .image-uploader {
    width: 35%;
    float: left;
  }
  .image-preview {
    width: 200px;
    height: 200px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    margin-left: 50px;
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .image-preview-action {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, .5);
      transition: opacity .3s;
      cursor: pointer;
      text-align: center;
      line-height: 200px;
      .el-icon-delete {
        font-size: 36px;
      }
    }
    &:hover {
      .image-preview-action {
        opacity: 1;
      }
    }
  }
  .image-app-preview {
    width: 320px;
    height: 180px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    margin-left: 50px;
    .app-fake-conver {
      height: 44px;
      position: absolute;
      width: 100%; // background: rgba(0, 0, 0, .1);
      text-align: center;
      line-height: 64px;
      color: #fff;
    }
  }

  .btn {
    outline: none;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500;
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 3px;
    color: #fff;
    background-color: #67c23a;
    border-color: #67c23a;
  }

  .pic__space{
    /*display: none;*/
  }
  .ad-avatar {
    /*margin-left: 10px;*/
    /*border: 1px solid #eff2f6;*/
    width: 250px;
    height: 150px;
  }

  .img-preview {
    float: left;
    margin-top: 15px;
    margin-right: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    background-color: #fff;
    overflow: hidden;
  }

  .avatar {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 6px;
    /*background-image: url("/static/img/img.jpg");*/
    border: 0;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .ad-img-uploader {
  }
  .ad-img-uploader .ad-img {
    width: 100%;
    height: 100%;
    /*width: 24rem;*/
    /*height: 10rem;*/
  }

  .ad-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

}
</style>
