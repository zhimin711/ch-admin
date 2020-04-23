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
      <editor-image class="editor-upload-btn filter-item" color="#1890ff" size="" url="/api/wiki/admin/upload/img" :data="{srcType: 'images', type: 'image'}" @successCBK="imageUploadSuccess" />
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预览">
        <template slot-scope="scope">
          <el-image :src="scope.row.path" :fit="'scale-down'" style="width: 100%; height: 180px">
            <div slot="placeholder" class="image-slot">
              加载中<span class="dot">...</span>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="相对路径">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import EditorImage from '@/components/Upload/MultiImage'
// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list } from '@/api/wiki/images'

export default {
  name: 'WikiResourcesImagesManager',
  components: { Pagination, EditorImage },
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
    imageUploadSuccess(rows) {
      this.getList()
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

.editor-upload-btn {
  display: inline-block;
}
</style>
