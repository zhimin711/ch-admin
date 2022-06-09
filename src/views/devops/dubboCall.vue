<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form ref="form" :model="params" :rules="rules" label-width="120px">
        <el-form-item label="zookeeper" prop="address">
          <el-input v-model="params.address" placeholder="zookeeper（例：zookeeper://0.0.0.0:2181）" />
        </el-form-item>
        <el-form-item label="接口类" prop="interfaceName">
          <el-input v-model="params.interfaceName" placeholder="类全路径（例：java.lang.String）" />
        </el-form-item>
        <el-form-item label="方法名称" prop="method">
          <el-input v-model="params.method" placeholder="方法名称" />
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="params.version" placeholder="版本号" />
        </el-form-item>
        <!--
        <el-form-item label="方法参数类">
          <el-input type="textarea" v-model="params.desc" placeholder="方法参数类（例：java.lang.String，多个用,拼接）"></el-input>
        </el-form-item>
        <el-form-item label="参数">
          <el-input type="textarea" v-model="params.desc" placeholder="数据"></el-input>
        </el-form-item>
-->
        <el-form-item label="参数" style="margin-bottom: 0">
          <el-button type="text" size="small" icon="el-icon-plus" @click="handleAddNode">添加参数</el-button>
          <el-table
            :data="subParams"
            style="width: 100%; margin-bottom: 10px;"
          >
            <el-table-column prop="name" label="参数类">
              <template slot-scope="{row}">
                <template>
                  <el-input v-model="row.clazz" size="small" placeholder="java.lang.String" />
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="host" label="参数内容">
              <template slot-scope="{row}">
                <template>
                  <el-input v-model="row.params" type="textarea" size="small" placeholder="数据: 1、'a'、{}" />
                </template>
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" width="80">
              <template slot-scope="scope">
                <el-link v-if="scope.$index>0" type="danger" @click="handleDelNode(scope.$index)">
                  删除
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">立即调用</el-button>
          <el-button type="success" :disabled="disableSave" @click="handleSearch">保存参数</el-button>
          <el-button type="warning" @click="handleSearch">加载参数</el-button>
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
import { call } from '@/api/devops/dubboCall'

export default {
  name: 'DubboCall',
  data() {
    return {
      listLoading: false,
      params: {
        address: 'zookeeper://10.206.53.185:2181?backup=10.206.53.186:2181,10.206.53.187:2181',
        interfaceName: 'com.sf.grd.require.micro.service.temp.ITempRequireExtInfoService',
        method: 'findByPid',
        version: '1.0.1'
      },
      subParams: [{}],
      records: [],
      resultJson: '',
      loading: false,
      disableSave: true,
      rules: {
        address: [
          { required: true, message: 'zookeeper不能为空', trigger: 'blur' }
        ],
        interfaceName: [
          { required: true, message: '接口不能为空', trigger: 'blur' }
        ],
        method: [
          { required: true, message: '接口方法不能为空', trigger: 'blur' }
        ]
      },
      loadingIns: null
    }
  },
  created() {
  },
  methods: {
    handleAddNode() {
      this.subParams.push({ clazz: '', params: '' })
    },
    handleDelNode(index) {
      this.subParams.splice(index, 1)
    },
    handleSearch() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return false
        }
        const params = Object.assign({}, this.params)
        params.paramJson = []
        const clazzArr = []
        for (let i = 0; i < this.subParams.length; i++) {
          if (!this.subParams[i].clazz || this.subParams[i].clazz === '') {
            this.$message({
              type: 'warn',
              message: '请输入参数类...'
            })
            return
          }
          clazzArr.push(this.subParams[i].clazz)
          params.paramJson[i] = this.subParams[i].params
        }
        params.paramClassName = clazzArr.join(',')
        this.loadingIns = Loading.service({ target: document.querySelector('.app-container'), fullscreen: false })

        this.disableSave = false
        call(params).then(resp => {
          this.resultJson = resp
          if (resp.success) {
            this.disableSave = true
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
