<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.title" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.type" placeholder="资源类型" class="filter-item" clearable>
        <el-option label="文档" value="0">文档</el-option>
        <el-option label="工具" value="1">工具</el-option>
        <el-option label="代码" value="2">代码</el-option>
        <el-option label="其他" value="3">其他</el-option>
      </el-select>
      <el-button v-if="checkPermission2(['WIKI_RESOURCES_FILE_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <!--<editor-image class="editor-upload-btn filter-item" color="#1890ff" size="" url="/api/wiki/admin/upload/img" :data="{srcType: 'images', type: 'image'}" @successCBK="imageUploadSuccess" />-->
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="分类">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryName }}</span>
        </template>
      </el-table-column><el-table-column label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center" label="上传时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <a v-if="checkPermission2(['WIKI_RESOURCES_FILE_DOWNLOAD'])" class="el-link el-link--primary is-underline" :href="'/api/wiki/admin/resources/download/'+scope.row.id+'?token='+token" target="_blank">下载</a>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import EditorImage from '@/components/Upload/MultiImage'
// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { list } from '@/api/wiki/files'

export default {
  name: 'WikiResourcesFilesManager',
  components: { Pagination/*, EditorImage*/ },
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
