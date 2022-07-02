<template>
  <el-card class="box-card transaction-article">
    <div slot="header" class="clearfix">
      <span>最新发布文章</span>
      <el-button style="float: right; padding: 3px 0" type="text" @click="fetchData">刷新</el-button>
    </div>
    <el-table :data="list" style="width: 100%;">
      <el-table-column label="标题" min-width="200">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="195" align="center">
        <template slot-scope="scope">
          {{ scope.row.categoryName }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag v-if="row.status === 1 && (row.approveStatus === '0' || row.approveStatus === null || row.approveStatus === '2')" type="warning">
            待审核
          </el-tag>
          <el-tag v-else-if="row.status === 1 && row.approveStatus === '1'" type="success">审核通过
          </el-tag>
          <el-tag v-else-if="row.status === 1 && row.approveStatus === '4'" type="danger">审核驳回
          </el-tag>
          <el-tag v-else-if="row.status === 3" type="danger">已删除</el-tag>
          <el-tag v-else>
            草稿
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
// import { transactionList } from '@/api/remote-search'
import { pageWikiArticle } from '@/api/wiki/article'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      const params = {
        page: 1,
        limit: 7,
        params: {}
      }
      pageWikiArticle(params).then(resp => {
        if (resp.success) {
          this.list = resp.rows
        }
      })
    }
  }
}
</script>
<style scoped>
.transaction-article ::v-deep .el-card__body {
  padding: 0;
}
</style>
