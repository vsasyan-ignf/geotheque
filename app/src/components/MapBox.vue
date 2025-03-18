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
      <ol-vector-layer>
        <ol-source-vector
          :url="url_test"
          :strategy="bbox"
          :format="GeoJSON"
          :projection="projection2"
          >
        </ol-source-vector>
      </ol-vector-layer>
    </ol-map>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick,inject } from 'vue'
import SideMenu from './SideMenu.vue'

const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const projection2 = ref('EPSG:2154')
const zoom = ref(6)
const rotation = ref(0)
const url_test = "http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter=BBOX(the_geom,541049.9501,6324734.1323,559394.8369,6334584.9543)%20AND%20DATE_PUB%3E2015"


const strategy = inject("ol-loadingstrategy");
const bbox = strategy.bbox;
const format = inject("ol-format");
const GeoJSON = new format.GeoJSON();

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
