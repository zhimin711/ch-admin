<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.params.status" clearable placeholder="状态">
            <el-option key="1" label="启用" value="1" />
            <el-option key="2" label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="handle-box">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="listQuery.params = {}">重置</el-button>
            <el-button v-if="checkPermission2(['WIKI_BOOKS_ADD'])" type="primary" icon="el-icon-plus" class="handle-del mr10" @click="handleAdd">新增</el-button>
            <!--<el-button type="primary" icon="el-icon-download" class="handle-del mr10">导出</el-button>-->
          </el-col>
        </el-row>
      </div>
    </div>
    <el-table v-loading="loading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="title" label="类型" width="200" />
      <el-table-column prop="name" label="名称" width="200" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="description" label="标签" />
      <el-table-column prop="sort" label="排序" width="80" />

      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === '0'" type="primary">待开始</el-tag>
          <el-tag v-if="scope.row.status === '1'" type="success">进行中</el-tag>
          <el-tag v-if="scope.row.status === '2'" type="default">完成</el-tag>
          <el-tag v-if="scope.row.status === '3'" type="warning">暂停</el-tag>
          <el-tag v-if="scope.row.status === '4'" type="danger">停止</el-tag>
          <el-tag v-if="scope.row.status === '6'" type="success">同步完成</el-tag>
          <el-tag v-if="scope.row.status === 'x'" type="danger">已删除</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="latestChapterAt" label="最新更新时间" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.latestChapterAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" width="280" align="center">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-refresh" @click="bookSync(scope.row)">同步</el-button>
          <el-button type="text" icon="el-icon-edit" @click="baseEdit(scope.$index, scope.row)">编辑
          </el-button>
          <el-button type="text" icon="el-icon-delete" class="red"
                     @click="baseDelete(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>-->
      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link v-if="scope.row.status !== 'x'" :to="'/wiki/books/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              Edit
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 编辑弹出框 -->
    <el-dialog :title="baseForm.title" :visible.sync="baseForm.visible">
      <el-form ref="baseForm" :model="record" label-width="100px" :disabled="baseForm.disabled">
        <el-form-item label="类型">
          <el-cascader
            ref="typeCascader"
            v-model="record.typeOptions"
            expand-trigger="hover"
            :options="options.bookType"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="record.name" />
        </el-form-item>
        <!--        <el-form-item label="标签" prop="description">
          <el-input v-model="record.description"></el-input>
        </el-form-item>-->
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
        <el-form-item label="来源">
          <el-radio-group v-model="record.srcType" @change="srcTypeChange">
            <el-radio-button label="0">导入</el-radio-button>
            <el-radio-button label="1">网络</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="baseForm.uploadShow" label="上传文件">
          <el-upload
            ref="uploader"
            class="upload-book"
            drag
            :headers="authHeader"
            :data="uploadParams"
            name="files[]"
            :limit="1"
            :show-file-list="false"
            :on-success="uploadSuccess"
            :action="urls.upload"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传txt文件，且不超过100MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item v-show="!baseForm.uploadShow" label="来源地址" prop="srcUrl">
          <el-input v-model="record.srcUrl" :disabled="baseForm.srcUrlDisabled">
            <template v-if="baseForm.uploadDel">
              <el-button slot="append" icon="el-icon-delete" @click.prevent="removeUpload()">删除
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <!--<el-form-item label="最新章节" prop="latestChapter">
          <el-input v-model="record.latestChapter"></el-input>
        </el-form-item>
        <el-form-item label="最新更新时间">
          <el-date-picker
            type="date"
            placeholder="最新更新时间"
            v-model="record.latestChapterAt"
            value-format="timestamp"></el-date-picker>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('baseForm')">取 消</el-button>
        <el-button type="primary" @click="saveEdit('baseForm')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数

import { fetchBookList, addBook/*, edit, del*/ } from '@/api/wiki/books'

export default {
  name: 'WikiBooks',
  components: { Pagination },
  data() {
    return {
      list: [],
      loading: false,
      listQuery: {
        page: 1,
        limit: 20,
        total: 0,
        params: {}
      },
      urls: { upload: '' },
      baseForm: {
        action: 'add',
        title: '新增',
        visible: false,
        disabled: false,
        codeDisabled: false,
        srcUrlDisabled: false,
        uploadShow: true,
        uploadDel: false
      },
      record: {
        name: '',
        srcType: '0',
        originalType: ''
      },
      options: {
        bookType: [
          {
            value: '1',
            label: '小说',
            children: [{
              value: '11',
              label: '玄幻'
            }, {
              value: '12',
              label: '仙侠'
            }, {
              value: '13',
              label: '都市'
            }, {
              value: '14',
              label: '武侠'
            }]
          }, {
            value: '2',
            label: '文学'
          }, {
            value: '3',
            label: '历史'
          }

        ], classify: [
          {
            value: '1',
            label: '热门'
          }, {
            value: '2',
            label: '综合'
          }
        ]
      }
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
  created() {
    this.getList()
  },
  methods: {
    checkPermission2,
    getList() {
      this.loading = true
      fetchBookList(this.listQuery).then(response => {
        this.list = response.rows
        this.listQuery.total = response.total
        this.loading = false
      })
    },
    handleAdd() {
      //
      this.baseForm.visible = true
      this.srcTypeChange(0)
    },
    saveEdit() {
      this.loading = true
      addBook(this.record).then(resp => {
        this.loading = false
        if (resp.success) {
          this.baseForm.visible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '添加书籍成功',
            type: 'success',
            duration: 2000
          })
        }
      }).catch(err => { console.error(err); this.loading = false })
    },
    resetForm() {
      //
      this.baseForm.visible = true
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
    uploadSuccess(resp, file, fileList) {
      // debugger;
      if (resp.success) {
        this.$message.success('上传成功！')
        if (fileList.length > 1) fileList.shift()
        this.record.latestChapterUrl = resp.rows[0]
        this.record.srcUrl = resp.rows[1]
        this.record.originalType = '0'
        this.baseForm.uploadShow = false
      } else {
        this.$message.error('上传失败,' + resp.error.name)
        fileList.pop()
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
