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
import config from '@/config'

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

import GeoJSON from 'ol/format/GeoJSON'
import Polygon from 'ol/geom/Polygon.js'

import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Icon, Stroke, Fill, Text } from 'ol/style'
import { bbox as bboxStrategy } from 'ol/loadingstrategy'
import { getMaxZoom, createWmtsSource, initLayers } from './composable/getWMTS'
import { defaults as defaultControls } from 'ol/control'

import {
  layers_carto,
  layers_carto_monde,
  layers_photo,
  layers_photo_monde,
  otherLayersCartoFrance,
  otherLayersCartoMonde,
} from './composable/baseMap'

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

const vectorPinSource = ref(null)
const vectorWfsSource = ref(null)
const vectorGeomSource = ref(null)
const geomLayer = ref(null)
const vectorScanSource = ref(null)
const scanLayer = ref(null)

// layers cartothèque france
const vectorCommunesSource = ref(null)
const communesLayer = ref(null)
const vectorDepartmentsSource = ref(null)
const departmentsLayer = ref(null)

// layers cartothèque etranger
const vectorFeuilleSource = ref(null)
const feuilleLayer = ref(null)
const vectorPaysSource = ref(null)
const paysLayer = ref(null)

let layers = ref(layers_carto)
const communesLayerManuallyActivated = ref(false)
const otherLayers = ref(otherLayersCartoFrance)

const vectorLayers = ref(null)

function getLayersActiveTab() {
  if (activeTab.value === 'cartotheque') {
    return layers_carto
  } else if (activeTab.value === 'cartotheque_etranger') {
    return layers_carto_monde
  } else if (activeTab.value === 'phototheque') {
    return layers_photo
  } else if (activeTab.value === 'phototheque_etranger') {
    return layers_photo_monde
  } else {
    return []
  }
}

function getOtherLayers() {
  switch (activeTab.value) {
    case 'cartotheque':
      return otherLayersCartoFrance
    case 'cartotheque_etranger':
      return otherLayersCartoMonde
    default:
      return otherLayersCartoFrance
  }
}

function hideOtherLayers() {
  departmentsLayer.value.setVisible(false)
  feuilleLayer.value.setVisible(false)
  otherLayers.value.forEach((layers) => (layers.visible = false))
}

