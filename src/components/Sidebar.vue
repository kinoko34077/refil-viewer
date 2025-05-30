// Sidebar.vue（変更箇所のみ抽出）
<template>
  <div class="sidebar">
    <div
      v-for="p in pages"
      :key="p.id"
      :class="['thumb', { active: p.id === currentPageId }]"
      @click="$emit('selectPage', p.id)"
    >
      <img :src="thumbnails[p.id] || getThumbnail(p)" />
      <div>{{ p.id }}</div>
    </div>
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

    // 対象が画像のみの場合は画像の読込を待つ
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