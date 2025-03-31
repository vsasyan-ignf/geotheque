<template>
  <div class="map-container">
    <SideMenu @toggle-visibility="toggleLayerVisibility" />
    <div ref="mapElement" class="ol-map"></div>
    <BasecardSwitcher
      :layers="layers"
      :otherLayers="otherLayers"
      :activeLayerIndex="activeLayerIndex"
      :currentZoom="currentZoom"
      @layer-change="changeActiveLayer"
      @other-layer-toggle="handleOtherLayerToggle"
    />
    <ZoomControl />
    <VisibilitySwitch @toggle-visibility="toggleLayerVisibility" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, provide, watch } from 'vue'
import SideMenu from './SideMenu.vue'
import BasecardSwitcher from './BasecardSwitcher.vue'
import VisibilitySwitch from './VisibilitySwitch.vue'
import ZoomControl from './ZoomControl.vue'
import { eventBus } from './composable/eventBus'
import markerIcon from '@/assets/blue-marker.svg'
import { useScanStore } from './store/scan'
import { storeToRefs } from 'pinia'

import Map from 'ol/Map'
import View from 'ol/View'

import Polygon from 'ol/geom/Polygon.js'

import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { 
  getMaxZoom, 
  createInitialWMTSLayers, 
  updateWMTSLayers,
  changeActiveWMTSLayer, initLayers } from './composable/getWMTS'

import { defaults as defaultControls } from 'ol/control'
import { getLayersForActiveTab, getOtherLayersForActiveTab } from './composable/getActiveTab'

import {
  layers_carto,
  otherLayersCartoFrance,
} from './composable/baseMap'

import { createPinLayer, createGeomLayer, createScanLayer, createWFSLayer } from './composable/getVectorLayer'
//test
import { parcour_txt_to_tab } from './composable/parseTXT'
import { useConvertCoordinates } from './composable/convertCoordinates'
import MultiPolygon from 'ol/geom/MultiPolygon'

const scanStore = useScanStore()
const { storeURL, activeSubCategory, storeSelectedScan, storeSelectedGeom, activeTab } =
  storeToRefs(scanStore)

const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)

const mapElement = ref(null)
const olMap = ref(null)
const pins = ref([])
const showPin = ref(false)

const geomLayer = ref(null)

let layers = ref(layers_carto)
const communesLayerManuallyActivated = ref(false)
const otherLayers = ref(otherLayersCartoFrance)

const vectorLayers = ref({
  pin: null,
  geom: null,
  scan: null,
  emprises: null
})

const vectorOtherLayers = ref(null)

function getLayersActiveTab() {
  return getLayersForActiveTab(activeTab.value)
}

function getOtherLayers() {
  return getOtherLayersForActiveTab(activeTab.value)
}

function hideOtherLayers() {
  Object.values(vectorOtherLayers.value).forEach((layer) => {
    layer.setVisible(false);
  });
  otherLayers.value.forEach((layers) => (layers.visible = false))
}

watch(activeTab, (newValue) => {
  const newLayers = getLayersActiveTab()
  layers.value = newLayers
  otherLayers.value = getOtherLayers()
  hideOtherLayers()

  updateWMTSLayers(olMap.value, newLayers)

  scanStore.resetCriteria()
  
  // Reset l'index à 0
  activeLayerIndex.value = 0
})

const activeLayerIndex = ref(0)
const olView = ref(null)
const visibility_switch = ref(true)
const currentZoom = ref(zoom.value)

function toggleLayerVisibility(isVisible) {
  if (olMap.value) {
    const activeLayer = olMap.value.getLayers().getArray()[activeLayerIndex.value]
    if (activeLayer) {
      activeLayer.setVisible(isVisible)
      visibility_switch.value = isVisible
      console.log('Layer', activeLayerIndex.value, 'visibility set to', isVisible)
    }
  }
}

function addPointToMap(x, y) {
  //Prend un point en parametre et l'affiche sur la carte
  const coord = [x, y]
  const feature = new Feature({
    geometry: new Point(coord),
  })
  vectorLayers.value.pin.value.addFeature(feature)
}

