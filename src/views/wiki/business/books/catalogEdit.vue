<template>
  <book-detail :is-edit="true" />
</template>

<script>
import BookDetail from '../../components/BookDetail'

export default {
  name: 'EditForm',
  components: { BookDetail }
}
</script>
