<template>
  <a
    v-if="isExternal"
    :href="to"
    target="_blank"
    rel="noopener"
    @click.prevent="onLinkClick"
  >
    <slot />
  </a>
  <router-link v-else :to="to">
    <slot />
  </router-link>
</template>

<script>
import { isExternal } from '@/utils/validate'
import { genAuthCode } from '@/api/login'

export default {
  props: {
    to: {
      type: String,
      required: true
    },
    meta: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isExternal() {
      return isExternal(this.to)
    }
  },
  methods: {
    async onLinkClick(e) {
      if (this.meta && this.meta.mode === 'authCode') {
        e && e.preventDefault && e.preventDefault()
        try {
          const res = await genAuthCode(this.to)
          if (res.success) {
            let url = this.to
            url += (url.indexOf('?') > -1 ? '&' : '?') + 'code=' + encodeURIComponent(res.rows[0])
            window.open(url, '_blank')
          } else {
            this.$message && this.$message.error(res.message)
          }
        } catch (err) {
          this.$message && this.$message.error('获取授权码失败')
        }
      }
      // 否则允许默认跳转
    },
    async handleAuthCode(item) {
      await this.onLinkClick({ preventDefault: () => {} })
    }
  }
}
</script>
