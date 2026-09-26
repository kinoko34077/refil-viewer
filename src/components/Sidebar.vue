<template>
  <div class="sidebar">
    <button
      v-for="p in pages"
      :key="p.id"
      type="button"
      :class="['thumb', { active: p.id === currentPageId }]"
      @click="$emit('selectPage', p.id)"
    >
      <img :src="thumbnails[p.id] || getThumbnail(p)" :alt="`Page ${p.id}`" />
      <span>{{ p.id }}</span>
    </button>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({ pages: Array, currentPageId: [String, Number] })
const thumbnails = reactive({})

function getThumbnail(p) {
  if (p.type === 'image') return p.src
  return 'https://via.placeholder.com/100x140?text=...'
}

async function captureThumbnails() {
  for (const p of props.pages) {
    const el = document.querySelector(`[data-page-id="${p.id}"]`)
    if (!el) continue

    const img = el.querySelector('img')
    if (img) {
      await new Promise(resolve => {
        if (img.complete) resolve()
        else img.onload = resolve
      })
    }

    try {
      const canvas = await html2canvas(el, {
        scale: 0.2,
        useCORS: true
      })
      thumbnails[p.id] = canvas.toDataURL()
    } catch (e) {
      console.warn('Capture failed for page', p.id, e)
    }
  }
}

watch(() => props.pages, () => {
  setTimeout(captureThumbnails, 500)
})

onMounted(() => setTimeout(captureThumbnails, 800))
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
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  cursor: pointer;
  margin-bottom: 0.75rem;
  text-align: center;
  font: inherit;
  font-size: 0.8rem;
}
.thumb:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
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
