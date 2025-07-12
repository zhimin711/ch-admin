<template>
  <div class="custom-tabs">
    <button class="arrow left" :disabled="isScrollStart" @click="scrollLeft">
      <i class="el-icon-arrow-left" />
    </button>
    <div ref="scroll" class="tabs-scroll">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', {active: tab.value === value}]"
        :title="tab.label"
        @click="$emit('input', tab.value)"
      >
        <slot :tab="tab">{{ tab.label }}</slot>
      </div>
    </div>
    <button class="arrow right" :disabled="isScrollEnd" @click="scrollRight">
      <i class="el-icon-arrow-right" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'CustomTabs',
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    tabs: {
      type: Array,
      required: true // [{label, value}]
    }
  },
  data() {
    return {
      isScrollStart: true,
      isScrollEnd: false
    }
  },
  watch: {
    tabs() {
      this.$nextTick(this.checkScroll)
    }
  },
  mounted() {
    this.checkScroll()
    this.$nextTick(() => {
      this.$refs.scroll && this.$refs.scroll.addEventListener('scroll', this.checkScroll, { passive: true })
    })
  },
  beforeDestroy() {
    this.$refs.scroll && this.$refs.scroll.removeEventListener('scroll', this.checkScroll)
  },
  methods: {
    scrollLeft() {
      const el = this.$refs.scroll
      if (!el) return
      el.scrollTo({
        left: el.scrollLeft - 120,
        behavior: 'smooth'
      })
    },
    scrollRight() {
      const el = this.$refs.scroll
      if (!el) return
      el.scrollTo({
        left: el.scrollLeft + 120,
        behavior: 'smooth'
      })
    },
    checkScroll() {
      const el = this.$refs.scroll
      if (!el) return
      this.isScrollStart = el.scrollLeft <= 2
      this.isScrollEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
    }
  }
}
</script>

<style scoped>
.custom-tabs {
  display: flex;
  align-items: center;
  position: relative;
  background: #fff;
  padding: 0 8px;
  min-height: 44px;
}
.tabs-scroll {
  overflow-x: auto;
  white-space: nowrap;
  flex: 1;
  margin: 0 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.tabs-scroll::-webkit-scrollbar {
  display: none;
}
.tab-item {
  display: inline-block;
  padding: 0 18px;
  height: 38px;
  line-height: 38px;
  border-radius: 6px;
  margin-right: 6px;
  cursor: pointer;
  background: #f5f7fa;
  color: #333;
  font-size: 15px;
  transition: background .2s, color .2s;
  user-select: none;
}
.tab-item.active {
  background: #409eff;
  color: #fff;
  font-weight: bold;
}
.arrow {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  transition: background .2s, color .2s;
  margin: 0 2px;
}
.arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.arrow:hover:not(:disabled) {
  background: #e0f0ff;
  color: #1976d2;
}
</style>
