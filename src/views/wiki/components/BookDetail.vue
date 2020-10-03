<template>
  <div class="createPost-container">
    <el-form ref="record" v-loading="loading" :model="record" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+record.statusClass">
        <!--<CommentDropdown v-model="record.comment_disabled" />-->
        <CategoryDropdown v-model="categoryValues" type="37" placeholder="书箱分类" />
        <el-button v-if="checkPermission2(['WIKI_BOOKS_CHAPTER'])" style="margin-left: 10px;" type="success" @click="handleAdd">
          添加目录
        </el-button>
        <el-button v-if="checkPermission2(['WIKI_BOOKS_CHAPTER'])" style="margin-left: 10px;" type="success" @click="handleAdd(2)">
          添加章节
        </el-button>
        <el-button v-if="checkPermission2(['WIKI_BOOKS_EDIT'])" style="margin-left: 10px;" type="warning" @click="submitForm">
          保存信息
        </el-button>
        <el-button v-if="checkPermission2(['WIKI_BOOKS_CATALOG_FIX']) && record.status === '2'" type="danger" @click="fixForm">
          修复目录链接
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <Warning />

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="name">
              <MDinput v-model="record.name" :maxlength="100" name="name" required>
                名称
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="80px" label="作者:" class="postInfo-container-item">
                    <el-input v-model="record.author" />
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="120px" label="最后更新时间:" class="postInfo-container-item">
                    <el-date-picker v-model="record.latestChapterAt" type="datetime" value-format="timestamp" format="yyyy-MM-dd HH:mm:ss" placeholder="请选择时间" />
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label-width="90px" label="Importance:" class="postInfo-container-item">
                    <el-rate
                      v-model="record.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="display:inline-block"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="80px" label="内容简介:">
          <el-input v-model="record.summary" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the content" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>
        <div class="catalog-container">
          <el-row v-if="record.description === '1'">
            <el-col v-for="(item,index) in record.chapterList" :key="item+index" :label="item" :value="item" :span="6">
              <el-popover
                placement="right-start"
                :title="tripName(item.number, item.name, 0)"
                width="200"
                trigger="hover"
              >
                <p v-if="(item.pre ==='2' || item.next ==='2')">链接<span v-if="item.pre ==='2'">[上一目录]</span>
                  <span v-if="item.pre ==='2' && item.next ==='2'">与</span>
                  <span v-if="item.next ==='2'">[下一目录]</span> 错误</p>
                <div style="text-align: right; margin: 0">
                  <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_EDIT'])" type="primary" size="mini" icon="el-icon-edit" :underline="false" @click="handleEditCatalog(item)">编辑</el-link>
                  <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_INFO'])" type="primary" size="mini" icon="el-icon-view" :underline="false" @click="handlePreview(item.id)">预览</el-link>
                  <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_DEL'])" type="danger" size="mini" icon="el-icon-close" :underline="false" @click="handleDelCatalog(item)">删除</el-link>
                </div>
                <el-button slot="reference" type="text">{{ tripName(item.number, item.name, 15) }}
                  <el-badge v-if="(item.pre ==='2' || item.next ==='2')" class="mark" :value="(item.pre ==='2' && item.next ==='2')?2:1" />
                </el-button>
              </el-popover>
            </el-col>
          </el-row>
          <el-row v-if="record.description === '2'">
            <el-row v-for="(item,index) in record.chapterList" :key="item+index" :label="item" :value="item">
              <el-row>
                <el-col :span="24" align="center">
                  {{ tripName(item.number, item.name, 15) }}
                  <el-button v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_EDIT'])" type="text" icon="el-icon-edit" @click="handleEditCatalog(item)">编辑</el-button>
                  <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_DEL'])" type="danger" icon="el-icon-close" :underline="false" @click="handleDelCatalog(item)">删除</el-link>
                </el-col>
              </el-row>
              <el-divider />
              <el-row>
                <el-col v-for="(item2,index2) in item.children" :key="item2+index2" :label="item2" :value="item2" :span="6">
                  <el-popover
                    placement="right-start"
                    :title="tripName(item2.number, item2.name, 0)"
                    width="200"
                    trigger="hover"
                  >
                    <p v-if="(item2.pre ==='2' || item2.next ==='2')">链接<span v-if="item2.pre ==='2'">[上一目录]</span>
                      <span v-if="item2.pre ==='2' && item2.next ==='2'">与</span>
                      <span v-if="item2.next ==='2'">[下一目录]</span> 错误</p>
                    <div style="text-align: right; margin: 0">
                      <!--<el-button size="mini" type="text" @click="handleEditCatalog(item2)">编辑</el-button>-->
                      <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_EDIT'])" type="primary" size="mini" icon="el-icon-edit" :underline="false" @click="handleEditCatalog(item2)">编辑</el-link>
                      <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_INFO'])" type="primary" size="mini" icon="el-icon-view" :underline="false" @click="handlePreview(item2.id)">预览</el-link>
                      <el-link v-if="checkPermission2(['WIKI_BOOKS_CHAPTER_DEL'])" type="danger" size="mini" icon="el-icon-close" :underline="false" @click="handleDelCatalog(item2)">删除
                      </el-link>
                    </div>
                    <el-button slot="reference" type="text">{{ tripName(item2.number, item2.name, 15) }}
                    </el-button>
                  </el-popover>
                </el-col>
              </el-row>
              <el-divider />
            </el-row>
          </el-row>
        </div>
      </div>
    </el-form>
    <!-- 编辑弹出框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改目录':'新增目录'">
      <el-form ref="baseForm" :model="recordCatalog" label-width="100px">
        <el-form-item label="上一章节">
          <el-select v-model="pre" placeholder="请选择" value-key="id" clearable @change="(val)=> handlePreAndNext(val,-1)">
            <el-option
              v-for="item in catalogs"
              :key="item.id"
              :label="item.number + ' - ' + item.name"
              :value="item"
              :disabled="recordCatalog.id===item.id"
            >
              <span style="float: left">{{ item.number }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
            </el-option>
          </el-select>
          <!--<el-select v-model="recordCatalog.pre" :remote-method="getRemoteCatalogList" filterable default-first-option remote placeholder="Search Catalog">
            <el-option v-for="(item,index) in catalogs" :key="item+index" :label="item" :value="item" />
          </el-select>-->
        </el-form-item>
        <el-form-item label="下一章节">
          <el-select v-model="next" placeholder="请选择" value-key="id" clearable @change="(val)=>handlePreAndNext(val,1)">
            <el-option
              v-for="(item,index) in catalogs"
              :key="item.id+index"
              :label="item.number + ' - ' + item.name"
              :value="item"
              :disabled="recordCatalog.id===item.id"
            >
              <span style="float: left">{{ item.number }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="章节序号" prop="number">
          <el-col :span="12">
            <el-input v-model="recordCatalog.number" placeholder="请使用中文序号（例：第一集/章）" />
          </el-col>
        </el-form-item>

        <el-form-item label="章节名称" prop="name">
          <el-col :span="12">
            <el-input v-model="recordCatalog.name" />
          </el-col>
        </el-form-item>
        <!--<el-form-item label="标签" prop="keywords">
          <el-input v-model="recordCatalog.keywords"></el-input>
        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCatalogSubmit">确 定</el-button>
        <el-button @click="dialogVisible=false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="previewTitle"
      :visible.sync="previewDialogVisible"
      width="80%"
      :center="true"
      :before-close="handlePreviewClose"
    >
      <div class="chapter-preview" v-html="previewRecord.content" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="handlePreview(previewRecord.pre)">上一章</el-button>
        <el-button @click="handlePreviewClose">关 闭</el-button>
        <el-button @click="handlePreview(previewRecord.next)">下一章</el-button>
      </span>
    </el-dialog>
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="50" transition-name="fade" />
    </el-tooltip>
  </div>
</template>

<script>
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import BackToTop from '@/components/BackToTop'
import { CategoryDropdown } from './Dropdown'
import { validURL } from '@/utils/validate'
import Warning from './Warning'

import { checkPermission2 } from '@/utils/permission' // 权限判断函数

import { deepClone } from '@/utils'

import { getBook, editBook, fixBook, getBookCatalogs } from '@/api/wiki/books'
import { editBookChapter, delBookChapter, getBookChapter } from '@/api/wiki/books/chapter'

const defaultForm = {
  statusClass: 'draft',
  name: '', // 名称
  title: '', // 标题
  type: '', // 类型1.小说
  classify: '', // 分类:1.最新 2.热门 3.
  summary: '', // 文章摘要
  srcUrl: '', // 文章外链
  image: '', // 文章图片
  description: '', // 文章图片
  latestChapterUrl: '', // 文章图片
  latestChapterAt: undefined, // 前台展示时间
  id: undefined,
  chapterList: [],
  comment_disabled: false,
  readCount: 0,
  importance: 0
}
const defaultCatalog = {
  statusClass: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  image_uri: '', // 文章图片
  display_time: undefined, // 前台展示时间
  id: undefined,
  chapterList: [],
  importance: 0
}

export default {
  name: 'BookDetail',
  components: { MDinput, Sticky, Warning, CategoryDropdown, BackToTop },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      record: Object.assign({}, defaultForm),
      loading: false,
      dialogVisible: false,
      dialogType: 'add',
      recordCatalog: Object.assign({}, defaultCatalog),
      catalogs: [],
      categoryValues: [],
      pre: {},
      next: {},
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {},
      previewDialogVisible: false,
      previewRecord: {},
      previewTitle: '',
      // customizable button style, show/hide critical point, return position
      myBackToTopStyle: {
        right: '50px',
        bottom: '50px',
        width: '40px',
        height: '40px',
        'border-radius': '4px',
        'line-height': '45px', // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
        background: '#e7eaf1'// 按钮的背景颜色 The background color of the button
      }
    }
  },
  computed: {
    contentShortLength() {
      return this.record.summary ? this.record.summary.length : 0
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.record.display_time))
      },
      set(val) {
        this.record.display_time = new Date(val)
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.record = Object.assign({}, defaultForm)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    checkPermission2,
    fetchData(id) {
      this.loading = true
      getBook(id).then(response => {
        this.loading = false
        this.record = response.rows[0]
        this.getRemoteCatalogList()
        // just for test
        // this.record.title += `   Book Id:${this.record.id}`
        // this.record.summary += `   Book Id:${this.record.id}`

        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
        if (this.record.status === '2' && checkPermission2(['WIKI_BOOKS_CATALOG_FIX'])) {
          this.fixForm()
        }
        if (this.record.classify) {
          this.categoryValues = this.record.classify.split(',')
        }
      }).catch(err => {
        this.loading = false
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = '目录'
      const route = Object.assign({}, this.tempRoute, { title: `《${this.record.name}》${title}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑 '
      document.title = `${title} - 《${this.record.name}》`
    },
    submitForm() {
      this.$refs.record.validate(valid => {
        if (valid) {
          this.loading = true
          if (this.categoryValues.length > 0) {
            this.record.classify = this.categoryValues.join(',')
          }

          editBook(this.record.id, this.record).then(resp => {
            this.loading = false
            if (resp.success) {
              this.$notify({
                title: '成功',
                message: '修改 书籍信息成功',
                type: 'success',
                duration: 2000
              })
            }
          }).catch(err => { console.error(err); this.loading = false })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fixForm() {
      this.$confirm(`当前目录链接存在错误，请确认是否修复?`, '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          fixBook(this.record.id).then(resp => {
            this.loading = false
            if (resp.success) {
              this.fetchData(this.record.id)
              this.$alert(`修复成功`, `提示`, {
                confirmButtonText: '确定',
                callback: action => {
                  //
                }
              })
            }
          }).catch(err => { console.error(err); this.loading = false })
        })
    },
    draftForm() {
      if (this.record.content.length === 0 || this.record.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.record.statusClass = 'draft'
      this.record.status = '0'
    },
    getRemoteCatalogList(query) {
      const params = { leaf: false }
      getBookCatalogs(this.record.id, params).then(response => {
        // if (!response.data.items) return
        // this.catalogs = response.data.items.map(v => v.name)
        this.catalogs = response.rows
      })
    },
    handleAdd(op) {
      if (op === 2) {
        //
        this.$router.push({ path: '/wiki/business/book/chapter/add' })
        return
      }
      this.dialogVisible = true
      this.dialogType = 'add'
      this.recordCatalog = Object.assign({}, defaultCatalog)
      this.next = { id: null }
      if (this.record.chapterList.length > 0) {
        this.pre = { id: this.record.chapterList[this.record.chapterList.length - 1].id }
      }
    },
    handleEditCatalog(row) {
      if (row.leaf) {
        //
        this.$router.push({ path: '/wiki/business/book/chapter/edit/' + row.id })
        return
      }
      this.dialogVisible = true
      this.dialogType = 'edit'
      this.recordCatalog = deepClone(row)
      this.pre = { id: row.pre }
      this.next = { id: row.next }
    },
    handleDelCatalog(row) {
      this.$confirm(`请确认是否删除当前目录/章节[${row.name}]，操作不可回退?`, '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        this.loading = true
        delBookChapter(row.id).then(resp => {
          this.loading = false
          if (resp.success) {
            this.fetchData(this.record.id)
            this.$alert(`删除成功`, `提示`, {
              confirmButtonText: '确定',
              callback: action => {
              }
            })
          }
        }).catch(err => { console.error(err); this.loading = false })
      }).catch(err1 => {})
    },
    handlePreAndNext(row, op) {
      if (op === 1) {
        if (row.pre === this.recordCatalog.id) {
          this.pre = {}
          return
        }
        this.pre = { id: row.pre }
      } else if (op === -1) {
        if (row.next === this.recordCatalog.id) {
          this.next = {}
          return
        }
        this.next = { id: row.next }
      }
    },
    handlePreview(id) {
      if (id === null || id === '') return
      //
      this.previewTitle = '正在加载章节内容...'
      this.previewRecord = { content: '' }
      getBookChapter(id).then(resp => {
        if (resp.success) {
          this.previewDialogVisible = true
          this.previewRecord = resp.rows[0]
          this.previewTitle = this.previewRecord.number + this.previewRecord.name
        }
      })
    },
    handlePreviewClose() {
      this.previewDialogVisible = false
      // this.previewRecord = { content: '' }
    },
    async handleCatalogSubmit() {
      //
      const _this = this
      // this.record = {}
      if (this.pre.id) {
        this.recordCatalog.pre = this.pre.id
      }
      if (this.next.id) {
        this.recordCatalog.next = this.next.id
      }
      let resp = null
      let opName = '添加'
      if (this.dialogType === 'new') {
        // resp = await add(this.record)
      } else if (this.dialogType === 'edit') {
        opName = '修改'
        resp = await editBookChapter(this.recordCatalog.id, this.recordCatalog).catch(() => {})
      }
      if (resp && resp.success) {
        this.dialogVisible = false
        this.$message({
          type: 'success',
          message: `${opName} ${this.recordCatalog.name} success!`
        })
        _this.fetchData(this.record.id)
      }
    },
    tripName(num, name, len) {
      const str = ((num || '') + ' ' + (name || '')).trim()
      if (len > 0 && str.length > len) {
        return str.substring(0, len) + '...'
      }
      return str
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
  .chapter-preview {
    font-size: 1.2rem
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
