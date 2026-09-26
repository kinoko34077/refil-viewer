<template>
  <div class="viewer-root" :class="[displayMode + '-mode']">
    <Sidebar
      v-show="showSidebar && loadState === 'ready'"
      :pages="refilData.pages"
      :currentPageId="currentPage?.id"
      @selectPage="selectPage"
    />
    <div class="viewer-column">
      <TopBar
        :pageNumber="refilData.pages.length > 0 ? pageIndex + 1 : 0"
        :totalPages="refilData.pages.length"
        :zoom="zoom"
        :displayMode="displayMode"
        :spreadMode="spreadMode"
        :sidebarVisible="showSidebar"
        @prev="prevPage"
        @next="nextPage"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @toggle-display="toggleDisplayMode"
        @toggle-sidebar="toggleSidebar"
      />

      <div v-if="loadState === 'loading'" class="viewer-status" role="status">
        Refil を読み込んでいます…
      </div>

      <div v-else-if="loadState === 'error'" class="viewer-status viewer-error" role="alert">
        <p>{{ loadError }}</p>
        <button type="button" @click="loadRefil">再試行</button>
      </div>

      <div v-else class="page-container" ref="containerRef" @scroll="handleScroll">
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
            <div v-if="currentPage" class="slide-page">
              <div class="page" :data-page-id="currentPage.id" :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }">
                <PageViewer :page="currentPage" />
              </div>
            </div>
          </div>
        </template>
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
import { chooseMostVisiblePageIndex, cycleDisplayMode } from './viewer-navigation.js'

const refilData = reactive({ pages: [] })
const currentPage = ref(null)
const pageIndex = ref(0)
const pageRefs = []
const containerRef = ref(null)

const urlParams = new URLSearchParams(window.location.search)
const fileUrl = urlParams.get('file')
const targetPageId = urlParams.get('page')
const zoom = ref(1)
const displayMode = ref('vertical') // 'vertical' | 'spread' | 'horizontal'
const spreadMode = ref(false)
const showSidebar = ref(true)
const loadState = ref('loading')
const loadError = ref('')

function setCurrentPageIndex(index) {
  if (refilData.pages.length === 0) {
    pageIndex.value = 0
    currentPage.value = null
    return
  }

  const normalizedIndex = Math.max(0, Math.min(index, refilData.pages.length - 1))
  pageIndex.value = normalizedIndex
  currentPage.value = refilData.pages[normalizedIndex]
}

async function setDisplayMode(mode) {
  displayMode.value = ['vertical', 'spread', 'horizontal'].includes(mode) ? mode : 'vertical'
  currentPage.value = refilData.pages[pageIndex.value] ?? null
  await nextTick()
  if (displayMode.value !== 'horizontal') {
    scrollToPage(pageIndex.value, 'auto')
  }
}

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

async function loadRefil() {
  loadState.value = 'loading'
  loadError.value = ''

  try {
    if (!fileUrl) {
      throw new Error('表示する .refil ファイルが指定されていません。URL の file パラメータを確認してください。')
    }

    const res = await fetch(fileUrl)
    if (!res.ok) {
      throw new Error(`Refil の読み込みに失敗しました (HTTP ${res.status})。`)
    }

    const yaml = await res.text()
    const json = jsyaml.load(yaml)
    if (!json || !Array.isArray(json.pages)) {
      throw new Error('Refil の pages 定義を読み取れませんでした。ファイル形式を確認してください。')
    }

    refilData.pages = json.pages
    const foundIndex = refilData.pages.findIndex((page) => page.id === targetPageId)
    setCurrentPageIndex(foundIndex >= 0 ? foundIndex : 0)
    loadState.value = 'ready'
    await nextTick()
    scrollToPage(pageIndex.value, 'auto')
  } catch (error) {
    console.error(error)
    refilData.pages = []
    setCurrentPageIndex(0)
    loadError.value = error instanceof Error ? error.message : String(error)
    loadState.value = 'error'
  }
}

onMounted(loadRefil)

function scrollToPage(index, behavior = 'smooth') {
  const el = pageRefs[index]
  if (el) el.scrollIntoView({ behavior, block: 'start' })
}

function handleScroll() {
  if (!containerRef.value || displayMode.value === 'horizontal' || refilData.pages.length === 0) {
    return
  }

  const viewportRect = containerRef.value.getBoundingClientRect()
  const pageRects = pageRefs
    .map((element, index) => {
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return { index, top: rect.top, bottom: rect.bottom }
    })
    .filter(Boolean)

  const newIndex = chooseMostVisiblePageIndex(
    pageRects,
    { top: viewportRect.top, bottom: viewportRect.bottom },
    pageIndex.value,
  )

  if (newIndex !== pageIndex.value) {
    setCurrentPageIndex(newIndex)
  }
}

function selectPage(id) {
  const idx = refilData.pages.findIndex((page) => page.id === id)
  if (idx >= 0) {
    setCurrentPageIndex(idx)
    if (displayMode.value !== 'horizontal') {
      scrollToPage(idx)
    }
  }
}

function prevPage() {
  if (pageIndex.value > 0) selectPage(refilData.pages[pageIndex.value - 1].id)
}

function nextPage() {
  if (pageIndex.value < refilData.pages.length - 1) {
    selectPage(refilData.pages[pageIndex.value + 1].id)
  }
}

function zoomIn() {
  zoom.value = Math.min(2, zoom.value + 0.1)
  nextTick(() => {
    if (displayMode.value !== 'horizontal') scrollToPage(pageIndex.value, 'auto')
  })
}

function zoomOut() {
  zoom.value = Math.max(0.5, zoom.value - 0.1)
  nextTick(() => {
    if (displayMode.value !== 'horizontal') scrollToPage(pageIndex.value, 'auto')
  })
}

function toggleDisplayMode() {
  setDisplayMode(cycleDisplayMode(displayMode.value))
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
  min-width: 0;
}
.viewer-status {
  flex: 1;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}
.viewer-error p {
  margin: 0;
  max-width: 40rem;
}
.viewer-error button {
  justify-self: center;
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
