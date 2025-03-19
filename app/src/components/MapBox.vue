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

      <ol-tile-layer
        v-for="(layer, index) in layers"
        :key="layer.id"
        :visible="index === activeLayerIndex"
      >
        <ol-source-wmts
          :url="getWmtsUrl(layer.id)"
          :matrixSet="matrixSet"
          :format="getFormatWmtsLayer(layer.id)"
          :layer="getWmtsLayerName(layer.id)"
          :projection="projection_wmts"
          crossOrigin="anonymous"
        />
      </ol-tile-layer>
      <ol-vector-layer>
        <ol-source-vector
          :url="url_test"
          :strategy="bbox"
          :format="GeoJSON"
          :projection="projection"
        >
        </ol-source-vector>
        <ol-style>
          <ol-style-stroke :color="'red'" :width="0.5" />
        </ol-style>
      </ol-vector-layer>
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
    <BasecardSwitcher
      :layers="layers"
      :activeLayerIndex="activeLayerIndex"
      @layer-change="changeActiveLayer"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, provide, inject } from 'vue'
import SideMenu from './SideMenu.vue'
import BasecardSwitcher from './BasecardSwitcher.vue'
import { eventBus } from './eventBus'
import markerIcon from '@/assets/marker-icon.svg'

import PlanIGN from '../assets/basecard/plan_ign.png'
import Ortho from '../assets/basecard/ortho.jpeg'
import BDParcellaire from '../assets/basecard/bdparcellaire.png'
import CartesIGN from '../assets/basecard/cartesign.jpg'
import Scan25 from '../assets/basecard/scan25.jpg'

const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)

// const url_test = "http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0"+
//  "&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter="+
//  "BBOX(the_geom,-9252.7093,6055896.5059,1179955.9877,7151272.0258)" +
//  "%20AND%20DATE_PUB%3E2015&srsName=EPSG:3857"

// dijon
let url_test =
  'http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter=BBOX(the_geom,843140.35,%206685531.64,867110.33%20,%206698674.47)' +
  '&srsName=EPSG:3857'

//   let url_test = "http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter=BBOX(the_geom,377195.39545374265, 6263514.003382056,380823.61150917073, 6266613.639401344)"
// +"&srsName=EPSG:3857"

console.log(url_test)

console.log('dddddddddddd')

const strategy = inject('ol-loadingstrategy')
const bbox = strategy.bbox
const format = inject('ol-format')
const GeoJSON = new format.GeoJSON()

const mapRef = ref(null)
const pins = ref([])
const showPin = ref(false)

const layers = ref([
  {
    id: 'plan',
    name: 'Plan IGN',
    thumbnail: PlanIGN,
  },
  {
    id: 'ortho',
    name: 'Ortho',
    thumbnail: Ortho,
  },
  {
    id: 'bdparcellaire',
    name: 'BDParcellaire',
    thumbnail: BDParcellaire,
  },
  {
    id: 'cartesign',
    name: 'Cartes IGN',
    thumbnail: CartesIGN,
  },
  {
    id: 'scan25',
    name: 'Scan25',
    thumbnail: Scan25,
  },
])

const activeLayerIndex = ref(0)

function changeActiveLayer(index) {
  activeLayerIndex.value = index

  // refresh la map en le settant en visible
  const olMap = mapRef.value?.map
  if (olMap) {
    olMap.getLayers().forEach((layer, idx) => {
      layer.setVisible(idx === index)
    })
  }
}

const matrixSet = ref('PM')
const projection_wmts = ref('EPSG:3857')

function getWmtsUrl(layerId) {
  if (layerId === 'cartesign' || layerId === 'scan25') {
    return `https://data.geopf.fr/private/wmts?apikey=ign_scan_ws&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`
  }
  return `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`
}

function getWmtsLayerName(layerId) {
  switch (layerId) {
    case 'plan':
      return 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2'
    case 'ortho':
      return 'ORTHOIMAGERY.ORTHOPHOTOS'
    case 'bdparcellaire':
      return 'CADASTRALPARCELS.PARCELS'
    case 'cartesign':
      return 'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    case 'scan25':
      return 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOUR'
    default:
      return ''
  }
}

function getFormatWmtsLayer(layerId) {
  switch (layerId) {
    case 'cartesign':
    case 'ortho':
    case 'scan25':
      return 'image/jpeg'
    case 'plan':
    case 'bdparcellaire':
      return 'image/png'
    default:
      return 'image/jpeg'
  }
}

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
