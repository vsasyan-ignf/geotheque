<template>
  <div class="map-navbar">
    <select v-model="selectedTerritory" @change="emitChange">
      <option value="france">France</option>
      <option value="guadeloupe">Guadeloupe</option>
      <option value="guyane">Guyane</option>
      <option value="martinique">Martinique</option>
      <option value="réunion">Réunion</option>
    </select>

    <div class="coordinates">
      {{ formattedCoordinates }}
    </div>

    <select v-model="selectedProjection" @change="emitChange">
      <option value="EPSG:4326">EPSG:4326 (WGS 84)</option>
      <option value="EPSG:3857">EPSG:3857 (Web Mercator)</option>
      <option value="EPSG:2154">EPSG:2154 (Lambert 93)</option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  coordinates: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
})

const emit = defineEmits(['update:territory', 'update:projection'])

const selectedTerritory = ref('france')
const selectedProjection = ref('EPSG:4326')

const emitChange = () => {
  emit('update:territory', selectedTerritory.value)
  emit('update:projection', selectedProjection.value)
}

const formattedCoordinates = computed(() => {
  const { x, y } = props.coordinates
  return `Position : ${x.toFixed(2)}, ${y.toFixed(2)}`
})
</script>

<style scoped>
.map-navbar {
  position: absolute;
  z-index: 10;
  bottom: 0;
  left: 30%;
  gap: 3rem;
  padding: 0.6rem;
  background: #f8f9fa;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  border-radius: 15px 15px 0 0;
}

select {
  padding: 0.3rem;
}

.coordinates {
  font-family: monospace;
  color: #555;
}
</style>
