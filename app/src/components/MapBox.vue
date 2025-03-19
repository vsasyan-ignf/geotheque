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
      <ol-vector-layer>
        <ol-source-vector
          :url="url_test"
          :strategy="bbox"
          :format="GeoJSON"
          :projection="projection"
          >

      <ol-vector-layer>
        <ol-source-vector ref="pinSource">
          <ol-feature v-for="(pin, index) in pins" :key="index">
            <ol-geom-point :coordinates="pin" />
            <ol-style>
              <ol-style-icon :src="markerIcon" :scale="0.05" :anchor="[0.5, 1]" />
            </ol-style>
          </ol-feature>
        </ol-source-vector>
      </ol-vector-layer>
    </ol-map>
  </div>
</template>

<script setup>

import { ref, onMounted, nextTick, provide,inject } from 'vue'
import SideMenu from './SideMenu.vue'
import { eventBus } from './eventBus'
import markerIcon from '@/assets/marker-icon.svg'



const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)

const url_test = "http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0"+
 "&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter="+
 "BBOX(the_geom,-9252.7093,6055896.5059,1179955.9877,7151272.0258)" +
 "%20AND%20DATE_PUB%3E2015&srsName=EPSG:3857"

const strategy = inject("ol-loadingstrategy");
const bbox = strategy.bbox;
const format = inject("ol-format");
const GeoJSON = new format.GeoJSON();

const mapRef = ref(null)
const pins = ref([])
const showPin = ref(false)


onMounted(() => {
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))

    if (mapRef.value) {
      const olMap = mapRef.value.map

      olMap.on('click', (event) => {
        const clickedCoord = olMap.getCoordinateFromPixel(event.pixel)

        if (showPin.value) {
          pins.value = [clickedCoord]
        }

        eventBus.emit('map-clicked', {
          x: clickedCoord[0],
          y: clickedCoord[1],
          projection: projection.value,
        })
      })
    }

    eventBus.on('toggle-pin', (isVisible) => {
      showPin.value = isVisible
      if (!isVisible) {
        pins.value = []
      }
    })
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
  height: calc(100vh - 60px);
  display: flex;
}
.ol-map {
  width: 100%;
  height: 100%;
  flex: 1;
}
</style>
