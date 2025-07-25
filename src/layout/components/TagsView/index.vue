<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="isActive(tag)?'active':''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        @click.middle.native="!isAffix(tag)?closeSelectedTag(tag):''"
        @contextmenu.prevent.native="openMenu(tag,$event)"
      >
        <i class="el-icon-document" />
        {{ translatedRouteTitle(tag.meta.code, tag.title) }}
        <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        <i class="el-icon-refresh" />
        {{ $t('tagsView.refresh') }}
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <i class="el-icon-close" />
        {{ $t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">
        <i class="el-icon-remove" />
        {{ $t('tagsView.closeOthers') }}
      </li>
      <li @click="closeAllTags(selectedTag)">
        <i class="el-icon-delete" />
        {{ $t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane'
import path from 'path'
import { translatedRouteTitle } from '@/i18n/i18n'

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: []
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return this.$store.state.permission.routes
    }
  },
  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
  },
  methods: {
    translatedRouteTitle,
    isActive(route) {
      return route.path === this.$route.path
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    closeSelectedTag(view) {
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView.fullPath)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 120
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const offsetHeight = this.$el.offsetHeight // container height

      // 计算菜单位置 - 显示在标签栏下方
      let left = e.clientX - offsetLeft
      const top = offsetHeight + 5 // 标签栏高度 + 5px 间距

      // 水平边界检测
      const maxLeft = offsetWidth - menuMinWidth
      if (left > maxLeft) {
        left = maxLeft
      }
      if (left < 0) {
        left = 0
      }

      // 如果鼠标位置太靠右，将菜单向左偏移
      if (left + menuMinWidth > offsetWidth) {
        left = offsetWidth - menuMinWidth - 10
      }

      // 确保菜单不会超出左边界
      if (left < 10) {
        left = 10
      }

      this.left = left
      this.top = top
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    handleScroll() {
      this.closeMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }

  .tags-view-wrapper {
    position: relative;
    z-index: 1;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 28px;
      line-height: 28px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.1);
      padding: 0 12px;
      font-size: 12px;
      margin-left: 8px;
      margin-top: 6px;
      border-radius: 14px;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:first-of-type {
        margin-left: 20px;
      }

      &:last-of-type {
        margin-right: 20px;
      }

      i.el-icon-document {
        margin-right: 6px;
        font-size: 14px;
        opacity: 0.7;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.active {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);
        transform: translateY(-2px);

        i.el-icon-document {
          opacity: 1;
        }

        &::before {
          content: '';
          background: rgba(255, 255, 255, 0.9);
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          position: absolute;
          top: -2px;
          right: -2px;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 8px 0;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #333;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    min-width: 120px;
    pointer-events: auto;

    li {
      margin: 0;
      padding: 8px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;

      i {
        font-size: 14px;
        opacity: 0.7;
        flex-shrink: 0;
      }

      &:hover {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #fff;

        i {
          opacity: 1;
        }
      }

      &:first-child {
        border-radius: 8px 8px 0 0;
      }

      &:last-child {
        border-radius: 0 0 8px 8px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tags-view-container {
    height: 36px;

    .tags-view-wrapper {
      .tags-view-item {
        height: 24px;
        line-height: 24px;
        padding: 0 8px;
        font-size: 11px;
        margin-left: 6px;
        margin-top: 6px;

        &:first-of-type {
          margin-left: 15px;
        }

        &:last-of-type {
          margin-right: 15px;
        }

        i.el-icon-document {
          margin-right: 4px;
          font-size: 12px;
        }
      }
    }
  }
}

// 动画效果
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tags-view-container {
  .tags-view-wrapper {
    .tags-view-item {
      animation: slideIn 0.3s ease-out;
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: middle;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: 100% 50%;
      margin-left: 6px;
      opacity: 0.6;

      &:before {
        transform: scale(0.7);
        display: inline-block;
        vertical-align: -2px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        opacity: 1;
        transform: scale(1.1);
      }
    }

    &.active {
      .el-icon-close {
        opacity: 0.8;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          color: #fff;
          opacity: 1;
        }
      }
    }
  }
}
</style>
