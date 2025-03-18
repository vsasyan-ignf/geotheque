<template>
  <div class="dropdown">
    <label for="option">{{ nameDropdown }}</label>
    <select id="option" v-model="selected">
      <option v-for="val in options" :key="val.id" :value="val.id">
        {{ val.name }} ({{ val.id }})
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps } from 'vue'

defineProps({
  nameDropdown: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: [
      { id: 'EPSG:3857', name: 'Web Mercator' },
      { id: 'EPSG:4326', name: 'WGS 84' },
      { id: 'EPSG:2154', name: 'Lambert 93' },
    ],
  },
})

const selected = ref('EPSG:3857')
</script>

<style scoped>
.dropdown {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dropdown label {
  font-size: 14px;
  color: #555;
}

.dropdown select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style>
