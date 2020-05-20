<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<CategoryDropdown v-model="listQuery.categoryValues" type="4" placeholder="资源分类"/>-->
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
          <el-link v-if="checkPermission2(['WIKI_RESOURCES_FILE_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">分类</el-link>
          <a v-if="checkPermission2(['WIKI_RESOURCES_FILE_DOWNLOAD'])" class="el-link el-link--primary is-underline" :href="'/api/wiki/admin/resources/download/'+scope.row.id+'?token='+token" target="_blank">
            <i class="el-icon-download" />下载
          </a>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 编辑弹出框 -->
    <el-dialog title="编辑图片信息" :visible.sync="dialogVisible" width="50%">
      <el-form ref="baseForm" :model="record" label-width="100px">
        <el-form-item label="分类">
          <CategoryDropdown v-model="categoryValues" type="4" placeholder="资源分类" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="record.title" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="values.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择标签"
          >
            <el-option
              v-for="item in options.category"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图片路径" prop="url">
          <el-input v-model="record.url" disabled />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading.handleSubmit" type="primary" @click="handleSubmit">保存</el-button>
        <el-button :disabled="loading.handleSubmit" type="danger" @click="dialogVisible=false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { CategoryDropdown } from '../components/Dropdown'
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { listResourceInfo, editResourceInfo } from '@/api/wiki/files'

export default {
  name: 'WikiResourcesFilesManager',
  components: { Pagination, CategoryDropdown },
  data() {
    return {
      uploadUrl: '/api/wiki/admin/upload',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        categoryValues: [],
        params: {}
      },
      loading: { handleSubmit: false },
      record: {},
      uploadExt: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'chm', 'zip', 'rar', 'gz', 'tar'],
      uploadDrag: true,
      dialogVisible: false,
      categoryValues: [],
      options: { category: [] },
      values: { tags: [] }
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
      this.listQuery.params.categoryId = undefined
      if (this.listQuery.categoryValues.length > 0) {
        this.listQuery.params.categoryId = this.listQuery.categoryValues.join(',')
      }
      listResourceInfo(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
      }).finally(() => { this.listLoading = false })
    },
    imageUploadSuccess(rows) {
      this.getList()
    },
    handleEdit(row, index) {
      // const item = this.baseTable.rows[index];
      this.record = deepClone(row)
      this.categoryValues = []
      if (this.record.categoryId) {
        this.categoryValues = this.record.categoryId.split(',')
      }

      this.dialogVisible = true
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      this.loading.handleSubmit = true
      if (this.categoryValues.length > 0) {
        this.record.categoryId = this.categoryValues.join(',')
      }
      // const data = { name: this.record.name, category: this.record.category, tag: this.record.tag };
      resp = await editResourceInfo(this.record.id, this.record).finally(() => {
        _this.loading.handleSubmit = false
      })

      const ok = resp && resp.success
      this.$notify({
        title: `修改 资源信息 ${ok ? '成功' : '失败'}!`,
        dangerouslyUseHTMLString: true,
        message: `<div>图片: ${this.record.title}</div>`,
        type: ok ? 'success' : 'error'
      })
      if (ok) {
        this.dialogVisible = false
        _this.getList()
      }
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