watch(activeTab, (newValue) => {
  const newLayers = getLayersActiveTab()
  layers.value = newLayers

  otherLayers.value = getOtherLayers()
  hideOtherLayers()

  if (olMap.value) {
    const mapLayers = olMap.value.getLayers()
    const wmtsLayers = mapLayers.getArray().filter((layer) => layer instanceof TileLayer)

    // met à jour les wmts
    wmtsLayers.forEach((layer, index) => {
      if (index < newLayers.length) {
        // Créer une nouvelle source pour cette couche
        const newSource = createWmtsSource(newLayers[index].id)

        // defined source
        layer.setSource(newSource)

        // défini la visilibité de l'index 0
        layer.setVisible(index === 0)
      }
    })

    if (newLayers.length > wmtsLayers.length) {
      const layersToAdd = newLayers.slice(wmtsLayers.length).map((layer, index) => {
        return new TileLayer({
          source: createWmtsSource(layer.id),
          visible: wmtsLayers.length + index === 0,
        })
      })

      layersToAdd.forEach((layer) => olMap.value.addLayer(layer))
    }

    scanStore.resetCriteria()

    // reset l'index à 0
    activeLayerIndex.value = 0
  }
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
  vectorPinSource.value.addFeature(feature)
}

function Add_new_polygone_to_map(tab) {
  // Prend un tableau en parametre et l'affiche sur la carte
  const polygon = new Feature({
    geometry: new Polygon([tab]),
  })

  vectorGeomSource.value.addFeature(polygon)
}

  async function parcour_tab_and_map(url) {
    //Parcour le tableau et envoie les deltas convertis sous forme de tableau dans Add_new_polygone_to_map
    try {
      console.log("url : "+url)
      const tab_test = await parcour_txt_to_tab(url);

      if (!tab_test || tab_test.length === 0) {
        throw new Error("Le tableau récupéré est vide ou invalide.");
      }

      console.log("Tab test récupéré :", tab_test);
      let elem, i, i2, x, y, x_3857, y3857, tab_points_3857
      for (i = 0; i < tab_test.length; i++) {
        if (tab_test[i][0] == 'Centre Actif') {
          //"Centre Actif"
          x = tab_test[i][1];
          y = tab_test[i][2];
          [x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857');
          addPointToMap(x_3857, y3857);
        } else {
          //"Cliche Actif"
          elem = tab_test[i];
          tab_points_3857 = [];
          for (i2 = 3; i2 < elem.length; i2 = i2 + 2) {
            //Commence a 3 car en 0 il y a le type d'image et en 1 et 2 il y a le point d'origine
            x = elem[i2];
            y = elem[i2 + 1];
            [x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857');
            //addPointToMap(x_3857, y3857);
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
  if (layer.id === 'departements' && departmentsLayer.value) {
    const isVisible = departmentsLayer.value.getVisible()
    departmentsLayer.value.setVisible(!isVisible)
  }
  if (layer.id === 'feuilles' && feuilleLayer.value) {
    const isVisible = feuilleLayer.value.getVisible()
    feuilleLayer.value.setVisible(!isVisible)
  }
  if (layer.id === 'pays' && paysLayer.value) {
    const isVisible = paysLayer.value.getVisible()
    paysLayer.value.setVisible(!isVisible)
  } else if (layer.id === 'communes' && communesLayer.value) {
    communesLayerManuallyActivated.value = !communesLayerManuallyActivated.value
    const shouldBeVisible = communesLayerManuallyActivated.value && currentZoom.value >= 12
    communesLayer.value.setVisible(shouldBeVisible)
  }
}

function changeActiveLayer(index) {
  activeLayerIndex.value = index

  if (olMap.value) {
    // recup les wmts layers
    const wmtsLayers = olMap.value
      .getLayers()
      .getArray()
      .filter((layer) => layer instanceof TileLayer)

    // masque les wmts
    wmtsLayers.forEach((layer, layerIndex) => {
      layer.setVisible(layerIndex === index)
    })

    // met à jour le setzoom
    if (olView.value) {
      olView.value.setMaxZoom(getMaxZoom(layers.value[index].id))
    }
  }
}

onMounted(() => {
  nextTick(() => {
    const wmtsLayers = layers.value.map((layer, index) => {
      const wmtsSource = createWmtsSource(layer.id)
      return new TileLayer({
        source: wmtsSource,
        visible: index === activeLayerIndex.value,
      })
    })

    vectorWfsSource.value = new VectorSource({
      format: new GeoJSON(),
      strategy: bboxStrategy,
    })

    const wfsLayer = new VectorLayer({
      source: vectorWfsSource.value,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 0.5,
        }),
      }),
    })

    vectorFeuilleSource.value = new VectorSource({
      url: (extent) => {
        const bbox = extent.join(',')
        return `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=feuillesmonde&outputFormat=application/json&srsName=EPSG:3857`
      },
      format: new GeoJSON(),
      strategy: bboxStrategy,
    })

    feuilleLayer.value = new VectorLayer({
      source: vectorFeuilleSource.value,
      visible: false,
      style: function (feature) {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.2)',
          }),
          text: new Text({
            text: feature.get('NUMERO'),
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
          }),
        })
      },
    })

    vectorCommunesSource.value = new VectorSource({
      url: (extent) => {
        const bbox = extent.join(',')
        return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:COMMUNESLambert93&outputFormat=application/json&srsName=EPSG:3857&bbox=${bbox},EPSG:3857`
      },
      format: new GeoJSON(),
      strategy: bboxStrategy,
    })

    communesLayer.value = new VectorLayer({
      source: vectorCommunesSource.value,
      visible: false,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(200, 200, 200, 0.5)',
        }),
      }),
    })

    watch(currentZoom, (newZoom) => {
      if (communesLayer.value && communesLayerManuallyActivated.value) {
        const shouldBeVisible = newZoom >= 12
        communesLayer.value.setVisible(shouldBeVisible)
      }
    })

    vectorDepartmentsSource.value = new VectorSource({
      url: (extent) => {
        const bbox = extent.join(',')
        return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:departements&outputFormat=application/json&srsName=EPSG:3857&bbox=${bbox},EPSG:3857`
      },
      format: new GeoJSON(),
      strategy: bboxStrategy,
    })

    departmentsLayer.value = new VectorLayer({
      source: vectorDepartmentsSource.value,
      visible: false,
      style: function (feature) {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.2)',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 0, 0.1)',
          }),
          text: new Text({
            text: feature.get('CODE_DEPT'),
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
          }),
        })
      },
    })

    vectorPaysSource.value = new VectorSource({
      url: (extent) => {
        const bbox = extent.join(',')
        return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:pays&outputFormat=application/json&bbox=${bbox},EPSG:3857`
      },
      format: new GeoJSON(),
      strategy: bboxStrategy,
    })

    paysLayer.value = new VectorLayer({
      source: vectorPaysSource.value,
      visible: false,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 255, 0, 0.1)',
        }),
      }),
    })

    vectorPinSource.value = new VectorSource()

    const pinLayer = new VectorLayer({
      source: vectorPinSource.value,
      style: new Style({
        image: new Icon({
          src: markerIcon,
          scale: 0.05,
          anchor: [0.5, 1],
        }),
      }),
    })

    /***************************************** Create source and layer for geom selected ******************************* */
    vectorGeomSource.value = new VectorSource()

    geomLayer.value = new VectorLayer({
      source: vectorGeomSource.value,
      style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
      }),
    })

    /***************************************** Create source and layer for scan selected ******************************* */
    vectorScanSource.value = new VectorSource()

    scanLayer.value = new VectorLayer({
      source: vectorScanSource.value,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.5)',
        }),
      }),
    })

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
        wfsLayer,
        pinLayer,
        geomLayer.value,
        scanLayer.value,
        communesLayer.value,
        departmentsLayer.value,
        feuilleLayer.value,
        paysLayer.value,
      ],
      view: view,
      controls: defaultControls({ zoom: false, rotate: false }),
    })

    // Gestionnaire d'événements de clic
    olMap.value.on('click', (event) => {
      parcour_tab_and_map("./1000_AERODROME CREIL_C_100.txt");
      const clickedCoord = olMap.value.getCoordinateFromPixel(event.pixel)
      if (showPin.value) {
        vectorPinSource.value.clear()

        const feature = new Feature({
          geometry: new Point(clickedCoord),
        })
        vectorPinSource.value.addFeature(feature)

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
        vectorPinSource.value.clear()
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
      vectorPinSource.value.clear()
      const feature = new Feature({
        geometry: new Point([x, y]),
      })
      vectorPinSource.value.addFeature(feature)
      pins.value = [[x, y]]
    })

    watch(activeSubCategory, (newValue) => {
      if (newValue === null && olMap.value) {
        vectorPinSource.value.clear()
        vectorWfsSource.value.clear()
        vectorWfsSource.value.setUrl('')
        vectorGeomSource.value.clear()
        vectorScanSource.value.clear()
        scanStore.updateSelectedGeom([])
      }
    })

    watch(storeURL, async (newValue) => {
      console.log('--------- REQUETE GEOSERVER --------')
      console.log('NEW URL:', newValue)
      vectorGeomSource.value.clear()
      vectorScanSource.value.clear()

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

        vectorGeomSource.value.addFeature(polygon)

        const extent = polygon.getGeometry().getExtent()

        olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50 + 400],
          minResolution: 200,
          duration: 2_000,
        })
      }

      vectorWfsSource.value.setUrl(newValue)
      vectorWfsSource.value.refresh()

      await scanStore.storeGet(newValue)
    })

    watch(storeSelectedScan, (newValue) => {
      console.log('----------- NEW SCAN SELECTED -------------')

      vectorScanSource.value.clear()
      if (
        storeSelectedScan.value &&
        storeSelectedScan.value.geom &&
        storeSelectedScan.value.geom.length > 0
      ) {
        const polygon = new Feature({
          geometry: new Polygon([storeSelectedScan.value.geom[0]]),
        })

        vectorScanSource.value.addFeature(polygon)

        const extent = polygon.getGeometry().getExtent()

        olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50 + 400],
          duration: 1_000,
        })
      }
    })

    eventBus.on('criteria-reset', () => {
      if (vectorPinSource.value) {
        vectorPinSource.value.clear()
      }
      if (vectorWfsSource.value) {
        vectorWfsSource.value.clear()
        vectorWfsSource.value.setUrl('')
        olMap.value.removeLayer(wfsLayer)
      }
      if (vectorGeomSource.value) {
        vectorGeomSource.value.clear()
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
