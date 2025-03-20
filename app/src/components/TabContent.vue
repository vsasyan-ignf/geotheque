<!-- défini la structure de chaque tabs -->

<template>
  <div class="tab-content">
    <h3>{{ title }} <span class="close-button" @click="$emit('close')">×</span></h3>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.tab-content {
  padding: 15px;
  width: 400px;
  height: calc(100vh - 40px);
  overflow: auto;
}

.tab-content h3 {
  background-color: #739614;
  color: white;
  padding: 10.7px;
  margin: -15px -15px 15px -15px;
  font-size: 18px;
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-button {
  font-weight: bold;
  cursor: pointer;
}
</style>
