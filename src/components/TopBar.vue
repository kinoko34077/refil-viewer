// TopBar.vue（ボタン追加）
<template>
  <div class="topbar">
    <button @click="$emit('prev')">←</button>
    <span>{{ pageNumber }} / {{ totalPages }}</span>
    <button @click="$emit('next')">→</button>
    <button @click="$emit('zoom-out')">−</button>
    <button @click="$emit('zoom-in')">＋</button>
    <button @click="$emit('toggle-display')">🌓</button>
  </div>
</template>

<script setup>
const props = defineProps({ pageNumber: Number, totalPages: Number, zoom: Number, displayMode: String })
</script>

<style scoped>
.topbar {
  height: 40px;
  background: #eee;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
}
</style>
