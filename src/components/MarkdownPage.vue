<template>
  <div v-if="loadState === 'loading'" class="markdown-status" role="status">
    Markdown を読み込んでいます…
  </div>
  <div v-else-if="loadState === 'error'" class="markdown-status markdown-error" role="alert">
    <p>{{ loadError }}</p>
    <button type="button" @click="loadMarkdown">再試行</button>
  </div>
  <div v-else class="markdown-body" v-html="html"></div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({ src: String, id: [String, Number] })
const html = ref('')
const loadState = ref('loading')
const loadError = ref('')

async function loadMarkdown() {
  loadState.value = 'loading'
  loadError.value = ''

  try {
    if (!props.src) {
      throw new Error('Markdown の読み込み先が指定されていません。')
    }

    const res = await fetch(props.src)
    if (!res.ok) {
      throw new Error(`Markdown の読み込みに失敗しました (HTTP ${res.status})。`)
    }

    const text = await res.text()
    const md = new MarkdownIt()
    html.value = md.render(text)
    loadState.value = 'ready'

    await nextTick()
    const el = document.querySelector(`[data-page-id='${props.id}']`)
    el?.dispatchEvent(new Event('page-ready'))
  } catch (error) {
    console.error(error)
    loadError.value = error instanceof Error ? error.message : String(error)
    loadState.value = 'error'
  }
}

onMounted(loadMarkdown)
</script>

<style>
.markdown-body {
  max-width: 800px;
  margin: auto;
  padding: 1rem;
  line-height: 1.6;
  font-family: sans-serif;
}
.markdown-status {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  min-height: 8rem;
  padding: 1rem;
  text-align: center;
}
.markdown-error p {
  margin: 0;
}
</style>
