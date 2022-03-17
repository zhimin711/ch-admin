<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电影类型" prop="movieType">
        <el-select v-model="queryParams.type" placeholder="请选择电影类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.movie_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="电影分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="请选择电影分类" clearable size="small" @change="handleQuery">
          <el-option
            v-for="category in categoryOptions"
            :key="category.categoryId"
            :label="category.name"
            :value="category.categoryId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标签" prop="tagId">
        <el-select
          v-model="queryParams.tagIdList"
          placeholder="请选择标签"
          clearable
          multiple
          size="small"
          @change="handleQuery"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag.tagId"
            :label="tag.content"
            :value="tag.tagId + ``"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="国家" prop="country">
        <el-select v-model="queryParams.country" clearable placeholder="请输入国家">
          <el-option
            v-for="dict in dict.type.movie_country"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.movie_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permission="['WikiVideoInfoAdd']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="['']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <!--      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />-->
    </el-row>

    <el-table v-loading="loading" :data="movieList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="images" label="封面" align="center" width="100">
        <!--        <template slot-scope="scope">
                    <el-image :src="fileUploadHost + scope.row.images" lazy @click="previewPicture(fileUploadHost + scope.row.images)" />
        </template>-->
      </el-table-column>
      <el-table-column label="标题" align="left" show-overflow-tooltip prop="title" width="200" />
      <el-table-column label="电影类型" align="center" prop="type" width="100">
        <!--        <template slot-scope="scope">
               <dict-tag :options="dict.type.movie_type" :value="scope.row.type" />
        </template>-->
      </el-table-column>
      <el-table-column label="电影分类" align="center" prop="categoryName" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.categoryName">
            {{ scope.row.categoryName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="left" prop="tagId" width="300">
        <template slot-scope="scope">
          <template v-for="(item, index) in tagOptions">
            <template v-if="getTagArray(scope.row.tagId).includes(String(item.tagId))">
              <span
                v-if="item.listClass === 'default' || item.listClass === ''"
                :key="item.tagId"
                style="margin-left: 3px"
                :index="index"
                :class="item.cssClass"
              >{{ item.content }}
              </span>
              <el-tag
                v-else
                :key="item.tagId"
                style="margin-left: 3px"
                :index="index"
                :type="item.listClass === 'primary' ? '' : item.listClass"
                :class="item.cssClass? item.cssClass: ''"
              >
                {{ item.content }}
              </el-tag>
            </template>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center" prop="country" width="100">
        <!--        <template slot-scope="scope">
                    <dict-tag :options="dict.type.movie_country" :value="scope.row.country" />
        </template>-->
      </el-table-column>
      <el-table-column label="发布人" align="center" prop="publishUsername" width="100" />
      <el-table-column label="发布时间" align="center" prop="publishTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.publishTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <!--        <template slot-scope="scope">
                    <dict-tag :options="dict.type.movie_status" :value="scope.row.status" />
        </template>-->
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['media:movie:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-permission="['media:movie:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { pageVideoInfo, delVideoInfo, addVideoInfo, editVideoInfo } from '@/api/wiki/media/video'
// import { listTag } from '@/api/media/tag'
import { fetchClassifyTree } from '@/api/wiki/category'
export default {
  name: 'WikiVideos',
  dictionary: ['movie_country', 'movie_status', 'movie_type'],
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 电影管理表格数据
      movieList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        images: null,
        title: null,
        movieType: null,
        categoryId: null,
        country: null,
        tagId: null,
        description: null,
        publishBy: null,
        publishTime: null,
        status: null,
        openComment: null,
        openDownload: null,
        tagIdList: null
      },
      // 标签字典
      tagOptions: [],
      // 分类字典
      categoryOptions: [],
      // 表单参数
      form: {},

      // 表单校验
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    '$route': {
      handler(route) {
        this.getList()
      }
    }
  },
  created() {
    this.getList()
    // 获取字典
    this.getDictList()
  },
  methods: {
    /** 查询电影管理列表 */
    getList() {
      this.loading = true
      pageVideoInfo(this.queryParams).then(response => {
        this.movieList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /**
     * 字典查询
     */
    getDictList() {
      fetchClassifyTree(86).then(response => {
        this.categoryOptions = response.rows
      })
      // listTag({ status: '1' }).then(response => {
      //   this.tagOptions = response.rows
      // })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.movieId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/wiki/resources/video/add'
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const movieId = row.movieId || this.ids
      this.$router.push({
        path: '/wiki/resources/video/edit/' + movieId
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.wmMovieVideoList = this.wmMovieVideoList
          if (this.form.movieId != null) {
            editVideoInfo(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addVideoInfo(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const movieIds = row.movieId || this.ids
      this.$modal.confirm('是否确认删除电影管理编号为"' + movieIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delVideoInfo(movieIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('media/category/export', {
        ...this.queryParams
      }, `category_${new Date().getTime()}.xlsx`)
    },
    // 标签翻译
    getTagArray(tagId) {
      if (!tagId) {
        return []
      }
      return tagId.split(',')
    }
  }
}
</script>

