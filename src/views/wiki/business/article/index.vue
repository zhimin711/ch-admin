<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.title" placeholder="名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.params.status" clearable placeholder="全部">
            <el-option key="1" label="草稿" value="0" />
            <el-option key="2" label="已发布" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="listQuery.params.approveStatus" clearable placeholder="全部">
            <el-option key="1" label="审核通过" value="1" />
            <el-option key="4" label="审核驳回" value="4" />
            <el-option key="0" label="待审核" value="0" />
            <el-option key="2" label="待重新审核" value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="handle-box">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="listQuery.params = {}">重置</el-button>
            <router-link v-if="checkPermission2(['WIKI_ARTICLE_ADD_PAGE'])" :to="'/wiki/article/add'">
              <el-button type="primary" size="small" icon="el-icon-plus">
                创建文章
              </el-button>
            </router-link>
            <router-link v-if="checkPermission2(['WIKI_ARTICLE_RECOMMEND_PAGE'])" :to="'/wiki/article/recommend'">
              <el-button type="success" size="small" icon="el-icon-thumb">
                文章推荐
              </el-button>
            </router-link>
            <!--<el-button type="primary" icon="el-icon-download" class="handle-del mr10">导出</el-button>-->
          </el-col>
        </el-row>
      </div>
    </div>
    <el-table v-loading="loading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="categoryName" label="分类" width="220" />
      <el-table-column prop="title" label="标题" min-width="255" />
      <!--<el-table-column prop="sort" label="排序" width="66">
      </el-table-column>-->
      <el-table-column prop="image" label="图片" width="205" class-name="col-img">
        <template slot-scope="scope">
          <!--<img :src="scope.row.image | imgFilter" width="180" height="100">-->
          <el-image :src="scope.row.image | imgFilter" class="el-article-list-image" />
        </template>
      </el-table-column>
      <el-table-column prop="publishAt" label="发布时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.publishAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="latestChapterAt" label="最新更新时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.updateAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1 && (scope.row.approveStatus === '0' || scope.row.approveStatus === null || scope.row.approveStatus === '2')" type="warning">
            待审核
          </el-tag>
          <el-tag v-else-if="scope.row.status === 1 && scope.row.approveStatus === '1'" type="success">审核通过
          </el-tag>
          <el-tag v-else-if="scope.row.status === 1 && scope.row.approveStatus === '4'" type="danger">审核驳回
          </el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="danger">已删除</el-tag>
          <el-tag v-else>
            草稿
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <router-link v-if="checkOperation('WIKI_ARTICLE_EDIT_PAGE',scope.row)" :to="'/wiki/article/'+scope.row.id">
            <el-button type="text" icon="el-icon-edit">编辑</el-button>
          </router-link>
          <el-button-group>
            <el-button v-if="checkOperation('WIKI_ARTICLE_APPROVE',scope.row)" type="text" icon="el-icon-finished" @click="openApprove(scope.$index, scope.row)">
              审核
            </el-button>
            <el-button v-if="checkOperation('WIKI_ARTICLE_RECOMMEND',scope.row)" type="text" icon="el-icon-thumb" @click="openRecommend(scope.$index, scope.row)">推荐
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数
import { isEmpty } from '@/utils/validate'

import { listArticle } from '@/api/wiki/article'

const imgCloud = require('@/assets/0_images/0_cloud2.jpg') // 裁剪图片的地址

export default {
  name: 'WikiArticle',
  components: { Pagination },
  filters: {
    imgFilter(url) {
      if (isEmpty(url)) {
        return imgCloud
      }
      return url
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        params: {}
      },
      options: {
      }
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission2,
    getList() {
      this.loading = true
      listArticle(this.listQuery).then(response => {
        this.list = response.rows
        this.listQuery.total = response.total
      }).finally(() => { this.loading = false })
    },
    checkOperation(op, row) {
      let isEnabled = checkPermission2([op])
      if (!isEnabled) {
        return false
      }
      if (op === 'WIKI_ARTICLE_EDIT') {
        isEnabled = row.status !== 3
      } else if (op === 'WIKI_ARTICLE_APPROVE') {
        isEnabled = row.status === 1 && (row.approveStatus === '0' || row.approveStatus === '2')
      } else if (op === 'WIKI_ARTICLE_RECOMMEND') {
        isEnabled = row.status === 1 && row.approveStatus === '1'
      }
      return isEnabled
    },
    openApprove(index, row) {
      // var item = this.tableOptions.rows[index];

      // this.record = JSON.parse(JSON.stringify(row))

      /*  $.get(_that.urls.save + row.id + '/')
        .done(function(res) {
          _that.loading = false
          if (res.success) {
            _that.record.content = res.rows[0].content
            if (utils.isEmptyObject(_that.record.content)) {
              _that.record.content = '<p>无内容-不能通过审核！</p>'
            } else {
              _that.approve.enableSuccess = true
            }
            _that.approve.title = '审核 - ' + row.title
            _that.approve.visible = true
          }
        })*/

    },
    openRecommend(index, row) {
      //
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

  .el-article-list-image {
    width: 180px;
    height: 100px;
  }
  .el-image__error {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #c0c4cc;
    vertical-align: middle;
  }
</style>
