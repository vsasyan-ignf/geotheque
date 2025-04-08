<template>
  <div class="map-container">
    <SideMenu @toggle-visibility="toggleLayerVisibility" />
    <div ref="mapElement" class="ol-map"></div>
    <BasecardSwitcher :layers="layers" :otherLayers="otherLayers" :activeLayerIndex="activeLayerIndex"
      :currentZoom="currentZoom" @layer-change="changeActiveLayer" @other-layer-toggle="handleOtherLayerToggle"
      @display-option-change="handleDisplayOptionChange" />
    <ZoomControl />
    <VisibilitySwitch @toggle-visibility="toggleLayerVisibility" />
    <DrawControl v-if="activeTab === 'phototheque'" :map="olMap" :isDrawModeActive="drawModeActive"
      @draw-complete="handleDrawComplete" @draw-mode-activated="handleDrawModeActivated"
      @deactivate-draw-mode="handleDeactivateDrawMode" />
  </div>
  <div style="z-index: 99999999" id="mouse-position"></div>
  <div style="z-index: 99999999" id="form-proj"></div>
</template>

<script setup>
import { ref, onMounted, nextTick, provide, watch, computed } from 'vue'
import SideMenu from './SideMenu.vue'
import BasecardSwitcher from './BasecardSwitcher.vue'
import VisibilitySwitch from './VisibilitySwitch.vue'
import ZoomControl from './ZoomControl.vue'
import { eventBus } from './composable/eventBus'
import markerIcon from '@/assets/blue-marker.svg'
import crossIcon from '@/assets/red-cross.svg'
import { useScanStore } from './store/scan'
import { storeToRefs } from 'pinia'
import DrawControl from './DrawControl.vue'
import Map from 'ol/Map'
import View from 'ol/View'
import Polygon from 'ol/geom/Polygon.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {
  getMaxZoom,
  createInitialWMTSLayers,
  updateWMTSLayers,
  changeActiveWMTSLayer,
} from './composable/getWMTS'
import { defaults as defaultControls } from 'ol/control'
import { getLayersForActiveTab, getOtherLayersForActiveTab } from './composable/getActiveTab'
import { layers_carto, otherLayersCartoFrance } from './composable/baseMap'
import {
  createPinLayer,
  createGeomLayer,
  createGeomMouseOverLayer,
  createScanLayer,
  createWFSLayer,
  initOtherVectorLayers,
} from './composable/getVectorLayer'
import { parcour_txt_to_tab } from './composable/parseTXT'
import { useConvertCoordinates } from './composable/convertCoordinates'
import MultiPolygon from 'ol/geom/MultiPolygon'
import {
  initializeIntersectionLayer,
  findIntersections,
  clearIntersection,
} from './composable/intersectionDraw'
import { Style, Text, Stroke, Fill } from 'ol/style'
import Icon from 'ol/style/Icon'

import MousePosition from 'ol/control/MousePosition.js'
import { createStringXY } from 'ol/coordinate.js'

const scanStore = useScanStore()
const {
  storeURL,
  activeSubCategory,
  storeSelectedScan,
  storeSelectedGeom,
  activeTab,
  storeHoveredScan,
  deletePhotoAllBool,
  dicoUrlPhoto,
} = storeToRefs(scanStore)

const center = ref([260000, 6000000])
const projection = ref('EPSG:3857')
const zoom = ref(6)
const rotation = ref(0)

const mapElement = ref(null)
const olMap = ref(null)
const pins = ref([])
const showPin = ref(false)

const drawModeActive = ref(false)
const lastDrawFeature = ref(null)

let layers = ref(layers_carto)
const communesLayerManuallyActivated = ref(false)
const otherLayers = ref(otherLayersCartoFrance)

const vectorLayers = ref({
  pin: null,
  geom: null,
  geomMouseOver: null,
  scan: null,
  emprises: null,
  cross: null,
  cross_alphanum: null,
  geomPhoto: null,
  hover: null,
})

const clearAllLayersTA = () => { 
  vectorLayers.value.scan.getSource().clear()
  vectorLayers.value.geomPhoto.getSource().clear()
  vectorLayers.value.cross.getSource().clear()
  vectorLayers.value.cross_alphanum.getSource().clear()
  vectorLayers.value.geomMouseOver.getSource().clear()
  tab_emprise_photo = [];
  last_geom = null;
}


const vectorOtherLayers = ref(null)

let tab_emprise_photo = [];
let last_geom = null;

