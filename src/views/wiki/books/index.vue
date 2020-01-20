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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

// import { deepClone } from '@/utils'
import { checkPermission2 } from '@/utils/permission' // 权限判断函数

import { fetchList/*, add, edit, del*/ } from '@/api/wiki/books'

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
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission2,
    getList() {
      this.loading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.rows
        this.listQuery.total = response.total
        this.loading = false
      })
    },
    handleAdd() {
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
</style>
