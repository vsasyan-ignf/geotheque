<template>
  <div class="map-container">
    <SideMenu @toggle-visibility="toggleLayerVisibility"/>
    <div ref="mapElement" class="ol-map"></div>
    <BasecardSwitcher
      :layers="layers"
      :activeLayerIndex="activeLayerIndex"
      @layer-change="changeActiveLayer"
    />
    <ZoomControl/>
    <VisibilitySwitch
      @toggle-visibility="toggleLayerVisibility"
    />
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

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import GeoJSON from 'ol/format/GeoJSON';
import Polygon from 'ol/geom/Polygon.js';
import { get as getProjection } from 'ol/proj';
import { getTopLeft } from 'ol/extent';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { getWmtsUrl, getWmtsLayerName, getMaxZoom, getFormatWmtsLayer } from './composable/getWMTS'
import { defaults as defaultControls } from 'ol/control';
// Images pour les thumbnails
import PlanIGN from '@/assets/basecard/plan_ign.png'
import Ortho from '@/assets/basecard/ortho.jpeg'
import BDParcellaire from '@/assets/basecard/bdparcellaire.png'
import CartesIGN from '@/assets/basecard/cartesign.jpg'
import Scan25 from '@/assets/basecard/scan25.jpg'

const scanStore = useScanStore()

const { storeURL, storeCommuneContour, activeSubCategory, storeSelectedScan } = storeToRefs(scanStore);


const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)

// Références et états
const mapElement = ref(null);
const olMap = ref(null);
const pins = ref([]);
const showPin = ref(false);
const vectorPinSource = ref(null);
const vectorWfsSource = ref(null);
const vectorSource = ref(null);
const deptLayer = ref(null);
const vectorScanSource = ref(null)
const scanLayer = ref(null)

const url_test = ref(``);
const bbox = ref([0, 0, 0, 0]);

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

const activeLayerIndex = ref(0);
const olView = ref(null);
const visibility_switch = ref(true);

function toggleLayerVisibility(isVisible) {
  if (olMap.value) {
    const activeLayer = olMap.value.getLayers().getArray()[activeLayerIndex.value];
    if (activeLayer) {
      activeLayer.setVisible(isVisible);
      visibility_switch.value = isVisible;
      console.log("Layer", activeLayerIndex.value, "visibility set to", isVisible);
    }
  }
}

function changeActiveLayer(index) {
  activeLayerIndex.value = index

  if (olMap.value) {
    // Changement des couches WMTS uniquement
    const wmtsLayers = olMap.value.getLayers().getArray().slice(0, layers.value.length)
    wmtsLayers.forEach((layer, idx) => {
      if (visibility_switch.value === true) {
        layer.setVisible(idx === index);
      }
      
    });

    if (olView.value) {
      olView.value.setMaxZoom(getMaxZoom(layers.value[index].id))
    }
  }
}

function createWmtsSource(layerId) {
  const projObj = getProjection('EPSG:3857')
  const projExtent = projObj.getExtent()

  const resolutions = []
  const matrixIds = []

  const maxZoom = 19

  for (let i = 0; i <= maxZoom; i++) {
    matrixIds.push(i.toString())
    resolutions.push(156543.03392804097 / Math.pow(2, i))
  }

  const tileGrid = new WMTSTileGrid({
    origin: getTopLeft(projExtent),
    resolutions: resolutions,
    matrixIds: matrixIds,
  })

  return new WMTS({
    url: getWmtsUrl(layerId),
    layer: getWmtsLayerName(layerId),
    matrixSet: 'PM',
    format: getFormatWmtsLayer(layerId),
    projection: projObj,
    tileGrid: tileGrid,
    crossOrigin: 'anonymous',
  })
}

