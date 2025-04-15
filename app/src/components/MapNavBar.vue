<template>
  <div class="map-navbar">
    <div class="territory-selector">
      <select v-model="selectedTerritory" @change="handleTerritoryChange" class="select-input">
        <option v-for="(data, territory) in territoires" :key="territory" :value="territory">
          {{ territory }}
        </option>
      </select>
    </div>

    <div class="divider"></div>

    <div class="info-container">
      <div class="info-box">
        <span class="info-label">Position</span>
        <span class="info-value">{{ formattedCoordinates }}</span>
      </div>

      <div class="info-box">
        <span class="info-label">Projection</span>
        <span class="info-value">{{ formattedProj }}</span>
      </div>
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
  return `${x.toFixed(2)}, ${y.toFixed(2)}`
})


const formattedProj = computed(() => {
  const proj = territoires[selectedTerritory.value].projection
  return `${proj}`
})
</script>

<style scoped>
.map-navbar {
  position: absolute;
  z-index: 10;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  padding: 7px 15px;
  gap: 12px;
  border: 1px solid rgba(200, 200, 200, 0.5);
}

.territory-selector {
  position: relative;
}

.select-input {
  appearance: none;
  background-color: white;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  padding: 5px 26px 5px 10px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s ease;
}

.select-input:hover {
  border-color: #7aa937;
}

.select-input:focus {
  outline: none;
  border-color: #7aa937;
  box-shadow: 0 0 0 1px rgba(122, 169, 55, 0.25);
}

.territory-selector::after {
  content: "▼";
  font-size: 8px;
  color: #666;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #e0e0e0;
  margin: 0 2px;
}

.info-container {
  display: flex;
  gap: 15px;
}

.info-box {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 10px;
  color: #7aa937;
  margin-bottom: 2px;
  font-weight: 500;
}

.info-value {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 12px;
  color: #333;
}
</style>
