<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery.params" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.params.status" placeholder="全部" clearable>
            <el-option key="status0" label="连载中" value="0" />
            <el-option key="status1" label="已完结" value="1" />
            <el-option key="status3" label="已中止" value="3" />
            <el-option key="status4" label="已停更" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="listQuery.params.type" placeholder="全部" clearable>
            <el-option key="type1" label="小说" value="1" />
            <el-option key="type2" label="漫画" value="2" />
            <el-option key="type3" label="视频" value="3" />
            <el-option key="type4" label="文章" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button v-if="checkPermission2(['WIKI_BOOKMARK_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = { status: '0', type: '2' }">
        重置
      </el-button>
      <el-button v-if="checkPermission2(['WIKI_BOOKMARK_ADD'])" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAdd">
        创建书签
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="listQuery.list" border fit highlight-current-row style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="type" label="类型" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.type === '1'">小说</span>
          <span v-if="scope.row.type === '2'">漫画</span>
          <span v-if="scope.row.type === '3'">视频</span>
          <span v-if="scope.row.type === '4'">文章</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="mark" label="标签">
        <template slot-scope="scope">
          <el-link v-if="scope.row.href" type="success" :href="scope.row.href" target="_blank">
            {{ scope.row.mark }}
          </el-link>
          <el-tag v-else type="default">{{ scope.row.mark }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="markAt" label="标签日期" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.markAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'">连载中</span>
          <span v-if="scope.row.status === '1'">已完结</span>
          <!--<span v-if="scope.row.status === '2'">漫画</span>-->
          <span v-if="scope.row.status === '3'">已中止</span>
          <span v-if="scope.row.status === '4'">已停更</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-link v-if="checkPermission2(['WIKI_BOOKMARK_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['WIKI_BOOKMARK_DEL'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑书签':'创建书签'">
      <el-form ref="recordForm" :model="record" label-width="100px">
        <el-form-item label="类型">
          <el-radio-group v-model="record.type">
            <el-radio-button label="1">小说</el-radio-button>
            <el-radio-button label="2">漫画</el-radio-button>
            <el-radio-button label="3">视频</el-radio-button>
            <el-radio-button label="4">文章</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <el-form-item label="标签" prop="mark">
          <el-input v-model="record.mark" />
        </el-form-item>
        <el-form-item label="链接" prop="href">
          <el-input v-model="record.href" />
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker v-model="record.currMarkAt" type="datetime" placeholder="选择日期" value-format="timestamp" />
          <span v-if="record.lastMarkAt" class="form-item-desc">
            <el-checkbox v-model="unmark">不更新（上次时间：{{ record.lastMarkAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}）</el-checkbox>
          </span>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="record.status" placeholder="书签状态">
            <el-option key="status0" label="连载中" value="0" />
            <el-option key="status1" label="已完结" value="1" />
            <el-option key="status3" label="已中止" value="3" />
            <el-option key="status4" label="已停更" value="4" />
          </el-select>
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
import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { listBookmark, addBookmark, editBookmark, delBookmark } from '@/api/wiki/bookmark'

const defaultRecord = { type: '2', status: '0' }

export default {
  name: 'WikiBookmarkManager',
  components: { Pagination },
  data() {
    return {
      record: Object.assign({}, defaultRecord),
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: { status: '0', type: '2' }
      },
      loading: { handleSubmit: false },
      recordRoles: [],
      dialogVisible: false,
      unmark: false,
      dialogType: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission2,
    getList() {
      this.listLoading = true
      listBookmark(this.listQuery).then(response => {
        this.listQuery.list = response.rows
        this.listQuery.total = response.total
        this.listLoading = false
      }).catch(() => { this.loading = false })
    },
    handleAdd() {
      this.record = Object.assign({}, defaultRecord)
      this.record.currMarkAt = new Date()
      this.record.lastMarkAt = ''

      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.record.lastMarkAt = this.record.markAt
      this.record.currMarkAt = new Date()

      this.dialogType = 'edit'
      this.dialogVisible = true
      this.unmark = false
    },
    handleDel(row) {
      const _this = this
      this.$confirm('是否确认删除书签，删除将不可恢复?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await delBookmark(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    async handleSubmit() {
      const _this = this
      let resp = null
      let opName = '添加'
      _this.loading.handleSubmit = true
      if (this.dialogType === 'new') {
        resp = await addBookmark(this.record).catch(() => { _this.loading.handleSubmit = false })
      } else if (this.dialogType === 'edit') {
        if (!this.unmark) {
          this.record.markAt = this.record.currMarkAt
        }
        opName = '修改'
        resp = await editBookmark(this.record.id, this.record).catch(() => { _this.loading.handleSubmit = false })
      }
      _this.loading.handleSubmit = false
      const ok = resp && resp.success
      this.$notify({
        title: `${opName} 书签 ${ok ? '成功' : '失败'}!`,
        dangerouslyUseHTMLString: true,
        message: `<div>书签: ${this.record.name}</div>`,
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
</style>
