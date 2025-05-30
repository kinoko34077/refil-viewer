// src/components/RefilContainer.vue
<template>
  <div class="viewer-container">
    <div class="top-bar">
      <button @click="prevPage">←</button>
      <span>Page {{ currentPage + 1 }} / {{ totalPages }}</span>
      <button @click="nextPage">→</button>
    </div>
    <div ref="viewerContainer" class="viewer-wrapper" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import RefilPDFViewer from '@/lib/RefilPDFViewer'
import yaml from 'js-yaml'

const viewerContainer = ref(null)
const viewer = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)

async function loadRefil() {
  const res = await fetch('/sample.refil')
  const text = await res.text()
  const refilData = yaml.load(text)
  totalPages.value = refilData.pages.length

  viewer.value = new RefilPDFViewer(viewerContainer.value, refilData)
  await viewer.value.init()
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    viewer.value.goToPage(currentPage.value)
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    viewer.value.goToPage(currentPage.value)
  }
}

onMounted(() => {
  loadRefil()
})
</script>

<style>
.viewer-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: #eee;
  font-weight: bold;
}

.viewer-wrapper {
  flex: 1;
  overflow: hidden;
}
</style>
