<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="search-form-inline">
        <el-form-item label="分类">
          <CategoryDropdown v-model="listQuery.categoryValues" type="37" placeholder="书箱分类" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="listQuery.param.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.param.status" clearable placeholder="全部">
            <el-option key="0" label="待同步" value="0" />
            <el-option key="1" label="连载中" value="1" />
            <el-option key="2" label="完成状态" value="2" />
            <el-option key="4" label="无内容" value="4" />
            <el-option key="-" label="正在同步" value="-" />
          </el-select>
        </el-form-item>
        <el-form-item label="章节或页数">
          <el-input-number v-model="listQuery.param.sort" controls-position="right" :min="10" :max="200" />
        </el-form-item>
        <el-form-item label="">
          <el-checkbox v-model="listQuery.param.inFavor">我的收藏</el-checkbox>
        </el-form-item>
      </el-form>
      <div class="handle-box">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="listQuery.param = {}">重置</el-button>
            <el-button v-permission="['WIKI_BOOKS_ADD']" type="primary" icon="el-icon-plus" class="handle-del mr10" @click="handleAdd()">新增</el-button>
            <el-button v-permission="['WIKI_BOOKS_ADD']" type="primary" icon="el-icon-refresh" class="handle-del mr10" @click="handleAdd(true)">批量同步书籍</el-button>
            <el-button v-permission="['WIKI_BOOKS_SYNC_BATCH']" type="primary" icon="el-icon-refresh" class="handle-del mr10" @click="openBatchSync()">批量同步内容</el-button>
            <!--<el-button type="primary" icon="el-icon-download" class="handle-del mr10">导出</el-button>-->
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="demo-image__placeholder">
      <div v-for="(item,index) in list" :key="item.id" class="block">
        <router-link
          v-if="(item.type === '2'||item.type === '3') && item.status === '2'"
          v-permission="'WikiBookRead'"
          :to="'/wiki/business/book/preview/'+item.id"
          class="el-link el-link--primary"
        >
          <el-image :src="convertImg(item)" :fit="'scale-down'" style="width: 100%; height: 180px" :title="item.title">
            <div slot="placeholder" class="image-slot">
              加载中<span class="dot">...</span>
            </div>
          </el-image>
        </router-link>
        <el-image v-else :src="convertImg(item)" :fit="'scale-down'" style="width: 100%; height: 180px" :title="item.title">
          <div slot="placeholder" class="image-slot">
            加载中<span class="dot">...</span>
          </div>
        </el-image>
        <div class="demonstration" :title="item.name">{{ item.name }}</div>
        <div class="demonstration">作者：{{ item.author || '-' }}</div>
        <div class="demonstration">更新：{{ item.latestChapterAt | parseTime('{y}-{m}-{d}') }}</div>
        <div v-if="item.srcType === '1'" class="demonstration">
          <el-link :href="item.latestChapterUrl" target="_blank">第三方链接</el-link>
        </div>
        <div class="align-center demonstration">
          <el-button-group v-if="item.status !== '3'">
            <el-button
              v-permission="'WIKI_BOOKS_EDIT'"
              size="mini"
              type="primary"
              icon="el-icon-edit"
              title="编辑"
              :disabled="item.status === '-'"
              @click="handleEdit(item,index)"
            />
            <el-button
              v-if="item.status !== '-' && item.srcType === '1'"
              v-permission="'WIKI_BOOKS_SYNC'"
              size="mini"
              icon="el-icon-refresh"
              title="同步"
              @click="handleSync(item)"
            />
            <el-button v-if="item.status === '-'" size="mini" type="info" icon="el-icon-loading" disabled title="正在同步..." />
            <!--<el-button
              size="mini"
              type="warning"
              icon="el-icon-finished"
              @click="handleSync(item)">
            </el-button>-->
            <el-button
              v-permission="'WikiBookDelete'"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              title="删除"
              :disabled="item.status === '-'"
              @click="handleEdit(index, item)"
            />
            <el-button
              size="mini"
              :type="item.inFavor?'warning':''"
              :icon="item.inFavor?'el-icon-star-on':'el-icon-star-off'"
              title="收藏"
              :disabled="item.status === '-'"
              @click="handleFavor(item)"
            />
          </el-button-group>
        </div>
      </div>
    </div>
    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" pre-text="<<上一页" next-text="下一页>>" @pagination="getList" />

    <!-- 编辑弹出框 -->
    <el-dialog :title="baseForm.title" :visible.sync="baseForm.visible">
      <el-form ref="baseForm" :model="record" label-width="100px" :disabled="baseForm.disabled">
        <!--<el-form-item label="是否有目录">
          <el-radio-group v-model="record.type" :disabled="baseForm.codeDisabled">
            <el-radio-button label="0">无</el-radio-button>
            <el-radio-button label="1">有</el-radio-button>
            <el-radio-button label="2">图片滚动</el-radio-button>
          </el-radio-group>
        </el-form-item>-->
        <el-form-item label="分类">
          <CategoryDropdown v-model="categoryValues" type="37" placeholder="书箱分类" />
        </el-form-item>
        <el-row v-if="!baseForm.isBatch">
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="record.name" />
            </el-form-item>
            <el-form-item label="作者" prop="author">
              <el-input v-model="record.author" />
            </el-form-item>
            <el-form-item label="摘要">
              <el-input
                v-model="record.summary"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 6}"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="来源">
          <el-radio-group v-model="record.srcType" :disabled="baseForm.srcTypeDisabled" @change="srcTypeChange">
            <el-radio-button label="0">导入</el-radio-button>
            <el-radio-button label="1">网络</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="baseForm.uploadShow" label="上传文件">
          <UploadSingleFile v-model="record.srcUrl" :data="{'type':'2'}" @success="uploadSuccess" />
        </el-form-item>
        <el-form-item
          v-if="record.srcType === '1' || (record.srcUrl && record.srcUrl.length>1)"
          :label="record.srcType === '1'?'来源地址':'上传文件'"
          prop="srcUrl"
        >
          <el-input v-model="record.srcUrl" :disabled="baseForm.srcUrlDisabled">
            <template v-if="baseForm.uploadDel">
              <el-button slot="append" icon="el-icon-delete" @click.prevent="removeUpload()">删除
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-row v-if="baseForm.isBatch">
          <el-col :span="24">
            <el-form-item label="同步页数" prop="readCount">
              <el-input-number v-model="record.readCount" placeholder="默认1页,-1全部" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button v-loading="loading" @click="resetForm('baseForm')">取 消</el-button>
        <el-button v-loading="loading" type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import UploadSingleFile from '@/components/Upload/SingleFile' // Secondary package based on el-pagination
