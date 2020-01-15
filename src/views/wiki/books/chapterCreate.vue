<template>
  <book-chapter-detail :is-edit="false" />
</template>

<script>
import BookChapterDetail from '../components/BookChapterDetail'

export default {
  name: 'CreateForm',
  components: { BookChapterDetail }
}
</script>

