<template>
  <div class="app-container">
    <div v-show="!baseForm.visible" class="filter-container">
      <el-form :inline="true" :model="listQuery.params" class="search-form-inline">
        <el-form-item label="名称">
          <el-input v-model="listQuery.params.originalName" placeholder="名称" />
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
            <el-button type="primary" icon="el-icon-search" @click="doSearch">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="search = {}">重置</el-button>
            <el-button v-if="checkPermission2(['WIKI_AD_ADD'])" type="primary" icon="el-icon-plus" class="handle-del mr10" @click="baseAdd()">新增
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
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="image" label="图片" width="260">
          <template slot-scope="scope">
            <img :src="scope.row.image" width="240" height="100">
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
        <el-table-column label="操作" width="130" align="center">
          <template slot-scope="scope">
            <el-button v-if="checkPermission2(['WIKI_AD_EDIT'])" v-show="scope.row.type !== '0'" type="text" icon="el-icon-edit" @click="baseEdit(scope.$index, scope.row)">编辑
            </el-button>
            <el-button v-if="checkPermission2(['WIKI_AD_DEL'])" v-show="scope.row.type !== '0'" type="text" icon="el-icon-delete" class="red" @click="baseDel(scope.$index, scope.row)">删除
            </el-button>
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
              <div class="ad-img-uploader" @click="openUploadImg">
                <img v-if="record.image" :src="record.image" class="ad-img">
                <i v-else class="el-icon-plus ad-uploader-icon" />
              </div>
            </el-col>
            <el-col :span="24">
              <el-button icon="el-icon-folder-checked" @click="imageSelectVisible = true">图片选择</el-button>
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
            <el-button @click="resetForm('baseForm')">取 消</el-button>
            <el-button type="primary" @click="saveEdit('baseForm')">确 定</el-button>
          </span>
        </el-col>
      </el-row>

      <!--</el-dialog>-->

    </div>

    <!-- 删除提示框 -->
    <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
      <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRow">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 引用el的dialog弹框组件，默认data中设置croppaVisible=true -->
    <el-dialog title="广告图片裁剪" :visible.sync="cropDialogVisible" :width="'60%'">
      <el-row>
        <el-col :span="15">
          <div>
            <VueCropper
              ref="cropper"
              alt="请选择图片！"
              :src="cropperOptions.img"
              :aspect-ratio="cropperOptions.ratio"
              :view-mode="2"
              :preview="cropperOptions.preview"
              :img-style="{ 'width': '400px', 'height': '300px' }"
            />
          </div>
        </el-col>
        <el-col :span="8" :offset="1">
          <div class="img-preview ad-avatar" />
        </el-col>
      </el-row>
      <div slot="footer" class="footer-btn dialog-footer">
        <el-row class="align-center">
          <el-col :span="15">
            <div class="scope-btn">
              <label class="btn" for="uploads">更换图片</label>
              <input id="uploads" type="file" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="setImage">
              <el-button @click="changeScale(0.1)">+</el-button>
              <el-button @click="changeScale(-0.1)">-</el-button>
              <el-button @click="changeRotate(-90)">↺</el-button>
              <el-button @click="changeRotate(90)">↻</el-button>
            </div>
          </el-col>
          <el-col :span="8">
            <!--<el-button @click="down('blob')">
                <i class="el-icon-upload"></i> 完成
            </el-button>-->
            <el-button type="primary" @click="uploadImg">完成<i class="el-icon-upload el-icon--right" />
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <el-dialog title="广告图片选择" :visible.sync="imageSelectVisible" width="512px" center>
      <div class="demo-image__lazy">
        <ul class="el-image-list">
          <li v-for="image in imageList" :key="image.id" :class="{'is-success':imageSelectId===image.id}" class="el-image-list__item" @click="selectImage(image)">
            <label class="el-image-list__item-status-label"><i class="el-icon-upload-success el-icon-check" /></label>
            <el-image :src="image.path" lazy />
          </li>
        </ul>
        <p v-if="!imagesQuery.noMore" align="center"><el-button type="text" @click="loadImages">加载更多</el-button></p>
        <p v-if="imagesQuery.noMore" align="center">没有更多了</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="imageSelectVisible = false">关 闭</el-button>
        <!--<el-button type="primary" @click="deleteRow">确 定</el-button>-->
      </span>
    </el-dialog>
  </div>
