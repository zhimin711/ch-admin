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
            <router-link v-if="checkPermission2(['WIKI_ARTICLE_ADD'])" :to="'/wiki/article/add'">
              <el-button type="primary" size="small" icon="el-icon-plus">
                创建文章
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
          <img :src="scope.row.image" width="180" height="100">
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
      <el-table-column prop="approveStatus" label="审核状态" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.showMode === '1' && (scope.row.approveStatus === '0' || scope.row.approveStatus === null || scope.row.approveStatus === '2')" type="warning">
            待审核
          </el-tag>
          <el-tag v-else-if="scope.row.showMode === '1' && scope.row.approveStatus === '1'" type="success">通过
          </el-tag>
          <el-tag v-else-if="scope.row.showMode === '1' && scope.row.approveStatus === '4'" type="danger">驳回
          </el-tag>
          <el-tag v-else>
            非公开
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link v-if="checkPermission2(['WIKI_ARTICLE_EDIT']) && scope.row.status !== 'x'" :to="'/wiki/article/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              Edit
            </el-button>
          </router-link>
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

import { listArticle } from '@/api/wiki/article'

export default {
  name: 'WikiArticle',
  components: { Pagination },
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
        this.loading = false
      }).catch(() => { this.loading = false })
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
