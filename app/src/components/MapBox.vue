<template>
  <div class="map-container">
    <SideMenu />
    <ol-map ref="mapRef" class="ol-map">
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
import { ref, onMounted, nextTick, provide } from 'vue'
import SideMenu from './SideMenu.vue'
import { eventBus } from './eventBus'
const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)
const mapRef = ref(null)

onMounted(() => {
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
    
    if (mapRef.value) {
      const olMap = mapRef.value.map
      
      if (olMap) {
        olMap.on('click', (event) => {
          const clickedCoord = olMap.getCoordinateFromPixel(event.pixel)
          
          eventBus.emit('map-clicked', {
            x: clickedCoord[0],
            y: clickedCoord[1],
            projection: projection.value
          })
        })
      }
    }
  })
})

provide('eventBus', eventBus)

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