let idlayer
onMounted(() => {
  nextTick(() => {
    const wmtsLayers = layers.value.map((layer, index) => {
      const wmtsSource = createWmtsSource(layer.id);
      idlayer = layer.id;
      return new TileLayer({
        source: wmtsSource,
        visible: index === activeLayerIndex.value,
      })
    })

    vectorWfsSource.value = new VectorSource({
      url: url_test.value,
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

    vectorPinSource.value = new VectorSource()

    const pinLayer = new VectorLayer({
      source: vectorPinSource.value,
      style: new Style({
        image: new Icon({
          src: markerIcon,
          scale: 0.05,
          anchor: [0.5, 1]
        })
      })
    });
    
    // Création de la source et de la couche pour les départements
    vectorSource.value = new VectorSource();

    deptLayer.value = new VectorLayer({
      source: vectorSource.value,
      style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      })
    });

    // Layer emprise selected


    vectorScanSource.value = new VectorSource();

    scanLayer.value = new VectorLayer({
      source: vectorScanSource.value,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.5)'
        })
      })

    })



    
    const view = new View({
      center: center.value,
      zoom: zoom.value,
      projection: projection.value,
      rotation: rotation.value,
      maxZoom: getMaxZoom(layers.value[activeLayerIndex.value].id),
    })

    olView.value = view

    olMap.value = new Map({
      target: mapElement.value,
      layers: [...wmtsLayers, wfsLayer, pinLayer, deptLayer.value, scanLayer.value],
      view: view,
      controls: defaultControls({ zoom: false, rotate: false })
    });
    
    // Gestionnaire d'événements de clic
    olMap.value.on('click', (event) => {
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

    // Écouter les événements du bus
    eventBus.on('toggle-pin', (isVisible) => {
      showPin.value = isVisible
      if (!isVisible) {
        vectorPinSource.value.clear()
        pins.value = []
      }
    });
    
    eventBus.on('map-zoom', (delta) => {
      if (olMap.value && olView.value) {
        const currentZoom = olView.value.getZoom();
        olView.value.animate({
          zoom: currentZoom + delta,
          duration: 250
        });
      }
    })
    
    eventBus.on('center-map', ({ x, y }) => {
      if (olMap.value && olView.value) {
        olView.value.animate({
          center: [x, y],
          duration: 750
        });
      }
    });

    eventBus.on('update-coordinates', ({ x, y }) => {
      vectorPinSource.value.clear()
      const feature = new Feature({
        geometry: new Point([x, y])
      });
      vectorPinSource.value.addFeature(feature);
      pins.value = [[x, y]];
    });

    watch(activeSubCategory, (newValue) => {
      if (newValue === null && olMap.value) {
        vectorPinSource.value.clear();
        vectorWfsSource.value.clear();
        vectorWfsSource.value.setUrl("");
        vectorSource.value.clear();
        vectorScanSource.value.clear();
        scanStore.updateCommuneContour([])
      }
    });

    console.log('---------------------------- URL ----------------------------')
    watch(storeURL, async (newValue) => {
      console.log('NEW URL:', newValue)
      vectorSource.value.clear();
      vectorScanSource.value.clear();

      if (storeCommuneContour.value.length !== 0) {
        const polygon = new Feature({
          geometry: new Polygon([storeCommuneContour.value]),
        });

        vectorSource.value.addFeature(polygon);

      const extent = polygon.getGeometry().getExtent();

      olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50+400],
          duration: 2_000
        });
      }

      vectorWfsSource.value.setUrl(newValue);
      vectorWfsSource.value.refresh();

      await scanStore.storeGet(newValue)
    })


    watch(storeSelectedScan, (newValue) => {
      console.log('NEW GEOM', newValue)
      vectorScanSource.value.clear();

      if (storeSelectedScan.value) {
        const polygon = new Feature({
          geometry: new Polygon([storeSelectedScan.value]),
        });

        vectorScanSource.value.addFeature(polygon);

      const extent = polygon.getGeometry().getExtent();

      olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50+400],
          duration: 1_000
        });
      }






    })







    eventBus.on('criteria-reset', () => {
      if (vectorPinSource.value) {
        vectorPinSource.value.clear()

      }
      if (vectorWfsSource.value) {
        vectorWfsSource.value.clear()
        vectorWfsSource.value.setUrl("");
        olMap.value.removeLayer(wfsLayer);

      }
      if (vectorSource.value) {
        vectorSource.value.clear();
        olMap.value.removeLayer(deptLayer);
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
