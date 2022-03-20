<template>
  <div class="icons-container">
    <el-input v-model="value" class="input-with-select" placeholder="请选择图标" readonly clearable>
      <i v-if="type !== 'svg'" slot="prefix" :class="'el-input__icon el-icon-' + value" />
      <svg-icon v-if="type === 'svg'" slot="prepend" :icon-class="value?value:''" />
      <!--<el-button slot="prepend" icon="el-icon-more"></el-button>-->
      <el-button slot="append" v-popover:popover icon="el-icon-search">选择</el-button>
      <el-button slot="append" icon="el-icon-remove" @click="removeIcon">清空</el-button>
    </el-input>

    <el-popover
      ref="popover"
      placement="top-start"
      width="400"
      trigger="click"
    >
      <el-tabs type="border-card">
        <el-tab-pane v-if="type === 'svg' || type === 'all'" label="SVG">
          <div v-for="item of svgIcons" :key="item" @click="handleClipboard(item,$event)">
            <div class="icon-item">
              <svg-icon :icon-class="item" class-name="disabled" />
              <!--<span>{{ item }}</span>-->
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="type === 'el' || type === 'all'" label="El-ICON">
          <div v-for="item of elementIcons" :key="item" @click="handleClipboard(item,$event)">
            <div class="icon-item">
              <i :class="'el-icon-' + item" />
              <!--<span>{{ item }}</span>-->
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
  </div>
</template>

<script>
import svgIcons from './svg-icons'
import elementIcons from './element-icons'

export default {
  name: 'Icons',
  props: {
    type: {
      type: String,
      default: 'svg'
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      svgIcons,
      elementIcons
    }
  },
  methods: {
    removeIcon() {
      this.value = ''
      this.$emit('input', '')
    },
    generateIconCode(symbol) {
      return `<svg-icon icon-class="${symbol}" />`
    },
    generateElementIconCode(symbol) {
      return `<i class="el-icon-${symbol}" />`
    },
    handleClipboard(text, event) {
      this.$emit('input', text)
      this.$refs['popover'].doClose()
    }
  }
}
</script>

<style lang="scss" scoped>
.icons-container {
  overflow: hidden;

  .input-with-select{
    width: 400px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
}

.icon-item {
  margin: 2px;
  height: 35px;
  text-align: center;
  width: 50px;
  float: left;
  font-size: 30px;
  color: #24292e;
  cursor: pointer;
}

span {
  display: block;
  font-size: 16px;
  margin-top: 10px;
}

.disabled {
  pointer-events: none;
}
</style>