function hideOtherLayers() {
  Object.values(vectorOtherLayers.value).forEach((layer) => {
    layer.setVisible(false)
  })
  otherLayers.value.forEach((layers) => (layers.visible = false))
}

watch(activeTab, (newValue) => {
  const newLayers = getLayersForActiveTab(activeTab.value)
  layers.value = newLayers
  otherLayers.value = getOtherLayersForActiveTab(activeTab.value)
  hideOtherLayers()
  updateWMTSLayers(olMap.value, newLayers)
  scanStore.resetCriteria()
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

function DrawEmpriseGeometry(geometry) {
  //fonction qui affiche la géometry et efface l'ancienne si il y en a
  if (last_geom != null) {
    vectorLayers.value.geomMouseOver.getSource().clear()
  }
  last_geom = geometry
  const feature = new Feature({
    geometry: last_geom
  });
  vectorLayers.value.geomMouseOver.getSource().addFeature(feature);
}


function isPointOnEmprise(point, emprises) {
  //fonction qui parcours les emprises et appelle DrawEmpriseGeometry quand une de ces emprise intersecte
  // le point de la souris ,sinon on vide la couche des emprises à afficher
  for (let i = 0; i < emprises.length; i++) {
    const polygon = new Feature({
      geometry: new Polygon([emprises[i]]),
    });
    const geometry = polygon.getGeometry();

    if (geometry.intersectsCoordinate(point)) {
      DrawEmpriseGeometry(geometry)
      return;
    }
  }
  vectorLayers.value.geomMouseOver.getSource().clear()
}



function addPointToMap(x, y, nom, crossAlpha=false) {
  const coord = [x, y]

  // Créer un style avec une icône et un texte
  const style = new Style({
    image: new Icon({
      src: crossIcon,
      scale: 0.03, // Ajustez la taille de l'icône si nécessaire
    }),
    text: new Text({
      text: nom,
      offsetY: -20, // Décale le texte au-dessus de l'icône
      font: '14px Arial, sans-serif',
      fill: new Fill({
        color: '#000', // Couleur du texte
      }),
      stroke: new Stroke({
        color: '#fff', // Contour blanc pour améliorer la lisibilité
        width: 3,
      }),
    }),
  })

  // Créer une entité Feature avec le style
  const feature = new Feature({
    geometry: new Point(coord),
  })
  feature.setStyle(style)

  if (crossAlpha) {
    vectorLayers.value.cross_alphanum.getSource().addFeature(feature)
  } else {
    vectorLayers.value.cross.getSource().addFeature(feature)
  }


}

function Add_new_polygone_to_map(tab) {
  const polygon = new Feature({
    geometry: new Polygon([tab]),
  })

  vectorLayers.value.geomPhoto.getSource().addFeature(polygon)
}

async function parcour_tab_and_map(url) {
  //Parcour le tableau et envoie les deltas convertis sous forme de tableau dans Add_new_polygone_to_map
  try {
    console.log('url TA : ', url)
    const tab_test = await parcour_txt_to_tab(url);

    if (!tab_test || tab_test.length === 0) {
      throw new Error('Le tableau récupéré est vide ou invalide.')
    }

    let elem, i, i2, x, y, x_3857, y3857, tab_points_3857, alphanum, numero;
    for (i = 0; i < tab_test.length; i++) {
      if (tab_test[i][0] == 'Centre Actif') {
        //"Centre Actif"
        x = tab_test[i][1];
        y = tab_test[i][2];
        alphanum = tab_test[i][3];
        numero = tab_test[i][4];

        [x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857')
        // addPointToMap(x_3857, y3857, numero)
        addPointToMap(x_3857, y3857, alphanum, true)
      } else {
        //"Cliche Actif"
        elem = tab_test[i];
        tab_points_3857 = [];
        for (i2 = 1; i2 < elem.length; i2 = i2 + 2) {
          //Commence a 1 car en 0 il y a le type d'image
          x = elem[i2];
          y = elem[i2 + 1];
          [x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857');
          //addPointToMap(x_3857, y3857);
          tab_points_3857.push([x_3857, y3857]);
        }

        tab_emprise_photo.push(tab_points_3857);
        Add_new_polygone_to_map(tab_points_3857);

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
  } else if (vectorOtherLayers.value?.[layer.id]) {
    const isVisible = vectorOtherLayers.value?.[layer.id].getVisible()
    vectorOtherLayers.value?.[layer.id].setVisible(!isVisible)
  }
}

function changeActiveLayer(index) {
  activeLayerIndex.value = index
  changeActiveWMTSLayer(olMap.value, olView.value, layers.value, index)
}

function handleDrawComplete(drawData) {
  console.log('Dessin terminé:', drawData)

  let drawGeometry
  if (drawData.type === 'Rectangle' || drawData.type === 'Polygon') {
    drawGeometry = new Polygon(drawData.coordinates)
  } else if (drawData.type === 'Circle') {
    drawGeometry = new Polygon(drawData.coordinates)
  }

  lastDrawFeature.value = new Feature({
    geometry: drawGeometry,
  })

  const extent = findIntersections(drawGeometry, vectorOtherLayers.value)
  console.log(extent)
}

function handleDrawModeActivated(mode) {
  console.log('Mode de dessin activé:', mode)
  drawModeActive.value = true

  clearIntersection()
}

function handleDeactivateDrawMode() {
  console.log('Mode de dessin désactivé')
  drawModeActive.value = false
  clearIntersection()
}

onMounted(() => {
  nextTick(() => {
    const wmtsLayers = createInitialWMTSLayers(layers.value, activeLayerIndex.value)

    vectorLayers.value = {
      pin: createPinLayer(markerIcon),
      geom: createGeomLayer(),
      geomMouseOver: createGeomMouseOverLayer(),
      scan: createScanLayer(),
      emprises: createWFSLayer(),
      cross: createPinLayer(crossIcon),
      cross_alphanum: createPinLayer(crossIcon),
      geomPhoto: createGeomLayer(),
      hover: createScanLayer(),
    }

    vectorOtherLayers.value = initOtherVectorLayers()

    watch(currentZoom, (newZoom) => {
      if (vectorOtherLayers.value?.communes && communesLayerManuallyActivated.value) {
        const shouldBeVisible = newZoom >= 12
        vectorOtherLayers.value?.communes.setVisible(shouldBeVisible)
      }
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
        vectorLayers.value.emprises,
        vectorLayers.value.pin,
        vectorLayers.value.geom,
        vectorLayers.value.geomMouseOver,
        vectorLayers.value.scan,
        vectorLayers.value.hover,
        vectorLayers.value.cross,
        vectorLayers.value.cross_alphanum,
        vectorLayers.value.geomPhoto,
        ...Object.values(vectorOtherLayers.value),
      ],
      view: view,
      controls: defaultControls({ zoom: false, rotate: false }),
    })

    function updateProjectionDisplay() {
      const projectionCode = olMap.value.getView().getProjection().getCode()
      const formProjElement = document.getElementById('form-proj')
      if (formProjElement) {
        formProjElement.innerHTML = `Projection: ${projectionCode}`
      }
    }

    updateProjectionDisplay()
    olMap.value.getView().on('change:projection', updateProjectionDisplay)

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(2),
      projection: olMap.value.getView().getProjection().getCode(),
      target: document.getElementById('mouse-position'),
    });

    olMap.value.on('pointermove', (event) => {
      const coordinate = olMap.value.getEventCoordinate(event.originalEvent);
      const formattedCoordinate = createStringXY(2)(coordinate);

      isPointOnEmprise(coordinate, tab_emprise_photo)

      const mousePositionElement = document.getElementById('mouse-position');
      if (mousePositionElement) {
        mousePositionElement.innerHTML = `Position: ${formattedCoordinate}`
      }
    })

    initializeIntersectionLayer(olMap)

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
      vectorLayers.value.pin.getSource().addFeature(feature)
      pins.value = [[x, y]]
    })

    watch(activeSubCategory, (newValue) => {
      if (newValue === null && olMap.value) {
        Object.values(vectorLayers.value).forEach((layer) => layer.getSource().clear())
        vectorLayers.value.emprises.getSource().setUrl('')
        scanStore.resetCriteria();
        clearAllLayersTA();
      }
    })

    watch(storeURL, async (newValue) => {
      console.log('--------- REQUETE GEOSERVER --------')
      console.log('NEW URL:', newValue)
      vectorLayers.value.geom.getSource().clear()
      vectorLayers.value.geomMouseOver.getSource().clear()
      vectorLayers.value.geomPhoto.getSource().clear()

      if (storeSelectedGeom.value.length !== 0) {

        const polygon = new Feature({
            geometry: new MultiPolygon([storeSelectedGeom.value]),
          })

        vectorLayers.value.geom.getSource().addFeature(polygon)

        const extent = polygon.getGeometry().getExtent()

        olMap.value.getView().fit(extent, {
          padding: [50, 50, 50, 50 + 400],
          minResolution: 200,
          duration: 2000,
        })
        scanStore.updateSelectedGeom([])
      }
      // Pour ne pas afficher toutes les emprises
      if (activeTab.value != 'phototheque') {
        vectorLayers.value.emprises.getSource().setUrl(newValue)
      }

      vectorLayers.value.emprises.getSource().refresh()
      await scanStore.storeGet(newValue)
    })

    watch(storeHoveredScan, (newVal) => {
      vectorLayers.value.hover.getSource().clear()

      if (
        storeHoveredScan.value &&
        storeHoveredScan.value.geom &&
        storeHoveredScan.value.geom.length > 0
      ) {
        const polygon = new Feature({
          geometry: new MultiPolygon(storeHoveredScan.value.geom),
        })

        vectorLayers.value.hover.getSource().addFeature(polygon)
      }
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
          geometry: new MultiPolygon(storeSelectedScan.value.geom),
        })

        vectorLayers.value.scan.getSource().addFeature(polygon)
      }
    })

    watch(dicoUrlPhoto, () => {
      clearAllLayersTA();
      if (dicoUrlPhoto.value.length > 0) {
        dicoUrlPhoto.value.forEach((url) => {
          parcour_tab_and_map(url)
        })
      }
    },
      { deep: true }
    )

    watch(deletePhotoAllBool, () => {
        clearAllLayersTA()
    })

    eventBus.on('criteria-reset', () => {
      Object.values(vectorLayers.value).forEach((layer) => layer.getSource().clear())
      vectorLayers.value.emprises.getSource().setUrl('')
      clearAllLayersTA()
      clearIntersection()
    })

    window.dispatchEvent(new Event('resize'))
  })
})

