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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import SubCategoryHeader from './SubCategoryHeader.vue';
import { eventBus } from './eventBus';
import proj4 from 'proj4';

// définit les systèmes de projection
proj4.defs([
  ['EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs'],
  ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
  ['EPSG:2154', '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs']
]);

const emit = defineEmits(['close', 'go-to-point']);

const pointX = ref('');
const pointY = ref('');
const selectedProjection = ref('EPSG:3857');
const projections = [
  { id: 'EPSG:3857', name: 'Web Mercator' },
  { id: 'EPSG:4326', name: 'WGS 84' },
  { id: 'EPSG:2154', name: 'Lambert 93' },
];

// converti les x et y en fonction du système de proj en entré et en sortie
function convertCoordinates(x, y, fromProjection, toProjection) {
  return proj4(fromProjection, toProjection, [x, y]);
}

// gestion du clique sur le bouton submit
function handleGoToPoint() {
  if (!pointX.value || !pointY.value) return;

  const point = {
    x: parseFloat(pointX.value),
    y: parseFloat(pointY.value),
    projection: selectedProjection.value
  };

  // convertion des x et y et affichage sur le form
  if (selectedProjection.value !== 'EPSG:3857') {
    const convertedCoords = convertCoordinates(point.x, point.y, selectedProjection.value, 'EPSG:3857');
    point.x = convertedCoords[0];
    point.y = convertedCoords[1];
    point.projection = 'EPSG:3857';
  }

  emit('go-to-point', point);
}

// gestion du clique sur la carte
function handleMapClick(coords) {
  // converti le x et y dans le bon système de proj sélectionné
  if (coords.projection !== selectedProjection.value) {
    const convertedCoords = convertCoordinates(coords.x, coords.y, coords.projection, selectedProjection.value);
    coords.x = convertedCoords[0];
    coords.y = convertedCoords[1];
    coords.projection = selectedProjection.value;
  }

  pointX.value = Math.round(coords.x * 100) / 100;
  pointY.value = Math.round(coords.y * 100) / 100;
  selectedProjection.value = coords.projection;
}

// mise à jour des x et y lorsque le système de proj change
watch(selectedProjection, (newProjection, oldProjection) => {
  if (pointX.value && pointY.value && newProjection !== oldProjection) {
    const convertedCoords = convertCoordinates(pointX.value, pointY.value, oldProjection, newProjection);
    pointX.value = Math.round(convertedCoords[0] * 100) / 100;
    pointY.value = Math.round(convertedCoords[1] * 100) / 100;
  }
});

// monte le bus d'événement
onMounted(() => {
  eventBus.on('map-clicked', handleMapClick);
});

// démonte le bus d'évenement pour eviter les fuites de mémoire
onUnmounted(() => {
  eventBus.off('map-clicked', handleMapClick);
});
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