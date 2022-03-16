<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
        <el-divider />
        <gen-info-form ref="genInfo" :info="info" :tables="tables" :menus="menus" />
      </el-tab-pane>
      <!--<el-tab-pane label="生成信息" name="genInfo">
      </el-tab-pane>-->
      <el-tab-pane label="字段信息" name="columns">
        <el-table ref="dragTable" :data="columns" row-key="columnId" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" class-name="allowDrag" />
          <el-table-column
            label="字段列名"
            prop="columnName"
            min-width="120"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="字段描述" min-width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.columnComment" />
            </template>
          </el-table-column>
          <el-table-column
            label="字段类型"
            prop="columnType"
            min-width="120"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Java类型" min-width="120">
            <template slot-scope="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java属性" min-width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.javaField" />
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="130">
            <template slot-scope="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="文本框" value="INPUT" />
                <el-option label="数字框" value="INPUT_NUMBER" />
                <el-option label="文本域" value="TEXTAREA" />
                <el-option label="下拉框" value="SELECT" />
                <el-option label="单选框" value="RADIO" />
                <el-option label="复选框" value="CHECKBOX" />
                <el-option label="日期控件" value="DATETIME" />
                <el-option label="图片上传" value="IMAGE_UPLOAD" />
                <el-option label="文件上传" value="FILE_UPLOAD" />
                <el-option label="富文本控件" value="EDITOR" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" min-width="120">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.dictCode"
                clearable
                filterable
                placeholder="请选择"
                :disabled="scope.row.htmlType!=='SELECT' && scope.row.htmlType!=='RADIO' && scope.row.htmlType!=='CHECKBOX'"
                @change="handleDictChange(scope.row, $event)"
              >
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                >
                  <span style="float: left">{{ dict.label }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.value }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="插入" min-width="50">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isInsert" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="编辑" min-width="50">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isEdit" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="列表" min-width="50">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isList" true-label="1" />
            </template>
          </el-table-column>
          <el-table-column label="查询" min-width="50">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isQuery" true-label="1" />
            </template>
          </el-table-column>
          <!--<el-table-column label="必填" min-width="50">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.isRequired" true-label="1" />
            </template>
          </el-table-column>-->
          <!--<el-table-column label="查询方式" min-width="100">
            <template slot-scope="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>-->
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="warning" icon="el-icon-view" @click="submitForm(1)">预览</el-button>
        <el-button type="primary" @click="submitForm()">生成代码</el-button>
        <el-button @click="close()">返回</el-button>
      </el-form-item>
    </el-form>
    <!-- 预览界面 -->
    <el-dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" append-to-body :close-on-click-modal="false">
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
  </el-card>
</template>
<script>
import { getGenTable, codegen, previewTable2 } from '@/api/sys/tools/gen'
import { treePermission } from '@/api/upms/permission'
import basicInfoForm from './basicInfoForm'
import genInfoForm from './genInfoForm'
// import Sortable from 'sortablejs'
import { isEmpty } from '@/utils/validate'
import { getToken } from '@/utils/auth'

import hljs from 'highlight.js/lib/highlight'
import 'highlight.js/styles/github-gist.css'
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('vue', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))

export default {
  name: 'GenEdit',
  components: {
    basicInfoForm,
    genInfoForm
  },
  data() {
    return {
      // 选中选项卡的 name
      activeName: 'basic',
      // 表格的高度
      tableHeight: document.documentElement.scrollHeight - 245 + 'px',
      // 表信息
      tables: [],
      // 表列信息
      columns: [],
      // 字典信息
      dictOptions: [],
      // 菜单信息
      menus: [],
      // 表详细信息
      info: {},
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
    'info.baseEntity': function(val) {
      this.columns = this.info.columns || []
      if (!isEmpty(val)) {
        this.columns = this.columns.filter((v) => !v.superColumn)
      }
    }
  },
  created() {
    const dsId = this.$route.query && this.$route.query.dsId
    const tableName = this.$route.query && this.$route.query.tableName
    const tableComment = encodeURIComponent(this.$route.query && this.$route.query.tableComment)
    if (dsId && tableName) {
      // 获取表详细信息
      getGenTable(dsId, { tableName: tableName, tableComment: tableComment }).then(resp => {
        if (resp.success) {
          this.info = resp.rows[0]
          this.info.dsId = dsId
          if (isEmpty(this.info.functionAuthor)) {
            this.info.functionAuthor = this.$store.state.user.name
          }
          this.columns = this.info.columns || []
          this.columns = this.columns.filter((v) => !v.superColumn)
          // this.tables = resp.data.tables
        }
      })
      /** 查询菜单下拉列表 */
      this.getMenus('2')
      /** 查询字典下拉列表 */
      // searchDictList().then(resp => {
      //   this.dictOptions = resp.rows
      // })
    }
  },
  mounted() {
    /* const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
    const sortable = Sortable.create(el, {
      handle: '.allowDrag',
      onEnd: evt => {
        const targetRow = this.columns.splice(evt.oldIndex, 1)[0]
        this.columns.splice(evt.newIndex, 0, targetRow)
        for (const index in this.columns) {
          this.columns[index].sort = parseInt(index) + 1
        }
      }
    })*/
  },
  methods: {
    getMenus(type) {
      // this.options.parents = []
      treePermission(type).then(response => {
        this.menus = response.rows
      })
    },
    previewTable(row) {
      previewTable2(this.info.dsId, row).then(resp => {
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
    /** 提交按钮 */
    submitForm(op) {
      const basicForm = this.$refs.basicInfo.$refs.basicInfoForm
      const genForm = this.$refs.genInfo.$refs.genInfoForm
      Promise.all([basicForm, genForm].map(this.getFormPromise)).then(res => {
        const validateResult = res.every(item => !!item)
        if (validateResult) {
          const genTable = Object.assign({}, basicForm.model, genForm.model)
          if (this.info.menus && this.info.menus.length > 0) {
            genTable.parentMenuId = this.info.menus.join(',')
          } else {
            genTable.parentMenuId = '0'
          }
          genTable.menus = undefined
          genTable.columns = Object.assign([], this.columns)
          if (!isEmpty(genTable.baseEntity)) {
            this.info.columns.forEach(item => {
              if (item.superColumn) {
                genTable.columns.push(item)
              }
            })
          }
          const params = {
            treeCode: genTable.treeCode,
            treeName: genTable.treeName,
            treeParentCode: genTable.treeParentCode,
            parentMenuId: genTable.parentMenuId
          }
          genTable.options = JSON.stringify(params)
          if (op === 1) {
            this.previewTable(genTable)
          } else {
            codegen(this.info.dsId, genTable).then(resp => {
              if (resp.success) {
                this.$message.success('生成成功...')
                window.open('/api/sys/download/path?filePath=' + resp.rows[0] + '&token=' + getToken())
              }
            })
          }
        } else {
          this.$message.error('表单校验未通过，请重新检查提交内容')
        }
      })
    },
    handleDictChange(row, val) {
      // searchDict(val).then(resp => {
      //   if (resp.success) {
      //     row.dictData = resp.rows
      //   }
      // })
    },
    getFormPromise(form) {
      return new Promise(resolve => {
        form.validate(res => {
          resolve(res)
        })
      })
    },
    /** 关闭按钮 */
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/cloud/tools/codegen', query: { t: Date.now() }})
    }
  }
}
</script>
