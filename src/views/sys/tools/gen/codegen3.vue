<template>
  <div class="app-container">
    <div class="filter-container">
      <Warning text="工具只生成只有后台Dao层（包含：Entity、Mapper、Dto等）" />
      <el-form ref="form" :model="params" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="表名称" prop="tableName">
              <el-input v-model="params.dbTableName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表描述" prop="tableComment">
              <el-input v-model="params.tableComment" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实体类名称" prop="className">
              <el-input v-model="params.className" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="functionAuthor">
              <el-input v-model="params.commentAuthor" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="params.remark" type="textarea" :rows="3" />
            </el-form-item>
            <el-divider />
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <span slot="label">插件类型</span>
              <el-select v-model="params.mapperPlugin">
                <el-option label="Zh.mapper" value="ZH" />
                <el-option label="Tk.mapper" value="TK" />
                <el-option label="None" value="NONE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <span slot="label">父类</span>
              <el-select v-model="params.javaModelGeneratorRootClassMode" clearable>
                <el-option label="BaseEntity" value="1" />
                <el-option label="BaseEntityWithStatus" value="2" />
                <el-option label="None" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="输出包路径" prop="functionAuthor">
              <el-input v-model="params.outputConfig.packageName" placeholder="请输入com.xxx" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">生成代码</el-button>
          <!--          <el-button type="warning" @click="handleSearch">加载参数</el-button>-->
        </el-form-item>
      </el-form>

    </div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>调用结果</span>
        <!--<el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>-->
      </div>
      <div class="text item">
        <pre>{{ resultJson }}</pre>
        <!--<el-input type="textarea" v-model="resultJson" placeholder="数据: 1/'a'/{}"></el-input>-->
      </div>
    </el-card>

  </div>
</template>

<script>
import { Loading } from 'element-ui'
import { codegen3 } from '@/api/sys/tools/gen'
import { getToken } from '@/utils/auth'

import Warning from '@/components/Warning'

export default {
  name: 'ToolsCodegenRule3',
  components: { Warning },
  data() {
    return {
      listLoading: false,
      params: {
        outputConfig: {},
        mapperPlugin: 'ZH',
        javaModelGeneratorRootClassMode: '2'
      },
      subParams: [{}],
      records: [],
      resultJson: '',
      loading: false,
      disableSave: true,
      rules: {
        method: [
          { required: true, message: '接口方法不能为空', trigger: 'blur' }
        ]
      },
      loadingIns: null
    }
  },
  created() {
    const dsId = this.$route.query && this.$route.query.dsId
    const tableName = this.$route.query && this.$route.query.tableName
    const tableComment = this.$route.query && this.$route.query.tableComment
    this.params.dsId = dsId
    this.params.dbTableName = tableName
    this.params.tableComment = tableComment
    this.params.commentAuthor = this.$store.state.user.name
  },
  methods: {
    handleAddNode() {
      this.subParams.push({ clazz: '', params: '' })
    },
    handleSearch() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return false
        }
        const params = Object.assign({}, this.params)
        this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

        codegen3(this.params.dsId, params).then(resp => {
          this.resultJson = resp
          if (resp.success) {
            this.$message.success('生成成功...')
            window.open('/api/sys/download/path?filePath=' + resp.rows[0] + '&token=' + getToken())
          }
        }).finally(() => {
          this.loadingIns.close()
        })
      })
    },
    handleView(row) {
      this.content = JSON.parse(row.content)
      this.dialogVisible = true
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

  .el-select .el-input__inner {
    width: 360px;
  }
</style>
