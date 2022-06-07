<template>
  <div :class="{fullscreen:fullscreen}" class="tinymce-container" :style="{width:containerWidth}">
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <div class="editor-custom-btn-container">
      <!--<editorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK" />-->
      <editor-image class="editor-upload-btn" color="#1890ff" :url="uploadUrl" :data="{srcType: 'article-content', type: 'image'}" @successCBK="imageSuccessCBK" />
    </div>
  </div>
</template>

<script>
/**
 * docs:
 * https://panjiachen.github.io/vue-element-admin-site/feature/component/rich-editor.html#tinymce
 */
import editorImage from '@/components/Upload/MultiImage'
import plugins from './pluginsLocal'
import toolbar from './toolbarLocal'

import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/skins/ui/oxide/content.css'
// import 'tinymce/skins/content/default/content.css'

import 'tinymce/tinymce'
import 'tinymce/icons/default/icons'
import 'tinymce/themes/silver'
import 'tinymce/plugins/image'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/colorpicker'
import 'tinymce/plugins/textcolor'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/code'
import 'tinymce/plugins/link'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/hr'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/textpattern'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/template'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/imagetools'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/emoticons/js/emojis'
import 'tinymce/plugins/noneditable'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/print'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/save'
import 'tinymce/plugins/spellchecker'

export default {
  name: 'Tinymce',
  components: { editorImage },
  props: {
    id: {
      type: String,
      default: function() {
        return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    value: {
      type: String,
      default: ''
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    menubar: {
      type: String,
      default: 'file edit insert view format table'
    },
    height: {
      type: [Number, String],
      required: false,
      default: 360
    },
    width: {
      type: [Number, String],
      required: false,
      default: 'auto'
    },
    uploadUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      hasChange: false,
      hasClean: false,
      hasInit: false,
      tinymceId: this.id,
      fullscreen: false,
      languageTypeList: {
        'en': 'en',
        'zh': 'zh_CN',
        'es': 'es_MX',
        'ja': 'ja'
      }
    }
  },
  computed: {
    containerWidth() {
      const width = this.width
      if (/^[\d]+(\.[\d]+)?$/.test(width)) { // matches `100`, `'100'`
        return `${width}px`
      }
      return width
    }
  },
  watch: {
    value(val) {
      // console.log('tinymce watch value => [' + val + ']')
      if (this.hasClean && val === '') return
      if (val === 'clean' && this.hasInit) {
        this.$nextTick(() => {
          window.tinymce.get(this.tinymceId).setContent('')
          // this.$emit('input', '')
          this.hasClean = true
        })
      } else if ((this.hasClean || !this.hasChange) && this.hasInit) {
        if (this.hasClean) this.hasClean = false
        this.$nextTick(() =>
          window.tinymce.get(this.tinymceId).setContent(val || ''))
      }
    }
  },
  mounted() {
    this.initTinymce()
  },
  activated() {
    if (window.tinymce) {
      this.initTinymce()
    }
  },
  deactivated() {
    this.destroyTinymce()
  },
  destroyed() {
    this.destroyTinymce()
  },
  methods: {
    initTinymce() {
      const _this = this
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        language: this.languageTypeList['en'],
        height: this.height,
        body_class: 'panel-body ',
        object_resizing: false,
        toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
        menubar: this.menubar,
        plugins: plugins,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'square',
        advlist_number_styles: 'default',
        imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
        default_link_target: '_blank',
        link_title: false,
        convert_urls: false,
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        init_instance_callback: editor => {
          if (_this.value) {
            editor.setContent(_this.value)
          }
          _this.hasInit = true
          editor.on('NodeChange Change KeyUp SetContent', (e) => {
            if (!this.hasClean) this.hasChange = true
            this.$emit('input', editor.getContent())
          })
        },
        setup(editor) {
          editor.on('FullscreenStateChanged', (e) => {
            _this.fullscreen = e.state
          })
        }
      })
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId)
      if (this.fullscreen) {
        tinymce.execCommand('mceFullScreen')
      }

      if (tinymce) {
        tinymce.destroy()
      }
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value)
    },
    getContent() {
      window.tinymce.get(this.tinymceId).getContent()
    },
    imageSuccessCBK(arr) {
      const _this = this
      arr.forEach(v => {
        window.tinymce.get(_this.tinymceId).insertContent(`<img class="wscnph" src="${v.url}" >`)
      })
    }
  }
}
</script>
<style>
  .mce-toolbar.mce-stack-layout-item:first-child {
    border-bottom: 1px solid #d9d9d9;
  }
</style>
<style scoped>
.tinymce-container {
  position: relative;
  line-height: normal;
}
.tinymce-container>>>.mce-fullscreen {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