</template>

<script>

import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

import { checkPermission2 } from '@/utils/permission' // 权限判断函数

import { getAdList, addAd/*, edit, del*/, uploadAd, getAdImageList } from '@/api/wiki/ad'

import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import { isEmpty } from '@/utils/validate'

const defaultRecord = { sort: 1, status: '1', srcType: 0 }
const imgAd = require('@/assets/0_images/0_ad2.jpg') // 裁剪图片的地址

export default {
  name: 'AdManager',
  components: { Pagination, VueCropper },
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
        visible: false,
        codeDisabled: false
      },
      delVisible: false,
      imageSelectVisible: false,
      imageSelectId: -1,
      imagesQuery: {
        page: 1,
        limit: 5,
        total: 0,
        noMore: false
      },
      imageList: [],
      // 防止重复提交
      cropDialogVisible: false,
      cropperOptions: {
        fileName: '', // 裁剪图片的地址
        img: '', // 裁剪图片的地址
        info: true, // 裁剪框的大小信息
        ratio: 2.4,
        outputSize: 0.8, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        // autoCropWidth: 300, // 默认生成截图框宽度
        // autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true, // 固定截图框大小 不允许改变
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [7, 5], // 截图框的宽高比例
        full: true, // 是否输出原图比例的截图
        canMoveBox: false, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        preview: '.ad-avatar'
      },
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
    selectImage(row) {
      this.imageSelectId = row.id
      this.record.image = row.path
    },
    loadImages() {
      if (this.imagesQuery.page * this.imagesQuery.limit > this.imagesQuery.total) {
        this.$message.warning('已加载到后一页！')
        return
      }
      this.imagesQuery.page++
      this.getImageList()
    },
    setImage(e) {
      const file = e.target.files[0]
      if (!file.type.includes('image/')) {
        this.$message.error('Please select an image file')
        return
      }
      this.cropperOptions.fileName = file.name
      if (typeof FileReader === 'function') {
        const reader = new FileReader()
        reader.onload = (event) => {
          // this.imgSrc = event.target.result
          // rebuild cropperjs with the updated source
          this.$refs.cropper.replace(event.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        this.$message.error('Sorry, FileReader API not supported')
      }
    },
    changeScale(ratio) {
      this.$refs.cropper.relativeZoom(ratio)
    },
    changeRotate(degree) {
      this.$refs.cropper.rotate(degree)
    },
    openUploadImg() {
      this.cropDialogVisible = true
      let isChange = true
      if (!this.record.image) {
        this.cropperOptions.img = imgAd
      } else {
        isChange = this.cropperOptions.img !== this.record.image
        this.cropperOptions.img = this.record.image
      }

      if (isChange && this.$refs.cropper) {
        this.$refs.cropper.replace(this.cropperOptions.img)
      }
    },
    uploadImg() {
      if (isEmpty(this.cropperOptions.fileName)) {
        this.$message.warning('请选择图片...')
        return
      }
      const _this = this
      // 输出
      const _data = this.$refs.cropper.getData((data) => {
      })
      // Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`
      this.$refs.cropper.getCroppedCanvas().toBlob((blob) => {
        _data.fileName = this.cropperOptions.fileName
        uploadAd(_data, blob).then((resp) => {
          if (resp.success) {
            _this.cropDialogVisible = false
            _this.cropperOptions.fileName = ''
            // _this.$refs.cropper.replace(imgAd)
            _this.$message.success('上传成功！')
            _this.record.image = resp.rows[0].url
          } else {
            _this.$message.error('上传失败！')
          }
        })
      })
    },
    getList() {
      this.loading = true
      getAdList(this.listQuery).then(response => {
        this.list = response.rows
        this.listQuery.total = response.total
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    getImageList() {
      this.loading = true
      getAdImageList(this.imagesQuery).then(response => {
        if (this.imagesQuery.page === 1) {
          this.imageList = response.rows
        } else {
          this.imageList = this.imageList.concat(response.rows)
        }
        this.imagesQuery.total = response.total
        this.imagesQuery.noMore = this.imagesQuery.page * this.imagesQuery.limit > this.imagesQuery.total
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    doSearch() {
      this.is_search = true
      this.getList()
    },
    baseAdd() {
      this.record = Object.assign({}, defaultRecord)
      this.baseForm.action = 'add'
      this.baseForm.visible = true
      this.getImageList()
    },
    baseEdit(index, row) {
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
      this.$refs[formName].validate((valid) => {
        if (valid) {
          addAd(this.record).then((res) => {
            const tip_key = this.record.title
            if (res.data.success) {
              if (this.baseForm.action === 'edit') {
                // this.$set(this.baseTable.rows, this.baseTable.idx, this.record)
                this.$message.success(`修改 ${tip_key} 成功!`)
              } else {
                this.$message.success(`添加 ${tip_key}成功!`)
                this.fetchData()
              }
              this.baseForm.visible = false
              this.record = {}
            } else {
              if (this.baseForm.action === 'edit') {
                this.$message.error(`修改第${tip_key} 失败!`)
              } else {
                if (res.data.error.code === '303') {
                  this.$message.error(res.data.error.name)
                } else {
                  this.$message.error(`添加${tip_key} 失败!`)
                }
              }
            }
          })
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

  .btn {
    outline: none;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500;
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 3px;
    color: #fff;
    background-color: #67c23a;
    border-color: #67c23a;
  }

  .pic__space{
    /*display: none;*/
  }
  .ad-avatar {
    /*margin-left: 10px;*/
    /*border: 1px solid #eff2f6;*/
    width: 250px;
    height: 150px;
  }

  .img-preview {
    float: left;
    margin-top: 15px;
    margin-right: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    background-color: #fff;
    overflow: hidden;
  }

  .avatar {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 6px;
    /*background-image: url("/static/img/img.jpg");*/
    border: 0;
  }

  .ad-img-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 381px;
    max-height: 160px;
  }

  .ad-img-uploader:hover {
    border-color: #409EFF;
  }

  .ad-img-uploader .ad-img {
    /*width: 100%;*/
    /*height: 100%;*/
    width: 24rem;
    height: 10rem;
  }

  .ad-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

  .demo-image__lazy {
    height: 400px;
    overflow-y: auto;
  }

  .demo-image__lazy .el-image {
    display: block;
    height: 100%;
    margin-bottom: 10px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
  }

  .el-image-list__item {
    transition: all .5s cubic-bezier(.55, 0, .1, 1);
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
    margin-top: 5px;
    position: relative;
    box-sizing: border-box;
    border-radius: 4px;
    width: 100%;
  }

  .el-image-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .el-image-list .el-image-list__item {
    overflow: hidden;
    z-index: 0;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    box-sizing: border-box;
    margin-top: 10px;
    padding: 15px 15px 15px 15px;
    height: 213px;
  }

  .el-image-list__item:first-child {
    margin-top: 10px;
  }

  .el-image-list__item-status-label {
    position: absolute;
    right: 5px;
    top: 0;
    line-height: inherit;
    display: none;
  }

  .el-image-list .el-image-list__item-status-label {
    position: absolute;
    right: -17px;
    top: -7px;
    width: 46px;
    height: 26px;
    background: #13ce66;
    text-align: center;
    transform: rotate(45deg);
    box-shadow: 0 1px 1px #ccc;
  }

  .el-image-list__item.is-success .el-image-list__item-status-label {
    display: block;
  }

  .el-image-list .el-image-list__item .el-icon-check, .el-image-list .el-image-list__item .el-icon-circle-check {
    color: #fff;
  }

  .el-image-list .el-image-list__item-status-label i {
    font-size: 12px;
    margin-top: 12px;
    transform: rotate(-45deg);
  }

  .el-image-list__item .el-icon-upload-success {
    color: #67c23a;
  }
</style>
