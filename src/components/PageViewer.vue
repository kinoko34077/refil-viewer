// PageViewer.vue（変更なし）
<template>
  <component :is="component" v-bind="page" @page-ready="$emit('page-ready')" />
</template>

<script setup>
import MarkdownPage from './MarkdownPage.vue'
import ImagePage from './ImagePage.vue'
import PDFPage from './PDFPage.vue'

const props = defineProps({ page: Object })
const emit = defineEmits(['page-ready'])

const component = {
  markdown: MarkdownPage,
  image: ImagePage,
  pdf: PDFPage,
}[props.page.type] || MarkdownPage
</script>
