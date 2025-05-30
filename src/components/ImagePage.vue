// ImagePage.vue（新規追加）
<template>
  <div class="image-wrapper">
    <img :src="src" :style="rotationStyle" />
  </div>
</template>

<script setup>
const props = defineProps({ src: String, rotate: Number })
const rotationStyle = {
  transform: `rotate(${props.rotate || 0}deg)`
}
</script>

<style scoped>
.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

img {
  max-width: 100%;
  max-height: 90vh;
  border: 1px solid #ccc;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>