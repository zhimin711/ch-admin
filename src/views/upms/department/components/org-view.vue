<template>
  <div
    ref="dragWrapper"
    class="org-tree-drag-wrapper"
    @mousedown="mousedownView"
    @contextmenu="handleDocumentContextmenu"
  >
    <div class="org-tree-wrapper" :style="orgTreeStyle">
      <v-org-tree
        v-if="data"
        :data="data"
        :node-render="nodeRender"
        :expand-all="true"
        collapsable
        @on-node-click="handleNodeClick"
      />
    </div>
  </div>
</template>

<script>
import { on, off } from '@/utils/tools'
import { checkPermission2 } from '@/utils/permission'
import VOrgTree from 'v-org-tree'
import 'v-org-tree/dist/v-org-tree.css'

const menuList = [
  {
    key: 'new',
    code: 'UPMS_DEPARTMENT_ADD',
    label: '新增子部门'
  },
  {
    key: 'edit',
    code: 'UPMS_DEPARTMENT_EDIT',
    label: '编辑部门'
  },
  {
    key: 'detail',
    code: 'UPMS_DEPARTMENT_DETAIL2',
    label: '部门详情'
  },
  {
    key: 'post',
    code: 'UPMS_DEPARTMENT_POSITIONS',
    label: '分配职位'
  },
  {
    key: 'delete',
    code: 'UPMS_DEPARTMENT_DEL',
    label: '删除部门'
  }
]
const nonMenu = {
  key: 'null',
  label: '无操作权限'
}
export default {
  name: 'OrgView',
  components: { VOrgTree },
  props: {
    zoomHandled: {
      type: Number,
      default: 1
    },
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentContextMenuId: '',
      currentClickMenuId: '',
      orgTreeOffsetLeft: 0,
      orgTreeOffsetTop: 0,
      initPageX: 0,
      initPageY: 0,
      oldMarginLeft: 0,
      oldMarginTop: 0,
      canMove: false
    }
  },
  computed: {
    orgTreeStyle() {
      return {
        transform: `translate(-50%, -50%) scale(${this.zoomHandled}, ${
          this.zoomHandled
        })`,
        marginLeft: `${this.orgTreeOffsetLeft}px`,
        marginTop: `${this.orgTreeOffsetTop}px`
      }
    }
  },
  mounted() {
    on(document, 'contextmenu', this.handleDocumentContextmenu)
  },
  beforeDestroy() {
    off(document, 'contextmenu', this.handleDocumentContextmenu)
  },
  methods: {
    handleNodeClick(e, data, expand) {
      expand()
    },
    closeMenu() {
      this.currentContextMenuId = ''
    },
    getBgColor(data) {
      return this.currentContextMenuId === data.id
        ? data.isRoot
          ? '#0d7fe8'
          : '#5d6c7b'
        : ''
    },
    nodeRender(h, data) {
      const tempMenuList = [] // data.isRoot ? menuRootList : menuList
      menuList.forEach(item => {
        if (data.isRoot && item.key === 'delete') {
          //
        } else if (checkPermission2(item.code)) {
          tempMenuList.push(item)
        }
      })
      if (tempMenuList.length === 0) tempMenuList.push(nonMenu)
      return (
        <div
          class={[
            'custom-org-node',
            data.children && data.children.length ? 'has-children-label' : ''
          ]}
          on-mousedown={event => event.stopPropagation()}
          on-contextmenu={this.contextmenu.bind(this, data)}
        >
          <el-dropdown
            trigger='custom'
            on-command={this.handleContextMenuClick.bind(this, data)}
            className='context-menu'
            visible={this.currentContextMenuId === data.value}
            nativeOn-click={this.handleDropdownClick}
            style={{ transform: `scale(${1 / this.zoomHandled}, ${1 / this.zoomHandled})` }}
            v-click-outside={this.closeMenu}
          >
            <div class='el-dropdown-link' style='color:white'>
              {data.label}
            </div>
            <el-dropdown-menu slot='dropdown' style={{ display: this.currentContextMenuId === data.value ? 'block' : 'none' }}>
              {tempMenuList.map(item => {
                return (<el-dropdown-item command={item.key}>{item.label}</el-dropdown-item>)
              })}
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      )
    },
    contextmenu(data, $event) {
      console.log('右击事件：', data)
      const event = $event || window.event
      event.preventDefault
        ? event.preventDefault()
        : (event.returnValue = false)
      this.currentContextMenuId = data.value
    },
    setDepartmentData(data) {
      data.isRoot = true
      this.departmentData = data
    },
    mousedownView(event) {
      this.canMove = true
      this.initPageX = event.pageX
      this.initPageY = event.pageY
      this.oldMarginLeft = this.orgTreeOffsetLeft
      this.oldMarginTop = this.orgTreeOffsetTop
      on(document, 'mousemove', this.mousemoveView)
      on(document, 'mouseup', this.mouseupView)
    },
    mousemoveView(event) {
      if (!this.canMove) return
      const { pageX, pageY } = event
      this.orgTreeOffsetLeft = this.oldMarginLeft + pageX - this.initPageX
      this.orgTreeOffsetTop = this.oldMarginTop + pageY - this.initPageY
    },
    mouseupView() {
      this.canMove = false
      off(document, 'mousemove', this.mousemoveView)
      off(document, 'mouseup', this.mouseupView)
    },
    handleDropdownClick(event) {
      // console.log('mouseupView', event)
      // 禁止事件向传递
      if (event.target && event.target.className === 'el-dropdown-menu__item') {
        event.stopPropagation()
      }
    },
    handleDocumentContextmenu() {
      this.canMove = false
    },
    handleContextMenuClick(data, key) {
      this.$emit('on-menu-click', { data, key })
      this.closeMenu()
    }
  }
}
</script>

<style>
  .context-menu{
    z-index: 1000;
  }
</style>
