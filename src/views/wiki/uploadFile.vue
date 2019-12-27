<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.clusterName" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-if="checkPermission2(['KAFKA_CLUSTER_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['KAFKA_CLUSTER_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload" @click="handleAdd">
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
        <el-form-item label="名称">
          <el-input v-model="record.fileName" placeholder="文件名称" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="record.version" placeholder="版本" />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            ref="uploader"
            name="file"
            class="upload-doc"
            list-type="text"
            :auto-upload="false"
            :multiple="false"
            :data="uploadParams"
            :drag="uploadDrag"
            :action="uploadUrl"
            :file-list="uploadList"
            :on-remove="uploadRemove"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能单个上传文档或压缩文件，且不超过50M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button :loading="loading.handleSubmit" type="primary" @click="handleSubmit">保存</el-button>
        <el-button :disabled="loading.handleSubmit" type="danger" @click="dialogVisible=false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list } from '@/api/wiki/upload-record'

export default {
  name: 'WikiUploadRecordManager',
  components: { Pagination },
  data() {
    return {
      uploadUrl: '',
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
      uploadParams: { token: '', key: '' },
      dialogVisible: false,
      dialogType: false,
      uploadList: [],
      uploadExt: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'chm', 'zip', 'rar', 'gz', 'tar'],
      uploadDrag: true
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
        this.listLoading = false
      })
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
      return true
    },
    uploadSuccess(row) {
      console.log('success')
    },
    uploadRemove(row) {
      // const _this = this
      /*this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await del(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
          })
        })
        .catch(err => { console.error(err) })*/
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
