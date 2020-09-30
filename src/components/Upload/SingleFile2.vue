<template>
  <div class="upload-container">
    <el-upload
      ref="uploader"
      name="file"
      :headers="headers"
      :data="data"
      :multiple="false"
      :show-file-list="false"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      class="image-uploader"
      drag
      :action="url"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
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
    }
  },
  methods: {
    resetValue() {
      this.emitInput('')
    },
    setValue(val) {
      this.$emit('input', val)
    },
    uploadSuccess(resp, file, fileList) {
      if (resp) {
        this.$refs.uploader.clearFiles()
        this.$emit('success', resp)
      }
    },
    uploadError(resp) {
      this.$emit('error', resp)
    }
  }
}
</script>

<style lang="scss" scoped>
    @import "~@/styles/mixin.scss";
</style>
