<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.originalName" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.fileType" placeholder="文件类型" class="filter-item" clearable>
        <el-option label="doc" value=".doc">doc</el-option>
        <el-option label="docx" value=".docx">docx</el-option>
        <el-option label="gif" value=".gif">gif</el-option>
        <el-option label="jpg" value=".jpg">jpg</el-option>
        <el-option label="pdf" value=".pdf">pdf</el-option>
        <el-option label="png" value=".png">png</el-option>
        <el-option label="pptx" value=".pptx">pptx</el-option>
        <el-option label="txt" value=".txt">txt</el-option>
        <el-option label="zip" value=".zip">zip</el-option>
        <el-option label="rar" value=".rar">rar</el-option>
      </el-select>
      <el-button v-if="checkPermission2(['WIKI_UPLOAD_FILE_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['WIKI_UPLOAD_FILE'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="handleAdd">
        上传文件
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="文件路径">
        <template slot-scope="scope">
          <span>{{ scope.row.filePath }}</span>
        </template>
      </el-table-column> <el-table-column label="文件名">
        <template slot-scope="scope">
          <span>{{ scope.row.originalName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件类型" width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.fileType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center" label="上传时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-link v-if="checkPermission2(['KAFKA_CLUSTER_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['KAFKA_CLUSTER_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>-->
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="'上传文件'">
      <el-form :model="record" label-width="100px" label-position="left">
        <!--<el-form-item label="名称">
          <el-input v-model="record.fileName" placeholder="文件名称(默认为文件名)" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="record.version" placeholder="版本(默认：1.0.0)" />
        </el-form-item>-->
        <el-form-item label="文件">
          <el-upload
            ref="uploader"
            name="files[]"
            class="upload-doc"
            list-type="text"
            :auto-upload="false"
            :multiple="false"
            :limit="1"
            :headers="headers"
            :data="uploadParams"
            :drag="uploadDrag"
            :action="uploadUrl"
            :file-list="uploadList"
            :on-remove="uploadRemove"
            :on-change="uploadChange"
            :on-error="uploadError"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只允许上传<span style="color: #F56C6C">单个</span>文档或压缩文件，且不超过50M</div>
            <!--<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
          </el-upload>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button :loading="loading.handleSubmit" type="primary" @click="handleSubmit">上传</el-button>
        <el-button :disabled="loading.handleSubmit" type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list } from '@/api/wiki/upload-record'

export default {
  name: 'WikiUploadRecordManager',
  components: { Pagination },
  data() {
    return {
      uploadUrl: '/api/wiki/admin/upload',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      loading: { handleSubmit: false },
      record: {},
      uploadParams: { type: '1' },
      dialogVisible: false,
      dialogType: false,
      uploadList: [],
      uploadExt: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'chm', 'zip', 'rar', 'gz', 'tar'],
      uploadDrag: true
    }
  },
  computed: {
    ...mapGetters([
      'token'
    ]),
    headers() {
      return {
        'X-Token': `${this.token}`
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission2,
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
      }).finally(() => { this.listLoading = false })
    },
    handleAdd() {
      this.record = {}
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    beforeUpload(file) {
      const fileName = file.name
      const ext = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()

      let isAllow = false
      for (let i = 0; i < this.uploadExt.length; i++) {
        if (ext === this.uploadExt[i]) {
          isAllow = true
          break
        }
      }
      if (!isAllow) {
        this.$message.error('只允许文档或压缩包格式!')
        return false
      }
      // var isJPG = file.type === 'image/jpeg';

      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        this.$message.error('文件大小不能超过 50MB!')
        return false
      }
      this.loading.handleSubmit = true
      return true
    },
    uploadSuccess(response, file, fileList) {
      this.loading.handleSubmit = false
      if (response.success) {
        this.dialogVisible = false
        this.$refs.uploader.clearFiles()
        this.getList()
      }
    },
    uploadRemove(file, fileList) {
      // const _this = this
      // this.uploadDrag = true
    },
    uploadChange(file, fileList) {
      // this.uploadDrag = false
      // const fileName = file.name
      // this.record.fileName = fileName.slice(0, fileName.lastIndexOf('.'))
      // debugger
    },
    uploadError(resp) {
      console.log(resp)
      //
    },
    handleSubmit() {
      this.$refs.uploader.submit()
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
</style>
