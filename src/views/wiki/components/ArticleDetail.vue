<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+stickyStatus">
        <CategoryDropdown v-model="categoryValues" type="35" />
        <CommentDropdown v-model="postForm.commentDisabled" />
        <SourceUrlDropdown v-model="postForm.href" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm(1)">
          {{ isReleased?'更新':'发布' }}
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <!--<Warning />-->

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                文章标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="100px" label="作者:" class="postInfo-container-item">
                    <el-select v-model="postForm.author" :remote-method="getRemoteUserList" filterable default-first-option remote placeholder="用户">
                      <el-option v-for="(item) in userListOptions" :key="item.userId" :label="item.nickname" :value="item.userId" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label-width="120px" label="发布时间:" class="postInfo-container-item">
                    <el-date-picker v-model="postForm.publishAt" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp" placeholder="默认当前时间（定时发布）" :disabled="!isReleased" />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label-width="90px" label="文章标签:" class="postInfo-container-item__block">
                    <el-select
                      v-model="tags.values"
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      placeholder="请选择文章标签"
                      class="block"
                    >
                      <el-option
                        v-for="item in tags.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="100px" label="文章简介:">
          <el-input v-model="postForm.description" :rows="1" type="textarea" class="article-textarea" autosize placeholder="请输入文章简要信息" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.content" :height="400" upload-url="/api/wiki/admin/upload/img" />
        </el-form-item>

        <el-form-item prop="image" style="margin-bottom: 30px;" label-width="100px" label="概要图:">
          <el-row>
            <el-col :span="24">
              <Upload v-model="postForm.image" title="文章概要图裁剪及上传" :data="{srcType: 'ARTICLE_COVER', action: 'scale'}" />
            </el-col>
            <el-col :span="24" style="margin-left: 50px; margin-top: 5px;">
              <el-button icon="el-icon-folder-checked" @click="imageSelectVisible = true">图片选择</el-button>
              <ImageSelector v-model="postForm.image" title="文章概要图选择" :show.sync="imageSelectVisible" type="ARTICLE_COVER" image-height="247px" />
            </el-col>
          </el-row>
        </el-form-item>

      </div>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/SingleImageCrop'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
// import Warning from './Warning'
import ImageSelector from '@/components/ImageSelector'
import { CommentDropdown, SourceUrlDropdown, CategoryDropdown } from './Dropdown'

import { validURL, isEmpty } from '@/utils/validate'
import { getArticle, addArticle, editArticle } from '@/api/wiki/article'
import { searchUser } from '@/api/wiki/remote-search'

const defaultForm = {
  status: 0,
  title: '', // 文章题目
  content: '', // 文章内容
  description: '', // 文章摘要
  href: '', // 文章外链
  image: '', // 文章图片
  publishAt: undefined, // 前台展示时间
  id: undefined,
  commentDisabled: false,
  author: ''
}

export default {
  name: 'WikiArticleDetail',
  components: { Tinymce, MDinput, Upload, Sticky, ImageSelector, CommentDropdown, SourceUrlDropdown, CategoryDropdown },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        // this.$message.error(rule.field + '为必传项')
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
          // this.$message.error('外链url填写不正确')
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      imageSelectVisible: false,
      // stickyStatus: 'draft',
      isReleased: false,
      userListOptions: [],
      categoryValues: [],
      rules: {
        // image: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        href: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tags: {
        options: [{
          value: 'JAVA',
          label: 'JAVA'
        }, {
          value: 'HTML/CSS/JavaScript',
          label: 'HTML/CSS/JavaScript'
        }, {
          value: '数据库',
          label: '数据库'
        }, {
          value: '中间件',
          label: '中间件'
        }],
        values: []
      },
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.description.length
    },
    stickyStatus() {
      return this.postForm.status === 1 ? 'published' : 'draft'
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.publishAt))
      },
      set(val) {
        this.postForm.publishAt = new Date(val)
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      getArticle(id).then(response => {
        this.postForm = response.rows[0]
        this.categoryValues = []
        if (this.postForm.categoryId) {
          this.categoryValues = this.postForm.categoryId.split(',')
        }
        this.getRemoteUserList(this.postForm.author)
        this.tags.values = []
        if (!isEmpty(this.postForm.keywords)) {
          this.tags.values = this.postForm.keywords.split(',')
        }
        // this.stickyStatus = this.postForm.status === 1 ? 'published' : 'draft'
        this.isReleased = this.postForm.approveStatus === '1'
        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = '编辑文章'
      const route = Object.assign({}, this.tempRoute, { title: `${title}《${this.postForm.title}》` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑文章'
      document.title = `${title}《${this.postForm.title}》`
    },
    submitForm(status) {
      this.$refs.postForm.validate(async valid => {
        if (valid) {
          this.postForm.status = status
          if (this.categoryValues.length > 0) {
            this.postForm.categoryId = this.categoryValues.join(',')
          } else {
            this.$message.error('请选择文章分类')
            return false
          }
          this.loading = true
          let resp
          if (!this.isEdit) {
            resp = await addArticle(this.postForm)
          } else {
            resp = await editArticle(this.postForm.id, this.postForm)
          }
          this.loading = false
          const tipStr = this.postForm.status === 1 ? '发布文章' : '保存草稿'
          if (resp && resp.success) {
            this.$confirm(`${tipStr}成功`, '文章', {
              confirmButtonText: '返回列表',
              cancelButtonText: `继续${this.isEdit ? '编辑' : '创建'}`,
              type: 'warning'
            }).then(() => {
              this.$store.dispatch('tagsView/delView', this.tempRoute)
              this.$router.go(-1)
            }).catch(() => {
              if (!this.isEdit) {
                this.postForm = Object.assign({}, defaultForm)
                this.postForm.content = 'clean'
              }
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      this.submitForm(0)
    },
    getRemoteUserList(query) {
      if (isEmpty(query)) return
      searchUser(query).then(response => {
        if (!response.success) return
        this.userListOptions = response.rows
      })
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

      .postInfo-container-item__block {
        float: left;
        width: 100%;
      }

      .postInfo-container-item__block .el-select {
        float: left;
        width: 100%;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
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
