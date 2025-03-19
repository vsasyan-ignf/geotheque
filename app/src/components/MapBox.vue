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
import proj4 from 'proj4'

proj4.defs([
  [
    'EPSG:3857',
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs',
  ],
  [
    'EPSG:2154',
    '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  ],
])

const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')

const projection2 = ref('EPSG:2154')
const zoom = ref(6)
const rotation = ref(0)
const url_test = "http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0"+
 "&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter="+
 "BBOX(the_geom,-9252.7093,6055896.5059,1179955.9877,7151272.0258)" +
 "%20AND%20DATE_PUB%3E2015"




const strategy = inject("ol-loadingstrategy");
const bbox = strategy.bbox;
bbox = bbox.proj4(projection,projection2);
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
