// ファイル2: RefilLoader.vue
<template>
  <div v-if="!refilData">Loading...</div>
  <div v-else>
    <PageViewer :page="currentPage" :key="currentPage.id" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageViewer from './PageViewer.vue'
import * as jsyaml from 'js-yaml' // ← これを追加！

const refilData = ref(null)
const currentPage = ref(null)

const urlParams = new URLSearchParams(window.location.search)
const fileUrl = urlParams.get('file')
const targetPage = urlParams.get('page')

onMounted(async () => {
  const res = await fetch(fileUrl)
  const yaml = await res.text()
  const json = jsyaml.load(yaml) // ← window.jsyaml → jsyaml に修正
  refilData.value = json

  const found = json.pages.find(p => p.id === targetPage) || json.pages[0]
  currentPage.value = found
})
</script>
