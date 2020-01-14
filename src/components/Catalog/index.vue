<template>
  <div :class="{'hidden':hidden}" class="catalog-container">

    <div class="Info-container">
      <el-row>
        <el-col v-for="(item,index) in rows" :key="item+index" :label="item" :value="item" :span="item.leaf?6:24">
          {{ item.number }} - {{ item.name }}
          <el-tooltip placement="top" :disabled="!(item.pre ==='2' || item.next ==='2')">
            <div slot="content">
              <span v-if="item.pre ==='2'">上一目录错误</span>
              <br v-if="item.pre ==='2' && item.next ==='2'">
              <span v-if="item.next ==='2'">下一目录错误</span>
            </div>
            <el-button type="text" @click="handleCurrentChange(item)">编辑
              <el-badge v-if="(item.pre ==='2' || item.next ==='2')" class="mark" :value="(item.pre ==='2' && item.next ==='2')?2:1" />
            </el-button>
          </el-tooltip>
          <el-divider />
          {{ item }}
        </el-col>
        <!--
        <el-col :span="10">
          <el-form-item label-width="120px" label="Publish Time:" class="postInfo-container-item">
            <el-date-picker v-model="postForm.createAt" type="timestamp" format="yyyy-MM-dd HH:mm:ss" placeholder="Select date and time" />
          </el-form-item>
        </el-col>-->

      </el-row>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Pagination',
  props: {
    rows: {
      required: true,
      type: Array
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
  },
  methods: {
    handleSizeChange(val) {
    },
    handleCurrentChange(row) {
    }
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 10px 16px;
}
.pagination-container.hidden {
  display: none;
}
</style>
