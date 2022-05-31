<template>
  <div class="app-container">
    <div v-show="!baseForm.visible" class="filter-container">
      <el-form :inline="true" :model="listQuery.params" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.originalName" placeholder="名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.params.status" clearable placeholder="状态">
            <el-option
              v-for="dict in dict.type.status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="handle-box">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-search" @click="doSearch">{{ $t('btn.search') }}</el-button>
            <el-button icon="el-icon-refresh" @click="search = {}">{{ $t('btn.reset') }}</el-button>
            <el-button v-permission="['WIKI_AD_ADD']" type="primary" icon="el-icon-plus" class="handle-del mr10" @click="baseAdd()">
              {{ $t('btn.add') }}
            </el-button>
            <!--<el-button type="primary" icon="el-icon-download" class="handle-del mr10">导出</el-button>-->
          </el-col>
        </el-row>
      </div>
      <el-table v-loading="loading" :data="list" border fit highlight-current-row style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column prop="srcType" label="来源" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.srcType === '0'" type="primary">文章</el-tag>
            <el-tag v-if="scope.row.srcType === '1'" type="success">广告</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="image" label="图片" width="260">
          <template slot-scope="scope">
            <img :src="scope.row.image | addToken('wiki')" width="240" height="100">
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" align="center" />
        <!--<el-table-column prop="createAt" label="创建时间" width="160">
          <template slot-scope="scope">
            <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>-->
        <el-table-column prop="validAt" label="开始时间" width="160">
          <template slot-scope="scope">
            <span>{{ scope.row.validAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="invalidAt" label="结束时间" width="160">
          <template slot-scope="scope">
            <span>{{ scope.row.invalidAt | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === '0'" type="primary">待处理</el-tag>
            <el-tag v-if="scope.row.status === '1'" type="success">有效</el-tag>
            <el-tag v-if="scope.row.status === '2'" type="danger">删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-show="scope.row.type !== '0'" v-permission="['WIKI_AD_EDIT']" type="text" icon="el-icon-edit" @click="baseEdit(scope.row)">
              {{ $t('btn.edit') }}
            </el-button>
            <el-button v-show="scope.row.type !== '0'" v-permission="['WIKI_AD_DEL']" type="text" icon="el-icon-delete" class="red" @click="baseDel(scope.$index, scope.row)">
              {{ $t('btn.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total>0" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>

    <!-- 编辑弹出框 -->
    <div v-show="baseForm.visible" class="container">
      <!--<el-dialog :title="baseForm.title" :visible.sync="baseForm.visible" width="50%">-->
      <el-form ref="baseForm" :model="record" :rules="rules" label-width="100px">
        <el-form-item label="广告类型">
          <el-select v-model="record.type" placeholder="请选择">
            <el-option key="1" label="首页Top" value="1" />
            <!--<el-option key="2" label="文章" value="2"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item label="广告来源">
          <!--<el-select v-model="record.srcType" placeholder="请选择">
              <el-option key="0" label="文章" value="0"></el-option>
              <el-option key="1" label="广告" value="1"></el-option>
          </el-select>-->
          <div>
            <el-radio-group v-model="record.srcType">
              <el-radio-button label="0">文章</el-radio-button>
              <el-radio-button label="1">广告</el-radio-button>
            </el-radio-group>
          </div>
        </el-form-item>
        <el-form-item label="广告图">
          <el-row>
            <el-col :span="24">
              <UploadImageCrop v-model="record.image" dir="wiki" title="广告图裁剪及上传" :data="{srcType: 'AD', action: 'scale'}" :aspect-ratio="2.4" width="390px" height="162px" />
            </el-col>
            <el-col :span="24" style="margin-left: 50px; margin-top: 5px;">
              <el-button icon="el-icon-folder-checked" @click="imageSelectVisible = true">图片选择</el-button>
              <ImageSelector v-model="record.image" dir="wiki" title="广告图选择" :show.sync="imageSelectVisible" type="ad" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="标题" prop="name">
          <el-input v-model="record.title" />
        </el-form-item>
        <el-form-item label="地址" prop="url">
          <el-input v-model="record.url" :disabled="baseForm.codeDisabled" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="record.description" type="textarea" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="record.sort" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="record.validAt" type="datetime" placeholder="开始时间" value-format="timestamp" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="record.invalidAt" type="datetime" placeholder="选择日期" value-format="timestamp" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="record.status" placeholder="请选择">
            <el-option key="disabled" label="禁用" value="0" />
            <el-option key="enabled" label="启用" value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-row slot="footer">
        <el-col :span="20" :offset="4">
          <span class="dialog-footer">
            <el-button :loading="baseForm.loading" @click="resetForm('baseForm')">{{ $t('btn.cancel') }}</el-button>
            <el-button :loading="baseForm.loading" type="primary" @click="saveEdit('baseForm')">{{ $t('btn.save') }}</el-button>
          </span>
        </el-col>
      </el-row>

      <!--</el-dialog>-->

    </div>

    <!-- 删除提示框 -->
    <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
      <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="deleteRow">{{ $t('btn.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

import UploadImageCrop from '@/components/Upload/SingleImageCrop'
import ImageSelector from '@/components/ImageSelector'

import { checkPermission2 } from '@/utils/permission' // 权限判断函数

import { getAdList, addAd, editAd/*, del*/ } from '@/api/wiki/ad'

import 'cropperjs/dist/cropper.css'

const defaultRecord = { sort: 1, status: '1', srcType: 0 }

export default {
  name: 'WikiAd',
  dictionary: ['status'],
  components: { UploadImageCrop, ImageSelector },
  data() {
    return {
      record: Object.assign({}, defaultRecord),
      list: [],
      loading: false,
      listQuery: {
        page: 1,
        limit: 20,
        total: 0,
        params: {}
      },
      is_search: false,
      search: {
        name: '',
        status: '',
        code: ''
      },
      baseForm: {
        action: 'add',
        title: '编辑',
        loading: false,
        visible: false,
        codeDisabled: false
      },
      delVisible: false,
      imageSelectVisible: false,
      // 防止重复提交
      cropDialogVisible: false,
      rules: {
        url: [
          {
            required: true,
            message: '请输入地址',
            trigger: 'blur'
          }
        ]
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
      getAdList(this.listQuery).then(resp => {
        if (resp.success) {
          this.list = resp.rows
          this.listQuery.total = resp.total
        }
      }).finally(() => { this.loading = false })
    },
    doSearch() {
      this.is_search = true
      this.getList()
    },
    baseAdd() {
      this.record = Object.assign({}, defaultRecord)
      this.baseForm.action = 'add'
      this.baseForm.visible = true
    },
    baseEdit(row, index) {
      this.record = Object.assign({}, row)
      this.baseForm.action = 'edit'
      this.baseForm.visible = true
      this.baseForm.title = '编辑'
    },
    baseDel(index, row) {
      this.delVisible = true
    },
    // 保存编辑
    saveEdit(formName) {
      this.$refs[formName].validate(async(valid) => {
        if (valid) {
          const _this = this
          let resp = null
          let opName = '添加'
          this.baseForm.loading = true
          if (this.baseForm.action === 'add') {
            resp = await addAd(this.record).finally(() => { this.baseForm.loading = false })
          } else if (this.baseForm.action === 'edit') {
            opName = '修改'
            resp = await editAd(this.record.id, this.record).finally(() => { this.baseForm.loading = false })
          }
          const ok = resp && resp.success
          this.$notify({
            title: `广告 ${opName} ${ok ? '成功' : '失败'}!`,
            dangerouslyUseHTMLString: true,
            message: `<div>${this.record.title}</div>`,
            type: ok ? 'success' : 'error'
          })
          if (ok) {
            this.baseForm.visible = false
            _this.getList()
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.baseForm.visible = false
      this.$refs[formName].resetFields()
    },
    // 确定删除
    deleteRow() {
      this.$message.success('删除成功')
      this.delVisible = false
      this.getList()
    }
  }
}
</script>

<style scoped>
  .handle-box {
    margin-bottom: 10px;
  }

  .handle-box .el-row {
    margin-bottom: 10px;
  }

  .handle-select {
    width: 120px;
  }

  .search-input {
    width: 180px;
    display: inline-block;
  }

  .del-dialog-cnt {
    font-size: 16px;
    text-align: center
  }

  .table {
    width: 100%;
    font-size: 14px;
  }

  .red {
    color: #ff0000;
  }
</style>
