<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche de point" @close="$emit('close')" />

    <div class="search-mode-selector">
      <button
        :class="['mode-button', { active: searchMode === 'map' }]"
        @click="searchMode = 'map'"
      >
        <SvgIcon :path="mdiMapMarker" type="mdi" class="mdi" />
        Recherche sur la carte
      </button>
      <button
        :class="['mode-button', { active: searchMode === 'coords' }]"
        @click="searchMode = 'coords'"
      >
        <SvgIcon :path="mdiCrosshairsGps" type="mdi" class="mdi" />
        Recherche par coordonnées
      </button>
    </div>

    <div v-if="searchMode === 'coords'">
      <Accordeon title="Recherche par coordonnées" defaultOpen>
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
            <SvgIcon :path="mdiCrosshairsGps" type="mdi" class="mdi" />
            Centrer sur ce point
          </button>
        </div>
      </Accordeon>
    </div>

    <div v-if="searchMode === 'map'">
      <Accordeon title="Recherche sur la carte" defaultOpen>
        <div class="map-search-instructions">
          <SvgIcon :path="mdiInformationOutline" type="mdi" class="mdi" />
          <p>Cliquez sur la carte pour sélectionner un point.</p>

          <div v-if="pointX && pointY" class="selected-coordinates">
            <h4>Coordonnées sélectionnées</h4>
            <div class="coordinates-display">
              <div class="coordinate">
                <span>X:</span> <strong>{{ pointX }}</strong>
              </div>
              <div class="coordinate">
                <span>Y:</span> <strong>{{ pointY }}</strong>
              </div>
              <div class="coordinate">
                <span>Projection:</span> <strong>{{ selectedProjection }}</strong>
              </div>
            </div>
          </div>
        </div>
      </Accordeon>
    </div>

    <CartothequeSubMenu v-if="['cartotheque', 'cartotheque_etranger'].includes(activeTab)" />
    <PhotothequeSubMenu v-else-if="activeTab === 'phototheque'" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import { bboxState, eventBus } from '@/components/composable/eventBus'
import CartothequeSubMenu from '@/components/cartotheque/CartothequeSubMenu.vue'
import PhotothequeSubMenu from '@/components/phototheque/PhotothequeSubMenu.vue'
import Accordeon from '@/components/material/Accordeon.vue'
import { useConvertCoordinates } from '@/components/composable/convertCoordinates'
import { useScanStore } from '@/components/store/scan'
import { mdiInformationOutline, mdiCrosshairsGps, mdiMapMarker } from '@mdi/js'

import config from '@/config'

import { storeToRefs } from 'pinia'

const scanStore = useScanStore()

const { activeTab } = storeToRefs(scanStore)

const emit = defineEmits(['close', 'go-to-point'])

const searchMode = ref('map')

const pointX = ref('')
const pointY = ref('')

const init = computed(() => {
  return activeTab?.value.includes('etranger') ? 'EPSG:4326' : 'EPSG:2154'
})

const selectedProjection = ref(init.value)

const projections = [
  { id: 'EPSG:3857', name: 'Web Mercator' },
  { id: 'EPSG:4326', name: 'WGS 84' },
  { id: 'EPSG:2154', name: 'Lambert 93' },
]

async function fetchAndConvertBbox(longitude, latitude) {
  try {
    let url

    url = `${config.NOMINATIM_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&polygon_geojson=1&addressdetails=1&limit=1`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()

    const bbox = data.boundingbox

    const bboxWGS84 = [
      parseFloat(bbox[2]),
      parseFloat(bbox[0]),
      parseFloat(bbox[3]),
      parseFloat(bbox[1]),
    ]

    const southWest = useConvertCoordinates(bboxWGS84[0], bboxWGS84[1], 'EPSG:4326', 'EPSG:2154')
    const northEast = useConvertCoordinates(bboxWGS84[2], bboxWGS84[3], 'EPSG:4326', 'EPSG:2154')

    const bboxLambert93 = [southWest[0], southWest[1], northEast[0], northEast[1]]

    return {
      data,
      bboxWGS84,
      bboxLambert93,
    }
  } catch (error) {
    console.error('Erreur lors du géocodage inversé:', error)
    return null
  }
}

