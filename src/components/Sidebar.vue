// Sidebar.vue（v-bind:class 構文エラーの修正済）
<template>
  <div class="sidebar">
    <div
      v-for="p in pages"
      :key="p.id"
      :class="['thumb', { active: p.id === currentPageId }]"
      @click="$emit('selectPage', p.id)"
    >
      <img :src="getThumbnail(p)" />
      <div>{{ p.id }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({ pages: Array, currentPageId: [String, Number] })
const thumbnails = ref({})

onMounted(() => {
  nextTick().then(() => generateThumbnails())
})

watch(() => props.pages, () => {
  nextTick().then(() => generateThumbnails())
})

function waitForPageReady(id) {
  return new Promise(resolve => {
    const el = document.querySelector(`[data-page-id='${id}']`)
    if (!el) return resolve(null)
    const handler = () => {
      el.removeEventListener('page-ready', handler)
      resolve(el)
    }
    el.addEventListener('page-ready', handler)
  })
}

async function generateThumbnails() {
  for (const page of props.pages) {
    if (thumbnails.value[page.id]) continue
    const el = await waitForPageReady(page.id)
    if (el) {
      const canvas = await html2canvas(el, { scale: 0.2 })
      thumbnails.value[page.id] = canvas.toDataURL('image/png')
    }
  }
}

function getThumbnail(p) {
  return thumbnails.value[p.id] ||
    (p.type === 'image' ? p.src :
     p.type === 'pdf' ? '/thumb/pdf.png' :
     '/thumb/txt.png')
}
</script>

<style scoped>
.sidebar {
  width: 120px;
  overflow-y: auto;
  border-right: 1px solid #ccc;
  background: #fafafa;
  padding: 0.5rem;
}
.thumb {
  cursor: pointer;
  margin-bottom: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
}
.thumb img {
  width: 100%;
  height: auto;
  border: 2px solid transparent;
  box-sizing: border-box;
}
.thumb.active img {
  border-color: #007bff;
}
</style>