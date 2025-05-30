// PDFPage.vue（修正版：CDN経由でworker指定）
<template>
  <div class="pdf-wrapper">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

const props = defineProps({ src: String, page: Number })
const emit = defineEmits(['page-ready'])
const canvasRef = ref(null)

onMounted(async () => {
  // ✅ CDNでworker指定（Viteのworkerバンドル問題回避）
  GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

  const loadingTask = getDocument(props.src)
  const pdf = await loadingTask.promise
  const pageNum = props.page || 1
  const pdfPage = await pdf.getPage(pageNum)

  const viewport = pdfPage.getViewport({ scale: 1.5 })
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  await pdfPage.render({ canvasContext: context, viewport }).promise
  emit('page-ready')
})
</script>

<style scoped>
.pdf-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
canvas {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>