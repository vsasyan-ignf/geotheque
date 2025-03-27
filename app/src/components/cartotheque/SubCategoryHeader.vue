<!-- en tete de chaque tabs -->

<template>
  <div class="sub-category-header">
    <button class="back-button" @click="$emit('close')">
      <SvgIcon :path="mdiArrowLeft" type="mdi" class="mdi" />
    </button>
    <h4>{{ title }}</h4>
  </div>
</template>

<script setup>
import { mdiArrowLeft } from '@mdi/js'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.sub-category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.sub-category-header h4 {
  font-size: 18px;
  color: #739614;
  margin: 0;
}

.back-button {
  background: none;
  border: none;
  color: #739614;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
}

.back-button:hover {
  transform: scale(1.1);
}
</style>
