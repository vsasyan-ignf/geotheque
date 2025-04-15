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


    <div class="coordinates">
      {{ formattedProj }}
    </div>


  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { territoires } from './composable/getTerritoires'
import { useScanStore } from './store/scan'
import { storeToRefs } from 'pinia'

const props = defineProps({
  coordinates: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  territoryName: {
    type: String,
    default: 'Metropole'
  }
})

const emit = defineEmits(['update:territory', 'update:projection'])

const selectedProjection = ref('EPSG:3857')
const selectedTerritory = ref(props.territoryName)

const scanStore = useScanStore()
const { activeTab } = storeToRefs(scanStore)


watch(activeTab, (newVal) => {
  selectedTerritory.value = newVal.includes('etranger') ? 'Monde' : 'Metropole'
})

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
      zoom: currentTerritory.zoom,
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


const formattedProj = computed(() => {
  const proj = territoires[selectedTerritory.value].projection
  return `Projection : ${proj}`
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
