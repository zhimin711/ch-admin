<template>
  <book-chapter-detail :is-edit="true" />
</template>

<script>
import BookChapterDetail from '../../components/BookChapterDetail'

export default {
  name: 'EditForm',
  components: { BookChapterDetail }
}
</script>

