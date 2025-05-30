// ファイル4: MarkdownPage.vue
<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it' // ← 追加！

const props = defineProps({ src: String })
const html = ref('')
const md = new MarkdownIt() // ← ここでインスタンス化

onMounted(async () => {
  const res = await fetch(props.src)
  const text = await res.text()
  html.value = md.render(text)
})
</script>

<style>
.markdown-body {
  max-width: 800px;
  margin: auto;
  padding: 1rem;
  line-height: 1.6;
  font-family: sans-serif;
}
</style>
