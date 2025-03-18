<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par coordonnées" @close="$emit('close')" />
    <div class="search-form">
      <div class="form-group">
        <label for="point-x">Coordonnée X</label>
        <input id="point-x" v-model="pointX" type="number" placeholder="Ex: 260000" />
      </div>
      <div class="form-group">
        <label for="point-y">Coordonnée Y</label>
        <input id="point-y" v-model="pointY" type="number" placeholder="Ex: 6000000" />
      </div>
      <div class="form-group">
        <label for="projection">Système de projection</label>
        <select id="projection" v-model="selectedProjection">
          <option v-for="proj in projections" :key="proj.id" :value="proj.id">
            {{ proj.name }} ({{ proj.id }})
          </option>
        </select>
      </div>
      <button class="action-button" @click="handleGoToPoint">
        <i class="mdi mdi-crosshairs-gps"></i>
        Centrer sur ce point
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, onUnmounted } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import { eventBus } from './eventBus'

const emit = defineEmits(['close', 'go-to-point'])

const pointX = ref('')
const pointY = ref('')
const selectedProjection = ref('EPSG:3857')
const projections = [
  { id: 'EPSG:3857', name: 'Web Mercator' },
  { id: 'EPSG:4326', name: 'WGS 84' },
  { id: 'EPSG:2154', name: 'Lambert 93' },
]

function handleGoToPoint() {
  const point = {
    x: parseFloat(pointX.value),
    y: parseFloat(pointY.value),
    projection: selectedProjection.value
  }
  emit('go-to-point', point)
}

function handleMapClick(coords) {
  pointX.value = Math.round(coords.x * 100) / 100
  pointY.value = Math.round(coords.y * 100) / 100
  selectedProjection.value = coords.projection
}

onMounted(() => {
  eventBus.on('map-clicked', handleMapClick)
})

onUnmounted(() => {
  eventBus.off('map-clicked', handleMapClick)
})
</script>

<style scoped>
.sub-category-content {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.search-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-size: 14px;
  color: #555;
}
.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background-color: #739614;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
}
.action-button:hover {
  background-color: #5e7a10;
}
</style>