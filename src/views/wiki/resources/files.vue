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
      <el-button v-if="checkPermission2(['WIKI_RESOURCES_FILE_BATCH_APPROVE'])" class="filter-item" type="primary" icon="el-icon-edit-outline" @click="handleEditBatch">
        审核（批量）
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分类" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.categoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.fileId }}</span>
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
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '1' && (scope.row.approveStatus === '0' || scope.row.approveStatus === null || scope.row.approveStatus === '2')" type="warning">
            待审核
          </el-tag>
          <el-tag v-else-if="scope.row.status === '1' && scope.row.approveStatus === '1'" type="success">审核通过
          </el-tag>
          <el-tag v-else-if="scope.row.status === '1' && scope.row.approveStatus === '4'" type="danger">审核驳回
          </el-tag>
          <el-tag v-else>
            草稿
          </el-tag>
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
    <el-dialog title="编辑资源信息" :visible.sync="dialogVisible" width="50%">
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
        <el-form-item label="资源路径" prop="url">
          <el-input v-model="record.url" disabled />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading.handleSubmit" type="primary" @click="handleSubmit">保存</el-button>
        <el-button :disabled="loading.handleSubmit" type="danger" @click="dialogVisible=false">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog title="资源审核" :visible.sync="approve.visible" :width="'50%'" center>
      <el-table :data="approve.data">
        <el-table-column property="categoryName" label="分类" width="150" />
        <el-table-column property="title" label="名称" />
        <el-table-column width="160px" align="center" label="上传时间">
          <template slot-scope="scope">
            <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="submitApprove(1)">通 过</el-button>
        <el-button type="danger" @click="submitApprove(2)">驳 回</el-button>
        <el-button @click="approve.visible = false">取 消</el-button>
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
import { listResourceInfo, editResourceInfo, batchApproveResource } from '@/api/wiki/files'

export default {
  name: 'WikiResources',
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
      multipleSelection: [],
      loading: { handleSubmit: false },
      record: {},
      uploadExt: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'chm', 'zip', 'rar', 'gz', 'tar'],
      uploadDrag: true,
      dialogVisible: false,
      categoryValues: [],
      options: { category: [] },
      values: { tags: [] },
      approve: { visible: false, data: [] }
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
      this.values.tags = []
      if (this.record.keywords) {
        this.values.tags = this.record.keywords.split(',')
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
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleEditBatch() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择待审核资源！')
        return
      }
      this.approve.data = []
      for (const i in this.multipleSelection) {
        const row = this.multipleSelection[i]
        if (row.status !== '1' || (row.approveStatus !== null && row.approveStatus !== '0' && row.approveStatus !== '2')) {
          this.$message.warning('选择资源包含非待审核状态！')
          return
        }
        this.approve.data.push({ id: row.id, categoryName: row.categoryName, title: row.title, createAt: row.createAt })
      }
      this.approve.visible = true
    },
    async submitApprove(op) {
      this.record.ids = this.approve.data.map((row) => { return row.id })
      this.record.status = op
      this.loading.handleSubmit = true
      await batchApproveResource(this.record).then(resp => {
        if (resp.success) {
          this.$message.success('审核成功！')
          this.getList()
        } else {
          this.$message.error('审核失败！数据变动，请刷新重试...')
        }
        this.approve.visible = false
      }).finally(() => {
        this.loading.handleSubmit = false
      })
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
