<template>
  <el-cascader v-model="category" :props="{ expandTrigger: 'hover' }" clearable :placeholder="placeholder" :options="categories" />
</template>

<script>
import { fetchTree } from '@/api/wiki/category'
export default {
  props: {
    type: {
      type: String,
      default: '0'
    },
    placeholder: {
      type: String,
      default: '文章分类'
    },
    value: {
      // required: true,
      default: () => [],
      type: Array
    }
  },
  data() {
    return {
      categories: []
    }
  },
  computed: {
    category: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  mounted() {
    this.loadCategories()
  },
  methods: {
    loadCategories() {
      fetchTree(this.type).then(response => {
        this.categories = response.rows
      })
    }
  }
}
</script>
