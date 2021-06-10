<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col class="projects" :span="6">
        <div>
          <span>数据库列表</span>
          <el-divider direction="vertical" />
          <el-button type="text" icon="el-icon-refresh" @click="refreshProjectTree">刷新</el-button>
        </div>
        <!--        <el-divider></el-divider>-->
        <el-input
          v-model="filterProjectText"
          placeholder="输入关键字进行过滤"
        />
        <el-tree
          ref="projectTree"
          class="project-tree"
          :props="props"
          :data="options.projects"
          :load="loadNode"
          lazy
          @node-click="getGenList"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-tag v-if="data.key === '1'">项目</el-tag>
              <el-tag v-else-if="data.key === '2'" type="info">数据库</el-tag>
              <el-tag v-else type="success">Schema</el-tag>
            </span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="18">
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="表名称" prop="tableName">
            <el-input
              v-model="queryParams.tableName"
              placeholder="请输入表名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="表描述" prop="tableComment">
            <el-input
              v-model="queryParams.tableComment"
              placeholder="请输入表描述"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permission="['tool:gen:code']"
              type="primary"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleGenTable"
            >生成</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['tool:gen:import']"
              type="info"
              plain
              icon="el-icon-upload"
              size="mini"
              @click="openImportTable"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['tool:gen:edit']"
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleEditTable"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permission="['tool:gen:remove']"
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" width="55" />
          <el-table-column
            label="表名称"
            prop="tableName"
            :show-overflow-tooltip="true"
            min-width="120"
          />
          <el-table-column
            label="表描述"
            prop="tableComment"
            :show-overflow-tooltip="true"
            min-width="120"
          />
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="180">
            <template slot-scope="scope">
              <el-button
                v-permission="['SYS_TOOLS_CODEGEN_PREVIEW']"
                type="text"
                size="small"
                icon="el-icon-view"
                @click="handlePreview(scope.row)"
              >预览</el-button>
              <el-button
                v-permission="['SYS_TOOLS_CODEGEN_MYBATIS']"
                type="text"
                size="small"
                icon="el-icon-s-unfold"
                @click="handleEditTable(scope.row)"
              >生成规则</el-button>
              <el-button
                v-permission="['tool:gen:remove']"
                type="text"
                size="small"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <el-button
                v-permission="['tool:gen:edit']"
                type="text"
                size="small"
                icon="el-icon-refresh"
                @click="handleSynchDb(scope.row)"
              >同步</el-button>
              <el-button
                v-permission="['tool:gen:code']"
                type="text"
                size="small"
                icon="el-icon-download"
                @click="handleGenTable(scope.row)"
              >生成代码</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.page"
          :limit.sync="queryParams.size"
          @pagination="getList"
        />
        <!-- 预览界面 -->
        <el-dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" append-to-body>
          <el-tabs v-model="preview.activeName">
            <el-tab-pane
              v-for="(value, key) in preview.data"
              :key="key"
              :label="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
              :name="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
            >
              <pre><code class="hljs" v-html="highlightedCode(value, key)" /></pre>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>
        <import-table ref="import" @ok="handleQuery" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listTable, previewTable2, delTable, genCode, synchDb } from '@/api/sys/tools/gen'
import { getCurrentUserTree, getProjectDb } from '@/api/sys/project/index'
import { getDbDs } from '@/api/sys/IaaS/data-source'
import importTable from './importTable'
// import { downLoadZip } from "@/utils/zipdownload";
import hljs from 'highlight.js/lib/highlight'
import 'highlight.js/styles/github-gist.css'
import { isEmpty } from '@/utils/validate'
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('vue', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))

export default {
  name: 'Codegen',
  components: { importTable },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 唯一标识符
      uniqueId: '',
      // 选中数组
      ids: [],
      // 选中表数组
      tableNames: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表数据
      tableList: [],
      // 日期范围
      dateRange: '',
      // 查询参数
      queryParams: {
        page: 1,
        size: 10,
        total: 0,
        params: {}
      },
      props: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      filterProjectText: '',
      options: {
        projects: []
      },
      // 预览参数
      preview: {
        open: false,
        title: '代码预览',
        data: {},
        activeName: 'domain.java'
      }
    }
  },
  watch: {
    filterProjectText(val) {
      this.$refs.projectTree.filter(val)
    }
  },
  created() {
    this.getUserProjects()
  },
  activated() {
    const time = this.$route.query.t
    if (time != null && time !== this.uniqueId) {
      this.uniqueId = time
      this.handleQuery()
    }
  },
  methods: {
    getUserProjects() {
      this.loading = true
      getCurrentUserTree().then(resp => {
        if (resp.success) {
          this.options.projects = resp.rows
        }
      }).finally(() => { this.loading = false })
    },
    getGenList(data, node, resolve) {
      if (data.leaf && this.queryParams.dsId !== data.value) {
        this.queryParams.dsId = data.value
        this.getList()
      }
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(this.options.projects)
      }
      if (node.data.key === '1') {
        getProjectDb(node.data.value).then(resp => {
          if (resp.success) {
            resolve(resp.rows)
          }
        })
      }
      if (node.data.key === '2') {
        getDbDs(node.data.value).then(resp => {
          if (resp.success) {
            resolve(resp.rows)
          }
        })
      }
    },
    refreshProjectTree(id) {
      // let node = this.$refs.projectTree.getNode(id)
      this.getUserProjects()
    },
    /** 查询表集合 */
    getList() {
      if (isEmpty(this.queryParams.dsId)) {
        this.$message.warning('请先在左边选择数据库')
        return
      }
      this.loading = true
      listTable(this.queryParams).then(response => {
        this.tableList = response.rows
        this.total = response.total
      }).finally(() => { this.loading = false })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 生成代码操作 */
    handleGenTable(row) {
      const tableNames = row.tableName || this.tableNames
      if (tableNames === '' || tableNames.length === 0) {
        this.$message.warning('请选择要生成的数据表')
        return
      }
      if (row.genType === '1') {
        genCode(row.tableName).then(response => {
          this.$message.success('成功生成到自定义路径：' + row.genPath)
        })
      } else {
        // downLoadZip("/tool/gen/batchGenCode?tables=" + tableNames, "ruoyi");
      }
    },
    /** 同步数据库操作 */
    handleSynchDb(row) {
      const tableName = row.tableName
      this.$confirm('确认要强制同步"' + tableName + '"表结构吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return synchDb(tableName)
      }).then(() => {
        this.msgSuccess('同步成功')
      })
    },
    /** 打开导入表弹窗 */
    openImportTable() {
      this.$refs.import.show()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 预览按钮 */
    handlePreview(row) {
      previewTable2(this.queryParams.dsId, row).then(resp => {
        if (resp.success) {
          this.preview.data = resp.rows[0]
          this.preview.open = true
        }
      })
    },
    /** 高亮显示 */
    highlightedCode(code, key) {
      const vmName = key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))
      const language = vmName.substring(vmName.indexOf('.') + 1, vmName.length)
      const result = hljs.highlight(language, code || '', true)
      return result.value || '&nbsp;'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.tableId)
      this.tableNames = selection.map(item => item.tableName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleEditTable(row) {
      const tableName = row.tableName
      const tableComment = row.tableComment
      this.$router.push({ path: '/cloud/tools/codegen/rule', query: { dsId: this.queryParams.dsId, tableName: tableName, tableComment: tableComment }})
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const tableIds = row.tableId || this.ids
      this.$confirm('是否确认删除表编号为"' + tableIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delTable(tableIds)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      })
    }
  }
}
</script>
<style scoped>
  .project-tree {
    margin-top: 10px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

</style>
<style>

</style>
