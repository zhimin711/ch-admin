<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.originalName" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.srcType" placeholder="图片来源" class="filter-item" clearable>
        <el-option label="PUBLIC" value="PUBLIC">公共</el-option>
        <el-option label="AVATAR" value="AVATAR">头像</el-option>
        <el-option label="AVATAR_CROP" value="AVATAR_CROP">头像_裁剪</el-option>
        <el-option label="ARTICLE" value="ARTICLE">文章</el-option>
        <el-option label="ARTICLE_CROP" value="ARTICLE_CROP">文章_裁剪</el-option>
        <el-option label="ARTICLE_COVER" value="ARTICLE_COVER">文章_缩略图</el-option>
        <el-option label="ARTICLE_COVER_CROP" value="ARTICLE_COVER_CROP">文章_缩略图_裁剪</el-option>
        <el-option label="CLASSIFY_COVER" value="CLASSIFY_COVER">分类图</el-option>
        <el-option label="AD" value="AD">广告</el-option>
        <el-option label="AD_CROP" value="AD_CROP">广告_裁剪</el-option>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
        重置
      </el-button>
      <editor-image class="editor-upload-btn filter-item" color="#1890ff" size="" url="/api/wiki/admin/upload/img" :data="{srcType: 'images', type: 'image'}" @successCBK="imageUploadSuccess" />

      <el-button v-permission="['WIKI_AD_IMAGE_BATCH_EDIT']" class="filter-item" type="default" icon="el-icon-edit-outline" @click="handleEditBatch">
        批量分类
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="名称" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预览">
        <template slot-scope="scope">
          <el-image :src="scope.row.path | addToken('wiki')" :fit="'scale-down'" style="width: 100%; height: 180px">
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
      <el-table-column label="分类" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.srcType }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-link v-if="checkPermission2(['WIKI_AD_IMAGE_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">分类</el-link>
          <!--<el-link v-if="checkPermission2(['WIKI_AD_IMAGE_EDIT'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 编辑弹出框 -->
    <el-dialog :title="(isBatchEdit?'批量':'')+'编辑图片信息'" :visible.sync="dialogVisible" width="50%">
      <el-form ref="baseForm" :model="record" label-width="100px">
        <el-form-item label="分类">
          <CategoryDropdown v-model="categoryValues" type="36" placeholder="图片分类" />
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
        <el-form-item label="状态">
          <el-select v-model="record.status">
            <el-option key="1" label="生效" value="1" />
            <el-option key="0" label="失效" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isBatchEdit" label="名称">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item v-if="!isBatchEdit" label="图片路径" prop="path">
          <el-input v-model="record.path" disabled />
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
import EditorImage from '@/components/Upload/MultiImage'
import { CategoryDropdown } from '../components/Dropdown'

import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { listImage, editImage, batchEditImage } from '@/api/wiki/images'

export default {
  name: 'WikiImages',
  components: { Pagination, EditorImage, CategoryDropdown },
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
      multipleSelection: [],
      loading: { handleSubmit: false },
      record: {},
      uploadExt: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'chm', 'zip', 'rar', 'gz', 'tar'],
      uploadDrag: true,
      isBatchEdit: false,
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
      listImage(this.listQuery).then(response => {
        if (response.success) {
          this.listQuery.list = response.rows
          this.listQuery.total = response.total
        }
      }).finally(() => { this.listLoading = false })
    },
    imageUploadSuccess(rows) {
      this.getList()
    },
    handleEdit(row, index) {
      // const item = this.baseTable.rows[index];
      this.record = deepClone(row)
      this.categoryValues = []
      if (this.record.category) {
        this.categoryValues = this.record.category.split(',')
      }
      this.isBatchEdit = false
      this.dialogVisible = true
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      if (this.categoryValues.length > 0) {
        this.record.category = this.categoryValues.join(',')
      }
      // const data = { name: this.record.name, category: this.record.category, tag: this.record.tag };

      this.loading.handleSubmit = true
      if (this.isBatchEdit) {
        this.record.ids = this.multipleSelection.map((row) => { return row.id })
        resp = await batchEditImage(this.record).finally(() => {
          _this.loading.handleSubmit = false
        })
      } else {
        resp = await editImage(this.record.id, this.record).finally(() => {
          _this.loading.handleSubmit = false
        })
      }

      const ok = resp && resp.success
      const msg = this.isBatchEdit ? '批量' : `图片: ${this.record.name}`
      this.$notify({
        title: `修改 图片信息 ${ok ? '成功' : '失败'}!`,
        dangerouslyUseHTMLString: true,
        message: `<div>${msg}</div>`,
        type: ok ? 'success' : 'error'
      })
      if (ok) {
        this.dialogVisible = false
        _this.getList()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleEditBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择图片！')
        return
      }
      this.record = { status: '1' }
      this.categoryValues = []
      this.isBatchEdit = true
      this.dialogVisible = true
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
