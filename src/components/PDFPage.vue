<template>
  <div class="pdf-wrapper">
    <div v-if="loadState === 'loading'" class="pdf-status" role="status">
      PDF を読み込んでいます…
    </div>

    <div v-else-if="loadState === 'error'" class="pdf-status pdf-error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" @click="loadPdf">再試行</button>
    </div>

    <canvas ref="canvasRef" v-show="loadState === 'ready'"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { renderPdfPage } from '../pdf-page-loader.js'

const props = defineProps({ src: String, page: Number })
const emit = defineEmits(['page-ready'])
const canvasRef = ref(null)
const loadState = ref('loading')
const loadError = ref('')

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

async function loadPdf() {
  loadState.value = 'loading'
  loadError.value = ''

  try {
    await renderPdfPage({
      src: props.src,
      page: props.page,
      canvas: canvasRef.value,
      getDocument,
    })

    loadState.value = 'ready'
    emit('page-ready')
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : String(error)
    loadError.value = message || 'PDF の読み込みまたは描画に失敗しました。'
    loadState.value = 'error'
  }
}

onMounted(loadPdf)
</script>

<style scoped>
.pdf-wrapper {
  min-height: 8rem;
  display: grid;
  place-items: center;
}

.pdf-status {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.pdf-error p {
  margin: 0;
}

canvas {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>