// gestion du clique sur le bouton submit
async function handleGoToPoint() {
  if (!pointX.value || !pointY.value) return

  const convertedCoord = useConvertCoordinates(
    parseFloat(pointX.value),
    parseFloat(pointY.value),
    selectedProjection.value,
    'EPSG:4326',
  )

  const point = {
    x: convertedCoord[0],
    y: convertedCoord[1],
  }

  const bboxResult = await fetchAndConvertBbox(point.x, point.y)

  if (bboxResult) {
    point.locationData = bboxResult.data
    point.bboxWGS84 = bboxResult.bboxWGS84
    point.bboxLambert93 = bboxResult.bboxLambert93
  }

  const mapCoords = useConvertCoordinates(
    parseFloat(pointX.value),
    parseFloat(pointY.value),
    selectedProjection.value,
    'EPSG:3857',
  )

  eventBus.emit('update-coordinates', { x: mapCoords[0], y: mapCoords[1] })
  eventBus.emit('center-map', { x: mapCoords[0], y: mapCoords[1] })

  emit('go-to-point', point)
}

// gestion du clique sur la carte
async function handleMapClick(coords) {
  // converti le x et y dans le bon système de proj sélectionné
  if (coords.projection !== selectedProjection.value) {
    const convertedCoords = useConvertCoordinates(
      coords.x,
      coords.y,
      coords.projection,
      selectedProjection.value,
    )
    coords.x = convertedCoords[0]
    coords.y = convertedCoords[1]
    coords.projection = selectedProjection.value
  }

  pointX.value = Math.round(coords.x * 100) / 100
  pointY.value = Math.round(coords.y * 100) / 100
  selectedProjection.value = coords.projection
  const convertedCoord = useConvertCoordinates(
    parseFloat(pointX.value),
    parseFloat(pointY.value),
    selectedProjection.value,
    'EPSG:4326',
  )

  const point = {
    x: convertedCoord[0],
    y: convertedCoord[1],
  }

  const bboxResult = await fetchAndConvertBbox(point.x, point.y)
  if (bboxResult) {
    point.locationData = bboxResult.data
    point.bboxWGS84 = bboxResult.bboxWGS84
    point.bboxLambert93 = bboxResult.bboxLambert93
  }

  bboxState.value = point.bboxLambert93

  emit('go-to-point', point)

  searchMode.value = 'map'
}

// mise à jour des x et y lorsque le système de proj change
watch(selectedProjection, (newProjection, oldProjection) => {
  console.log(newProjection, oldProjection)
  if (pointX.value && pointY.value && newProjection !== oldProjection) {
    const convertedCoords = useConvertCoordinates(
      pointX.value,
      pointY.value,
      oldProjection,
      newProjection,
    )
    pointX.value = Math.round(convertedCoords[0] * 100) / 100
    pointY.value = Math.round(convertedCoords[1] * 100) / 100
  }
})

// monte le bus d'événement
onMounted(() => {
  eventBus.on('map-clicked', handleMapClick)
  eventBus.emit('toggle-pin', true)
})

// démonte le bus d'évenement pour eviter les fuites de mémoire
onUnmounted(() => {
  eventBus.off('map-clicked', handleMapClick)
  eventBus.emit('toggle-pin', false)
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

.search-mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.mode-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background-color: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}
.mode-button .mdi {
  font-size: 24px;
  color: #666;
}
.mode-button.active {
  background-color: #e6f0d8;
  border-color: #739614;
}
.mode-button.active .mdi {
  color: #739614;
}
.mode-button:hover {
  background-color: #e6f0d8;
}

.map-search-instructions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: black;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
}
.map-search-instructions .mdi {
  font-size: 32px;
  color: #739614;
  margin-bottom: 10px;
}
.selected-coordinates {
  width: 100%;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}
.coordinates-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #eee;
}
.coordinate {
  display: flex;
  justify-content: space-between;
}
</style>
