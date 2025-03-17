<template>
  <div class="map-container">
    <SideMenu />
    <ol-map class="ol-map">
      <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
      />

      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>
    </ol-map>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import SideMenu from './SideMenu.vue'

const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)

onMounted(() => {
  // refresh pour le changement de state
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
  })
})
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 60px;
  left: 0;
  width: 100vw;
  height: calc(110vh - 60px);
  display: flex;
}

.ol-map {
  width: 100%;
  height: 100%;
  flex: 1;
}
</style>
