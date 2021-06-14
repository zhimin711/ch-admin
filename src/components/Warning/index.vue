<template>
  <aside>
    {{ text }}
    <a
      v-if="linkText.length>0"
      :href="linkTarget"
      target="_blank"
    >{{ linkText }}</a>
  </aside>
</template>

<script>
export default {
  name: 'Warning',
  props: {
    linkText: {
      type: String,
      default: ''
    },
    linkTarget: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: 'Please input the warning text !'
    }
  },
  data() {
    return {
      active: false,
      position: '',
      width: undefined,
      height: undefined,
      isSticky: false
    }
  }
}
</script>
