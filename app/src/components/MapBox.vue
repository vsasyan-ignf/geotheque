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

      <ol-tile-layer v-for="(layer, index) in layers" :key="layer.id" :visible="index === activeLayerIndex">
        <ol-source-osm />
      </ol-tile-layer>
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
import { ref, onMounted, nextTick, provide } from 'vue'
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
const mapRef = ref(null)
const pins = ref([])
const showPin = ref(false)

const layers = ref([
  {
    id: 'plan',
    name: 'Plan IGN',
    thumbnail: PlanIGN
  },
  {
    id: 'ortho',
    name: 'Ortho',
    thumbnail: Ortho
  },
  {
    id: 'bdparcellaire',
    name: 'BDParcellaire',
    thumbnail: BDParcellaire
  },
  {
    id: 'cartesign',
    name: 'Cartes IGN',
    thumbnail: CartesIGN
  },
  {
    id: 'scan25',
    name: 'Scan25',
    thumbnail: Scan25
  }
])

const activeLayerIndex = ref(0)

function changeActiveLayer(index) {
  activeLayerIndex.value = index
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