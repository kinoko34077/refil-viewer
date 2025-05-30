<template>
  <div class="viewer-root" :class="[displayMode + '-mode']">
    <Sidebar
      v-show="showSidebar"
      :pages="refilData.pages"
      :currentPageId="currentPage?.id"
      @selectPage="selectPage"
    />
    <div class="viewer-column">
      <TopBar
        :pageNumber="pageIndex + 1"
        :totalPages="refilData.pages.length"
        :zoom="zoom"
        :displayMode="displayMode"
        :spreadMode="spreadMode"
        :sidebarVisible="showSidebar"
        @prev="prevPage"
        @next="nextPage"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @set-display-mode="setDisplayMode"
        @toggle-sidebar="toggleSidebar"
      />
      <div class="page-container" ref="containerRef">
        <template v-if="displayMode === 'vertical'">
          <div
            v-for="(page, idx) in refilData.pages"
            :key="page.id"
            :ref="el => pageRefs[idx] = el"
            class="page-wrapper"
            :style="{ height: `${100 * zoom}vh` }"
          >
            <div class="page" :data-page-id="page.id" :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }">
              <PageViewer :page="page" />
            </div>
          </div>
        </template>

        <template v-else-if="displayMode === 'spread'">
          <div class="spread-row" v-for="i in Math.ceil(refilData.pages.length / 2)" :key="i">
            <template v-for="j in [0, 1]">
              <div v-if="refilData.pages[i * 2 + j - 2]" class="spread-page">
                <div
                  :ref="el => pageRefs[i * 2 + j - 2] = el"
                  class="page-wrapper"
                  :style="{ width: `${50 * zoom}vw`, height: `${100 * zoom}vh` }"
                >
                  <div
                    class="page"
                    :data-page-id="refilData.pages[i * 2 + j - 2].id"
                    :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }"
                  >
                    <PageViewer :page="refilData.pages[i * 2 + j - 2]" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        <template v-else-if="displayMode === 'horizontal'">
          <div class="horizontal-slide-wrapper">
            <div class="slide-page">
              <div class="page" :data-page-id="refilData.pages[pageIndex].id" :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }">
                <PageViewer :page="refilData.pages[pageIndex]" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
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
const zoom = ref(1)
const pageIndex = ref(0)
const displayMode = ref('vertical') // 'vertical' | 'spread' | 'horizontal'
const spreadMode = ref(false)
const showSidebar = ref(true)

function setDisplayMode(mode) {
  displayMode.value = mode
  pageIndex.value = 0
}
function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

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

function zoomIn() { zoom.value = Math.min(2, zoom.value + 0.1) }
function zoomOut() { zoom.value = Math.max(0.5, zoom.value - 0.1) }
function toggleDisplayMode() {
  const modes = ['vertical', 'spread', 'horizontal']
  const i = modes.indexOf(displayMode.value)
  displayMode.value = modes[(i + 1) % modes.length]
  nextTick(() => scrollToPage(pageIndex.value))
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
.vertical-mode .page-container {
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}
.vertical-mode .page-wrapper {
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spread-mode .page-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.spread-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}
.spread-page {
  display: flex;
  justify-content: center;
}
.horizontal-mode .page-container {
  overflow: hidden;
  position: relative;
  height: 100vh;
}
.horizontal-slide-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide-page {
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-wrapper {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page {
  transition: transform 0.2s ease;
}
</style>
