<template>
  <div class="map-navbar">
    <select v-model="selectedTerritory" @change="handleTerritoryChange">
      <option v-for="(data, territory) in territoires" :key="territory" :value="territory">
        {{ territory }}
      </option>
    </select>

    <div class="coordinates">
      {{ formattedCoordinates }}
    </div>

    <select v-model="selectedProjection" @change="emitChange">
      <option v-for="projection in uniqueProjections" :key="projection" :value="projection">
        {{ projection }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { territoires } from './composable/getTerritoires'

const props = defineProps({
  coordinates: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
})

const emit = defineEmits(['update:territory', 'update:projection'])

const selectedTerritory = ref('Monde')
const selectedProjection = ref('EPSG:3857')

const emitChange = () => {
  emit('update:projection', selectedProjection.value)
}

const handleTerritoryChange = () => {
  const currentTerritory = territoires[selectedTerritory.value]
  if (currentTerritory) {
    selectedProjection.value = currentTerritory.projection || selectedProjection.value
    emit('update:territory', {
      name: selectedTerritory.value,
      lon: currentTerritory.lon,
      lat: currentTerritory.lat,
      zoom: currentTerritory.zoomLevel,
    })
  }
}

watch(selectedTerritory, (newTerritory) => {
  selectedProjection.value = territoires[newTerritory]?.projection || 'EPSG:3857'
  emitChange()
})

const uniqueProjections = computed(() => {
  const allProjections = Object.values(territoires).flatMap((territory) => territory.projection)
  return [...new Set(allProjections)]
})

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
  gap: 2rem;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
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
