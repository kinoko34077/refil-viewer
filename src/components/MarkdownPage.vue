// MarkdownPage.vue（イベント発火と markdown-it モジュール方式に修正）
<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({ src: String, id: [String, Number] })
const html = ref('')

onMounted(async () => {
  const res = await fetch(props.src)
  const text = await res.text()
  const md = new MarkdownIt()
  html.value = md.render(text)

  nextTick(() => {
    const el = document.querySelector(`[data-page-id='${props.id}']`)
    el?.dispatchEvent(new Event('page-ready'))
  })
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