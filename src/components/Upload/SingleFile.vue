<template>
  <div class="upload-container">
    <el-upload
      ref="uploader"
      name="files[]"
      :headers="headers"
      :data="data"
      :multiple="false"
      :show-file-list="false"
      :on-success="uploadSuccess"
      class="image-uploader"
      drag
      :action="url"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
    <div v-show="showPreview" class="image-preview">
      <div v-show="tempUrl.length>1" class="image-preview-wrapper">
        <img :src="tempUrl+'?imageView2/1/w/100/h/200'">
        <div class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'SingleFileUpload',
  props: {
    url: {
      type: String,
      default: '/api/wiki/admin/upload'
    },
    value: {
      type: String,
      default: ''
    },
    showPreview: {
      type: Boolean,
      default: false
    },
    'data': {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      tempUrl: ''
    }
  },
  computed: {
    headers() {
      return { 'X-Token': getToken() }
    },
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
    uploadSuccess(resp, file, fileList) {
      if (resp.success && resp.rows.length > 0) {
        this.$refs.uploader.clearFiles()
        this.emitInput(resp.rows[0].url)
      }
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
            width: 60%;
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
    }

</style>