import { CategoryDropdown } from '../../components/Dropdown'

// import { deepClone } from '@/utils'
import { isEmpty } from '@/utils/validate'
import { getToken } from '@/utils/auth'

import { fetchBookList, addBook, editBook, syncBook, syncBooks, batchSyncBooks, favorBook } from '@/api/wiki/books'
import { Loading } from 'element-ui'

const defaultRecord = {
  type: '1',
  srcType: '0',
  srcUrl: '',
  originalType: ''
}

export default {
  name: 'WikiBooks',
  components: { Pagination, CategoryDropdown, UploadSingleFile },
  data() {
    return {
      list: [],
      loading: false,
      loadingIns: null,
      listQuery: {
        page: 1,
        limit: 50,
        pageSizes: [2, 5, 10],
        total: 0,
        param: {},
        categoryValues: []
      },
      urls: { upload: '' },
      categoryValues: [],
      baseForm: {
        action: 'add',
        title: '新增',
        visible: false,
        disabled: false,
        codeDisabled: false,
        srcTypeDisabled: false,
        srcUrlDisabled: false,
        uploadShow: true,
        isBatch: false,
        uploadDel: false
      },
      batchForm: {
        visible: false
      },
      record: {}
    }
  },
  computed: {
    authHeader() {
      return {
        'Authorization': `Bearer ${this.$store.state.token}`
      }
    }, uploadParams() {
      return { type: '2', version: '1' }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })
      this.listQuery.param.classify = undefined
      if (this.listQuery.categoryValues.length > 0) {
        this.listQuery.param.classify = this.listQuery.categoryValues.join(',')
      }
      fetchBookList(this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.listQuery.total = resp.total
          if (resp.total > 0 && resp.rows.length === 0) {
            this.loadingIns.close()
            this.listQuery.page = 1
            this.getList()
          }
        }
      }).finally(() => { this.loadingIns.close() })
    },
    handleAdd(isBatch = false) {
      //
      this.record = Object.assign({}, defaultRecord)

      this.baseForm.action = isBatch ? 'sync' : 'add'
      this.baseForm.title = '新增'
      this.baseForm.visible = true
      this.baseForm.codeDisabled = false
      this.baseForm.srcTypeDisabled = false
      this.baseForm.isBatch = isBatch
      if (isBatch) {
        this.record.srcType = '1'
        this.baseForm.srcTypeDisabled = true
        this.baseForm.title = '同步第三方书籍'
      }
      this.categoryValues = []

      this.srcTypeChange(this.record.srcType)
    },
    handleEdit(row, index) {
      this.record = Object.assign({}, row)
      this.baseForm.action = 'edit'
      this.baseForm.title = '编辑'
      this.baseForm.visible = true
      this.baseForm.codeDisabled = true
      this.baseForm.srcTypeDisabled = false
      this.baseForm.isBatch = false
      this.baseForm.uploadShow = this.record.srcType === '0'
      this.baseForm.srcUrlDisabled = this.record.srcType === '0'
      this.categoryValues = []
      if (this.record.classify) {
        this.categoryValues = this.record.classify.split(',')
      }
    },
    async handleSubmit() {
      this.record.classify = undefined
      this.record.title = undefined
      if (this.categoryValues.length > 0) {
        this.record.classify = this.categoryValues.join(',')
      }
      this.loading = true
      let resp
      if (this.baseForm.action === 'add') {
        resp = await addBook(this.record).finally(() => { this.loading = false })
      } else if (this.baseForm.action === 'sync') {
        resp = await syncBooks(this.record).finally(() => { this.loading = false })
      } else {
        resp = await editBook(this.record.id, this.record).finally(() => { this.loading = false })
      }
      this.loading = false
      if (resp && resp.success) {
        this.baseForm.visible = false
        this.getList()
        this.$notify({
          title: '成功',
          message: `${this.baseForm.title}书籍成功`,
          type: 'success',
          duration: 2000
        })
      }
    },
    handleSync(row) {
      this.$confirm('此操作将更新此书所有章节内容, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.bookSync(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消同步'
        })
      })
    },
    bookSync(row) {
      this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })
      syncBook(row.id).then(resp => {
        if (resp.success) {
          row.status = '-'
          this.$notify({
            title: '同步',
            message: `正在同步《${row.name}》.....`,
            type: 'warning',
            duration: 2000
          })
          // this.getList()
        }
      }).finally(() => {
        this.loadingIns.close()
      })
    },
    handleFavor(row) {
      favorBook(row.id).then(resp => {
        if (resp.success) {
          row.inFavor = !row.inFavor
          this.$notify({
            title: '书籍收藏',
            message: `收藏《${row.name}》成功`,
            type: 'warning',
            duration: 2000
          })
          // this.getList()
        }
      }).finally(() => {
      })
    },
    openBatchSync() {
      this.$prompt('请输入要同步页数（使用列表查询）', '批量同步内容', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9]+$/,
        inputErrorMessage: '请输入数字'
      }).then(({ value }) => {
        this.handleBatchSync(value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消同步'
        })
      })
    },
    handleBatchSync(pages) {
      const param = { pageNum: this.listQuery.page, pageSize: this.listQuery.limit, pages: pages, search: true }
      param.rows = [this.listQuery.param]
      batchSyncBooks(param).then(resp => {})
    },
    resetForm() {
      //
      this.baseForm.visible = false
    },
    srcTypeChange(val) {
      const hasUrl = this.record.srcUrl && Object.keys(this.record.srcUrl).length > 0
      this.baseForm.uploadShow = true
      this.baseForm.srcUrlDisabled = true
      // this.record.srcUrl = '';
      if (val === '1') {
        // this.record.srcType = '0';
        if (this.record.originalType === '0' && hasUrl) {
          this.$confirm('此操作将删除已上传文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.removeUpload()
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消删除'
            })
            this.record.srcType = '0'
          })
        } else {
          this.baseForm.uploadShow = false
          this.baseForm.srcUrlDisabled = false
        }
      }
    },
    uploadSuccess(row) {
      if (isEmpty(this.record.name)) {
        // this.record.name = row.name
      }
    },
    removeUpload() {
      this.$axios.get(this.urls.uploadDel + '/' + this.record.latestChapterUrl).then((res) => {
        if (res.data.success) {
          this.$message.success('删除上传文件成功')
        } else {
          this.$message.error(`删除文件失败`)
        }
        this.record.srcUrl = ''
        this.record.latestChapterUrl = ''
        this.baseForm.uploadShow = true
        this.$refs.uploader.clearFiles()
      }).catch(res => {
        if (res.data && res.data.error && res.data.error !== '302') {
          this.$message.error(`删除文件失败`)
        }
      })
    },
    convertImg(item) {
      if (isEmpty(item.image)) {
        return ''
      }
      return item.image.indexOf('//') === 0 || item.image.indexOf('https://') === 0 || item.image.indexOf('http://') === 0 ? item.image : 'api/wiki/admin' + item.image + '?token=' + getToken()
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

.table {
  width: 100%;
  font-size: 14px;
}

.handle-box {
  margin-bottom: 10px;
}

.table .el-col {
  margin-bottom: 10px;
}

.el-image .el-image__inner {
  border-radius: 4px;
}

.el-dialog .block {
  border-right: 0px;
}

.description-img {
  display: block;
  text-align: center;
  margin-bottom: 10px;
}
.demo-image .block, .demo-image__error .block, .demo-image__placeholder .block {
  padding: 10px 0;
  text-align: center;
  border-right: 1px solid #eff2f6;
  display: inline-block;
  width: 20%;
  box-sizing: border-box;
  vertical-align: top;
}

.demonstration {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /*width:200px;*/
  margin: 10px 5px;
  text-align: left;
}
</style>
