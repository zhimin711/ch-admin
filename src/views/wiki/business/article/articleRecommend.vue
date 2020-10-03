<template>
  <div class="app-container">
    <div class="actions-container">
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="initGroup">
        重置
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleAdd">
        添加
      </el-button>
      <el-button v-permission="'WikiArticleRecommendEdit'" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleSubmit">
        保存
      </el-button>
    </div>
    <div class="components-container board">
      <Kanban :key="1" :list="list1" :group="group" class="kanban todo" header-text="精选" />
      <Kanban :key="2" :list="list2" :group="group" class="kanban working" header-text="热门" />
    </div>
    <el-dialog title="选择文章" :visible.sync="dialogVisible">
      <el-form :inline="true" :model="listQuery.params">
        <el-form-item label="文章分类">
          <CategoryDropdown v-model="listQuery.categoryValues" type="35" />
        </el-form-item>
        <el-form-item label="文章名称">
          <el-input v-model="listQuery.params.title" autocomplete="off" />
        </el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getArticleList">
          查询
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleSelectionAdd">
          添加
        </el-button>
      </el-form>
      <el-table v-loading="listLoading" :data="listQuery.data" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column property="categoryName" label="分类" />
        <el-table-column property="title" label="名称" />
      </el-table>
      <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getArticleList" />
    </el-dialog>
  </div>
</template>

<script>
import Kanban from '@/components/Kanban/recommend'
import { CategoryDropdown } from '../../components/Dropdown'
import Pagination from '@/components/Pagination'
import { listArticle, getArticleRecommends, editArticleRecommends } from '@/api/wiki/article'

export default {
  name: 'ArticleRecommend',
  components: { Kanban, Pagination, CategoryDropdown },
  data() {
    return {
      group: 'mission',
      list1: [
      ],
      list2: [
      ],
      list3: [
      ],
      records: [],
      multipleSelection: [],
      dialogVisible: false,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10,
        total: 0,
        data: [],
        categoryValues: [],
        params: { status: '1', recommendType: 0, approveStatus: 1 }
      }
    }
  },
  created() {
    // this.getRecommends()
  },
  mounted() {
    this.getRecommends()
  },
  methods: {
    getRecommends() {
      getArticleRecommends().then(resp => {
        if (resp.success) {
          this.records = resp.rows
          this.initGroup()
        }
      })
    },
    initGroup() {
      this.list1 = []
      this.list2 = []
      this.records.forEach(e => {
        const daterange = []
        if (e.startTime && e.endTime) {
          daterange.push(e.startTime)
          daterange.push(e.endTime)
        }/* else if (e.startTime) {
              daterange.push(e.startTime)
            }*/
        if (e.recommendType === 1) {
          // this.list1.push({ name: e.title, id: e.id })
        } else if (e.recommendType === 2) {
          this.list2.push({ id: e.id, name: e.title, daterange: daterange })
        } else if (e.recommendType === 3) {
          this.list1.push({ id: e.id, name: e.title, daterange: daterange })
        }
      })
    },
    handleAdd() {
      this.dialogVisible = true
    },
    handleSubmit() {
      const data = []
      this.list1.forEach((e, index) => {
        data.push({ id: e.id, recommendType: 3, sort: (index + 1), startTime: e.daterange[0], endTime: e.daterange[1] })
      })
      this.list2.forEach((e, index) => {
        data.push({ id: e.id, recommendType: 2, sort: (index + 1), startTime: e.daterange[0], endTime: e.daterange[1] })
      })
      editArticleRecommends(data).then(resp => {
        if (resp.success) {
          this.getRecommends()
        }
        this.$notify({
          title: `更新推荐位 ${resp.success ? '成功' : '失败'}!`,
          dangerouslyUseHTMLString: true,
          message: ``,
          type: resp.success ? 'success' : 'error'
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getArticleList() {
      this.listQuery.data = []
      this.listLoading = true
      this.listQuery.params.categoryId = ''
      if (this.listQuery.categoryValues.length > 0) {
        this.listQuery.params.categoryId = this.listQuery.categoryValues.join(',')
      }
      listArticle(this.listQuery).then(response => {
        this.listQuery.data = response.rows
        this.listQuery.total = response.total
      }).finally(() => { this.listLoading = false })
    },
    handleSelectionAdd() {
      if (this.multipleSelection.length <= 0) {
        this.$message.warning('请选择要添加的文章')
        return
      }
      this.dialogVisible = false
      this.$confirm('请选择要添加的推荐位', '提示', {
        confirmButtonText: '热门',
        cancelButtonText: '精选',
        cancelButtonClass: 'el-button--primary',
        type: 'warning',
        center: true
      }).then(() => {
        this.addRecommends(2)
      }).catch(() => {
        this.addRecommends(3)
      })
    },
    addRecommends(type) {
      this.multipleSelection.forEach((e, index) => {
        if (type === 3) {
          this.list1.push({ id: e.id, name: e.title, daterange: [] })
        } else if (type === 2) {
          this.list2.push({ id: e.id, name: e.title, daterange: [] })
        }
      })
    }
  }
}
</script>
<style lang="scss">
  .actions-container{
    margin: 10px 50px;
  }
  .board {
    width: 900px;
    margin-left: 20px;
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    align-items: flex-start;
  }
  .kanban {
    &.todo {
      .board-column-header {
        background: #4A9FF9;
      }
    }
    &.working {
      .board-column-header {
        background: #f9944a;
      }
    }
    &.done {
      .board-column-header {
        background: #2ac06d;
      }
    }
  }
</style>

