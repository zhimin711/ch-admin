<template>
  <div class="code-editor">
    <label class="mode"><i style="padding: 10px 20px;font-size: 14px;height: 37px;">格式</i>
      <el-radio-group
        v-model="mode3"
      >
        <el-radio-button v-for="item in modes2" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>
    </label>
    <label class="mode">
      <textarea ref="coder" placeholder="请输入内容" />
    </label>
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'

import 'codemirror/addon/lint/lint.css'

require('script-loader!jsonlint')

import 'codemirror/mode/meta.js'

import 'codemirror/addon/display/placeholder'

import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
// import 'codemirror/addon/lint/yaml-lint'

import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/properties/properties'
import 'codemirror/mode/yaml/yaml'
// import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter'
import 'codemirror/mode/xml/xml'

export default {
  name: 'ConfigFileEditor',
  /* eslint-disable vue/require-prop-types */
  props: {
    value: {
      type: String,
      default: ''
    },
    // 外部传入的内容，用于实现双向绑定
    mode: {
      type: String,
      default: ''
    },
    // 外部传入的语法类型
    language: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      editor: false,
      // 默认配置
      options: {
        // 缩进格式
        tabSize: 2,
        // 主题，对应主题库 JS 需要提前引入
        theme: 'eclipse',
        // 显示行号
        lineNumbers: true,
        lint: true,
        line: true,
        gutters: ['CodeMirror-lint-markers'],
        mode: 'properties'
      },
      modes: [{
        value: 'text/plain',
        label: 'TEXT'
      }, {
        value: 'application/xml',
        label: 'XML'
      }, {
        value: 'application/json',
        label: 'JSON'
      }, {
        value: 'text/html',
        label: 'HTML'
      }, {
        value: 'text/x-yaml',
        label: 'YAML'
      }, {
        value: 'text/x-properties',
        label: 'Properties'
      }],
      modes2: [
        { value: 'text', label: 'TEXT' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'yaml', label: 'YAML' },
        { value: 'html', label: 'HTML' },
        { value: 'properties', label: 'Properties' }
      ]
    }
  },
  computed: {
    mode3: {
      get() {
        return this.mode
      },
      set(val) {
        this.changeMode(val)
      }
    }
  },
  watch: {
    value(value) {
      const editorValue = this.editor.getValue()
      if (value && value !== editorValue) {
        this.editor.setValue(this.value)
      }
    }
  },
  mounted() {
    if (this.mode) this.options.mode = this.mode

    this.editor = CodeMirror.fromTextArea(this.$refs.coder, this.options)

    if (this.value) {
      this.editor.setValue(this.value)
    }
    if (this.mode) {
      this.editor.setOption('mode', this.mode)
    }
    this.editor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.editor.getValue()
    },
    // 获取当前语法类型
    _getLanguage(language) {
      // 在支持的语法类型列表中寻找传入的语法类型
      return this.modes.find((mode) => {
        // 所有的值都忽略大小写，方便比较
        const currentLanguage = language.toLowerCase()
        const currentLabel = mode.label.toLowerCase()
        const currentValue = mode.value.toLowerCase()

        // 由于真实值可能不规范，例如 java 的真实值是 x-java ，所以讲 value 和 label 同时和传入语法进行比较
        return currentLabel === currentLanguage || currentValue === currentLanguage
      })
    },
    // 更改模式
    changeMode(val) {
      // 修改编辑器的语法配置

      const MIME = CodeMirror.findModeByMIME(val)
      if (MIME) {
        this.editor.setOption('mode', MIME.mode)
        // CodeMirror.autoLoadMode(this.editor, MIME)
      } else {
        this.editor.setOption('mode', val)
      }

      // 获取修改后的语法
      // const label = this._getLanguage(val).label.toLowerCase()
      // console.log('changeMode: ' + label)
      // 允许父容器通过以下函数监听当前的语法值
      // this.$emit('language-change', label)

      this.$emit('change-mode', val)
    }
  }
}
</script>

<style scoped type="scss">
.code-editor {
  height: 100%;
  position: relative;

}

.CodeMirror-empty {
  outline: 1px solid #c22;
}

.code-editor .el-radio-group {
  margin-bottom: 10px;
}
.code-editor >>> .CodeMirror {
  height: auto;
  min-height: 300px;
}
.code-editor >>> .CodeMirror-scroll{
  min-height: 300px;
}
.code-editor >>> .cm-s-rubyblue span.cm-string {
  color: #F08047;
}

.code-editor >>> .CodeMirror-empty.CodeMirror-focused {
  outline: none;
}

.code-editor >>> .CodeMirror pre.CodeMirror-placeholder {
  color: #999;
}

</style>
