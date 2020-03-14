<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.params.clusterName" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.params.status" placeholder="状态" class="filter-item" clearable>
        <el-option label="启用" value="1">启用</el-option>
        <el-option label="禁用" value="0">禁用</el-option>
      </el-select>
      <el-button v-if="checkPermission2(['WIKI_BOOKMARK_SEARCH'])" class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        查询
      </el-button>
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="listQuery.params = {}">
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
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="mark" label="标签" width="150">
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
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-link v-if="checkPermission2(['WIKI_BOOKMARK_EDIT'])" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row, scope.$index)">编辑</el-link>
          <el-link v-if="checkPermission2(['WIKI_BOOKMARK_DELETE'])" type="danger" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit 集群':'New 集群'">
      <el-form :model="record" label-width="100px" label-position="left">
        <el-form-item label="集群名称">
          <el-input v-model="record.clusterName" placeholder="集群名称" :disabled="dialogCodeEdit" />
        </el-form-item>
        <el-form-item label="zookeeper">
          <el-input v-model="record.zookeeper" placeholder="zookeeper" />
        </el-form-item>
        <el-form-item label="brokers">
          <el-input v-model="record.brokers" placeholder="brokers" :disabled="true" />
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

const defaultRecord = { sort: 1, status: '1' }

export default {
  name: 'KafkaClusterManager',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      let s = 'draft'
      if (status === '1') {
        s = 'published'
      } else if (status === '3') {
        s = 'deleted'
      }
      return statusMap[s]
    }
  },
  data() {
    return {
      record: Object.assign({}, defaultRecord),
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        list: [],
        params: {}
      },
      loading: { handleSubmit: false },
      recordRoles: [],
      dialogVisible: false,
      dialogType: false,
      dialogCodeEdit: false,
      dialogVisible2: false,
      roles: []
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
      })
    },
    handleAdd() {
      this.record = Object.assign({}, defaultRecord)
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogCodeEdit = false
    },
    handleEdit(row) {
      this.record = deepClone(row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.dialogCodeEdit = true
    },
    handleDel(row) {
      const _this = this
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await delBookmark(row.id)
          _this.getList()
          this.$message({
            type: 'success',
            message: 'Delete success!'
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
        opName = '修改'
        resp = await editBookmark(this.record.id, this.record).catch(() => { _this.loading.handleSubmit = false })
      }
      _this.loading.handleSubmit = false
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$notify({
          title: `${opName}集群名称 Success!`,
          dangerouslyUseHTMLString: true,
          message: `
            <div>集群名称: ${this.record.clusterName}</div>
          `,
          type: 'success'
        })
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