function Add_new_polygone_to_map(tab) {
  // Prend un tableau en parametre et l'affiche sur la carte
  const polygon = new Feature({
    geometry: new Polygon([tab]),
  })

  vectorLayers.value.geom.getSource().addFeature(polygon)
}

async function parcour_tab_and_map(url) {
  //Parcour le tableau et envoie les deltas convertis sous forme de tableau dans Add_new_polygone_to_map
  try {
    const tab_test = await parcour_txt_to_tab(url)
    let elem, i, i2, x, y, x_3857, y3857, tab_points_3857
    for (i = 0; i < tab_test.length; i++) {
      if (tab_test[i][0] == 'Centre Actif') {
        //"Centre Actif"
        x = tab_test[i][1]
        y = tab_test[i][2]
        ;[x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857')
        addPointToMap(x_3857, y3857)
      } else {
        //"Cliche Actif"
        elem = tab_test[i]
        tab_points_3857 = []
        for (i2 = 3; i2 < elem.length; i2 = i2 + 2) {
          //Commence a 3 car en 0 il y a le type d'image et en 1 et 2 il y a le point d'origine
          x = elem[i2]
          y = elem[i2 + 1]
          ;[x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857')
          tab_points_3857.push([x_3857, y3857])
        }
        Add_new_polygone_to_map(tab_points_3857)
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error)
  }
}

function handleOtherLayerToggle(layer) {

  if (layer.id === 'communes' && vectorOtherLayers.value?.communes) {
    communesLayerManuallyActivated.value = !communesLayerManuallyActivated.value
    const shouldBeVisible = communesLayerManuallyActivated.value && currentZoom.value >= 12
    vectorOtherLayers.value?.communes.setVisible(shouldBeVisible)
  }
  else if (vectorOtherLayers.value?.[layer.id]){
    const isVisible = vectorOtherLayers.value?.[layer.id].getVisible()
    vectorOtherLayers.value?.[layer.id].setVisible(!isVisible)

  }

}

function changeActiveLayer(index) {
  activeLayerIndex.value = index
  changeActiveWMTSLayer(olMap.value, olView.value, layers.value, index)
}

onMounted(() => {
  nextTick(() => {
    const wmtsLayers = createInitialWMTSLayers(layers.value, activeLayerIndex.value)

    vectorLayers.value = {
      pin: createPinLayer(markerIcon),
      geom: createGeomLayer(),
      scan: createScanLayer(),
      emprises: createWFSLayer(),
    }

    vectorOtherLayers.value = initLayers();

    watch(currentZoom, (newZoom) => {
      if (vectorOtherLayers.value?.communes && communesLayerManuallyActivated.value) {
        const shouldBeVisible = newZoom >= 12
        vectorOtherLayers.value?.communes.setVisible(shouldBeVisible)
      }
    })

    /***************************************** Create source and layer for scan selected ******************************* */

    const view = new View({
      center: center.value,
      zoom: zoom.value,
      projection: projection.value,
      rotation: rotation.value,
      maxZoom: getMaxZoom(layers.value[activeLayerIndex.value].id),
    })

    olView.value = view

    olView.value.on('change:resolution', () => {
      currentZoom.value = Math.round(olView.value.getZoom())
    })

    olMap.value = new Map({
      target: mapElement.value,
      layers: [
        ...wmtsLayers,
        vectorLayers.value.emprises,
        vectorLayers.value.pin,
        vectorLayers.value.geom,
        vectorLayers.value.scan,
        ...Object.values(vectorOtherLayers.value)
      ],
      view: view,
      controls: defaultControls({ zoom: false, rotate: false }),
    })

    // Gestionnaire d'événements de clic
    olMap.value.on('click', (event) => {
      const clickedCoord = olMap.value.getCoordinateFromPixel(event.pixel)
      if (showPin.value) {
        vectorLayers.value.pin.getSource().clear()

        const feature = new Feature({
          geometry: new Point(clickedCoord),
        })
        vectorLayers.value.pin.getSource().addFeature(feature)

        pins.value = [clickedCoord]
      }

      eventBus.emit('map-clicked', {
        x: clickedCoord[0],
        y: clickedCoord[1],
        projection: projection.value,
      })
    })

    olMap.value.getView().on('change:extent', () => {
      vectorCommunesSource.value.refresh()
    })

    // Écouter les événements du bus
    eventBus.on('toggle-pin', (isVisible) => {
      showPin.value = isVisible
      if (!isVisible) {
        vectorLayers.value.pin.getSource().clear()
        pins.value = []
      }
    })

    eventBus.on('map-zoom', (delta) => {
      if (olMap.value && olView.value) {
        const currentZoom = olView.value.getZoom()
        olView.value.animate({
          zoom: currentZoom + delta,
          duration: 250,
        })
      }
    })

    eventBus.on('center-map', ({ x, y }) => {
      if (olMap.value && olView.value) {
        olView.value.animate({
          center: [x, y],
          duration: 750,
        })
      }
    })

    eventBus.on('update-coordinates', ({ x, y }) => {
      vectorLayers.value.pin.getSource().clear()
      const feature = new Feature({
        geometry: new Point([x, y]),
      })
      vectorLayers.value.pin.value.addFeature(feature)
      pins.value = [[x, y]]
    })

    watch(activeSubCategory, (newValue) => {
      if (newValue === null && olMap.value) {
        vectorLayers.value.pin.getSource().clear()
        vectorLayers.value.emprises.getSource().clear()
        vectorLayers.value.emprises.getSource().setUrl('')
        vectorLayers.value.geom.getSource().clear()
        vectorLayers.value.scan.getSource().clear()
        scanStore.updateSelectedGeom([])
      }
    })

    watch(storeURL, async (newValue) => {
      console.log('--------- REQUETE GEOSERVER --------')
      console.log('NEW URL:', newValue)
      vectorLayers.value.geom.getSource().clear()
      vectorLayers.value.scan.getSource().clear()

      if (storeSelectedGeom.value.length !== 0) {
        let polygon = null
        if (storeSelectedGeom.value[0].length === 2) {
          polygon = new Feature({
            geometry: new Polygon([storeSelectedGeom.value]),
          })
        } else {
          polygon = new Feature({
            geometry: new MultiPolygon([storeSelectedGeom.value]),
          })
        }

        vectorLayers.value.geom.getSource().addFeature(polygon)

        const extent = polygon.getGeometry().getExtent()

        olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50 + 400],
          minResolution: 200,
          duration: 2_000,
        })
      }

      vectorLayers.value.emprises.getSource().setUrl(newValue)
      vectorLayers.value.emprises.getSource().refresh()

      await scanStore.storeGet(newValue)
    })

    watch(storeSelectedScan, (newValue) => {
      console.log('----------- NEW SCAN SELECTED -------------')

      vectorLayers.value.scan.getSource().clear()
      if (
        storeSelectedScan.value &&
        storeSelectedScan.value.geom &&
        storeSelectedScan.value.geom.length > 0
      ) {
        const polygon = new Feature({
          geometry: new Polygon([storeSelectedScan.value.geom[0]]),
        })

        vectorLayers.value.scan.getSource().addFeature(polygon)

        const extent = polygon.getGeometry().getExtent()

        olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50 + 400],
          duration: 1_000,
        })
      }
    })

    eventBus.on('criteria-reset', () => {
      if (vectorLayers.value.pin.value) {
        vectorLayers.value.pin.getSource().clear()
      }
      if (vectorLayers.value.emprises.getSource()) {
        vectorLayers.value.emprises.getSource().clear()
        vectorLayers.value.emprises.getSource().setUrl('')
        olMap.value.removeLayer(vectorLayers.value.emprises)
      }
      if (vectorLayers.value.geom) {
        vectorLayers.value.geom.getSource().clear()
        olMap.value.removeLayer(geomLayer)
      }
    })

    window.dispatchEvent(new Event('resize'))
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
