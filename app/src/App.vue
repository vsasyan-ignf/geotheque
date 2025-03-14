<script setup>
import { ref, onMounted, nextTick } from "vue";

const center = ref([40, 40]);
const projection = ref("EPSG:4326");
const zoom = ref(8);
const rotation = ref(0);

const currentCenter = ref(center.value);
const currentZoom = ref(zoom.value);
const currentRotation = ref(rotation.value);
const currentResolution = ref(0);

const isSidebarOpen = ref(false);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function resolutionChanged(event) {
  currentResolution.value = event.target.getResolution();
  currentZoom.value = event.target.getZoom();
}

function centerChanged(event) {
  currentCenter.value = event.target.getCenter();
}

function rotationChanged(event) {
  currentRotation.value = event.target.getRotation();
}

onMounted(() => {
  // refresh le state pour le resize de la map
  nextTick(() => {
    window.dispatchEvent(new Event("resize"));
  });
});
</script>

<template>
<button
    class="toggle-button"
    :class="{ 'button-shift': isSidebarOpen }"
    @click="toggleSidebar"
  >    ☰
  </button>

  <div :class="['sidebar', { open: isSidebarOpen }]">
    <h2>Ecureil Force</h2>
    <p>Mon contenue info</p>
  </div>

  <div class="map-container" :class="{ 'map-shift': isSidebarOpen }">
    <ol-map class="ol-map">
      <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
        @change:center="centerChanged"
        @change:resolution="resolutionChanged"
        @change:rotation="rotationChanged"
      />
      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>
    </ol-map>
  </div>
</template>

<style scoped>

.toggle-button {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #333;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s ease;
}

.toggle-button.button-shift {
  transform: translateX(250px);
}

.sidebar {
  position: absolute;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100vh;
  background-color: #444;
  color: white;
  padding: 20px;
  transition: left 0.3s ease;
  z-index: 5;
}

.sidebar.open {
  left: 0;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  transition: width 0.3s ease;
}

.map-container.map-shift {
  width: calc(100vw);
}

.map-container:not(.map-shift) {
  width: 100vw;
}

.ol-map {
  width: 100%;
  height: 100%;
}
</style>