function handleDisplayOptionChange({ option, value }) {
  if (option === 'numDepartement') {
    const currentLayerId = value ? 'departements' : 'departements_with_no_name';
    const previousLayerId = value ? 'departements_with_no_name' : 'departements';

    if (vectorOtherLayers.value) {
      const isVisible = vectorOtherLayers.value[previousLayerId]?.getVisible();
      if (isVisible) {
        vectorOtherLayers.value[previousLayerId].setVisible(false);
        vectorOtherLayers.value[currentLayerId].setVisible(true);
      }

      const departmentLayer = otherLayers.value.find(layer =>
        layer.id === previousLayerId ||
        layer.id === 'departements' ||
        layer.id === 'departements_with_no_name');

      if (departmentLayer) {
        departmentLayer.id = currentLayerId;
      }
    }
  }

  if (option === 'numFeuille') {
    const layerTypes = [
      { base: 'feuilles_france', withoutName: 'feuilles_france_with_no_name' },
      { base: 'feuilles_monde', withoutName: 'feuilles_monde_with_no_name' }
    ];

    layerTypes.forEach(type => {
      const currentLayerId = value ? type.base : type.withoutName;
      const previousLayerId = value ? type.withoutName : type.base;

      if (vectorOtherLayers.value && vectorOtherLayers.value[previousLayerId]) {
        const isVisible = vectorOtherLayers.value[previousLayerId].getVisible();
        if (isVisible) {
          vectorOtherLayers.value[previousLayerId].setVisible(false);
          vectorOtherLayers.value[currentLayerId].setVisible(true);
        }

        const feuilleLayer = otherLayers.value.find(layer =>
          layer.id === previousLayerId ||
          layer.id === type.base ||
          layer.id === type.withoutName);

        if (feuilleLayer) {
          feuilleLayer.id = currentLayerId;
        }
      }
    });
  }
}
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

#mouse-position {
  position: absolute;
  bottom: 10px;
  right: 40%;
  /* À 10px du côté gauche */
  background-color: rgba(255,
      255,
      255,
      0.8);
  /* Fond semi-transparent pour améliorer la lisibilité */
  padding: 5px;
  /* Un peu de padding */
  font-size: 14px;
  /* Taille du texte */
  border-radius: 5px;
  /* Coins arrondis pour une meilleure esthétique */
  color: black;
}

#form-proj {
  position: absolute;
  /* Positionner de manière absolue par rapport au conteneur parent */
  bottom: 10px;
  right: 24%;
  z-index: 99999999;
  /* Priorité sur les autres éléments */
  background-color: rgba(255, 255, 255, 0.8);
  /* Fond légèrement transparent pour le formulaire */
  padding: 5px;
  /* Un peu de padding autour du formulaire */
  font-size: 14px;
  border-radius: 5px;
  /* Coins arrondis pour le formulaire */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* Ombre douce pour faire ressortir le formulaire */
  color: black;
}
</style>
