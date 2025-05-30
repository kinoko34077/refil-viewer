// PageViewer.vue（ImagePage 追加）
<template>
  <component :is="component" v-bind="page" />
</template>

<script setup>
import MarkdownPage from './MarkdownPage.vue'
import ImagePage from './ImagePage.vue'
// import PDFPage from './PDFPage.vue' // 将来的に使用

const props = defineProps({ page: Object })

const component = {
  markdown: MarkdownPage,
  image: ImagePage,
  pdf: ImagePage, // 一旦PDFもImagePageとして処理
}[props.page.type] || MarkdownPage
</script>