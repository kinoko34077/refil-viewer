// App.vue（変更あり: 各ページに data-page-id を追加）
<template>
  <div class="viewer-root">
    <Sidebar :pages="refilData.pages" :currentPageId="currentPage?.id" @selectPage="selectPage" />
    <div class="viewer-column">
      <TopBar :pageNumber="pageIndex + 1" :totalPages="refilData.pages.length" @prev="prevPage" @next="nextPage" />
      <div class="page-container" ref="containerRef" @scroll="handleScroll">
        <div v-for="(page, idx) in refilData.pages" :key="page.id" :ref="el => pageRefs[idx] = el" class="page" :data-page-id="page.id">
          <PageViewer :page="page" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import PageViewer from './components/PageViewer.vue'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import * as jsyaml from 'js-yaml'

const refilData = reactive({ pages: [] })
const currentPage = ref(null)
const pageIndex = ref(0)
const pageRefs = []
const containerRef = ref(null)

const urlParams = new URLSearchParams(window.location.search)
const fileUrl = urlParams.get('file')
const targetPageId = urlParams.get('page')

onMounted(async () => {
  const res = await fetch(fileUrl)
  const yaml = await res.text()
  const json = jsyaml.load(yaml)
  refilData.pages = json.pages

  const foundIndex = refilData.pages.findIndex(p => p.id === targetPageId)
  pageIndex.value = foundIndex >= 0 ? foundIndex : 0
  currentPage.value = refilData.pages[pageIndex.value]
  await nextTick()
  scrollToPage(pageIndex.value)
})

function scrollToPage(index) {
  const el = pageRefs[index]
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function handleScroll() {
  const top = containerRef.value.scrollTop
  const pageHeight = containerRef.value.clientHeight
  const newIndex = Math.round(top / pageHeight)
  if (newIndex !== pageIndex.value) {
    pageIndex.value = newIndex
    currentPage.value = refilData.pages[newIndex]
  }
}

function selectPage(id) {
  const idx = refilData.pages.findIndex(p => p.id === id)
  if (idx >= 0) {
    pageIndex.value = idx
    currentPage.value = refilData.pages[idx]
    scrollToPage(idx)
  }
}

function prevPage() {
  if (pageIndex.value > 0) selectPage(refilData.pages[pageIndex.value - 1].id)
}
function nextPage() {
  if (pageIndex.value < refilData.pages.length - 1)
    selectPage(refilData.pages[pageIndex.value + 1].id)
}
</script>

<style>
.viewer-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
}
.viewer-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.page-container {
  flex: 1;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}
.page {
  scroll-snap-align: start;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
</style>
