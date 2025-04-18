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
      @display-option-change="handleDisplayOptionChange"
    />
    <ZoomControl />
    <VisibilitySwitch @toggle-visibility="toggleLayerVisibility" />
    <DrawControl
      v-if="activeTab === 'phototheque'"
      :map="olMap"
      :isDrawModeActive="drawModeActive"
      @draw-complete="handleDrawComplete"
      @draw-mode-activated="handleDrawModeActivated"
      @deactivate-draw-mode="handleDeactivateDrawMode"
    />
    <CardPva v-if="showCardPva" :photoInfo="currentPhotoInfo" @close="closeCardPva" />

    <MapNavBar
      :coordinates="mouseCoordinates"
      @update:territory="handleTerritoryUpdate"
      :territoryName="territoryData.name"
    />
  </div>

  <Alert
        :show="noResultsFound"
        type="warning"
        title="Aucun résultat"
        dismissible
        :duration="4000"
        @close="noResultsFound = false"
      >
        Aucun résultat trouvé. Veuillez modifier votre mission.
      </Alert>
</template>

<script setup>
import { ref, onMounted, nextTick, provide, watch } from 'vue'
import SideMenu from './SideMenu.vue'
import BasecardSwitcher from './BasecardSwitcher.vue'
import VisibilitySwitch from './VisibilitySwitch.vue'
import ZoomControl from './ZoomControl.vue'
import CardPva from './phototheque/CardPva.vue'
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
import Alert from './material/Alert.vue'
import {
  getMaxZoom,
  createInitialWMTSLayers,
  changeActiveWMTSLayer,
  updateWMTSLayers,
} from './composable/getWMTS'
import { defaults as defaultControls } from 'ol/control'
import { getLayersForActiveTab, getOtherLayersForActiveTab } from './composable/getActiveTab'
import { layers_carto, otherLayersCartoFrance } from './composable/baseMap'
import {
  createPinLayer,
  createGeomLayer,
  createGeomMouseOverLayer,
  createGeomCoupleLayer,
  createScanLayer,
  createHoverLayer,
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

import MapNavBar from './MapNavBar.vue'

import { getDistance } from 'ol/sphere'
import { territoires } from './composable/getTerritoires'

const mouseCoordinates = ref({ x: 0, y: 0 })

const showCardPva = ref(false)
const noResultsFound = ref(false)

function closeCardPva() {
  showCardPva.value = false
}

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
  currentPhotoInfo,
  flyTo,
  selectedPhotos,
} = storeToRefs(scanStore)

const center = ref([territoires.Metropole.lon, territoires.Metropole.lat])
const zoom = ref(territoires.Metropole.zoom)

const territoryData = ref({ name: 'Metropole', lon: 0, lat: 0 })

const projection = ref('EPSG:3857')
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

const checkboxAlphanum = ref(false)

const infosPva = ref({})

const vectorLayers = ref({
  pin: null,
  geom: null,
  geomMouseOver: null,
  scan: null,
  emprises: null,
  cross: null,
  cross_alphanum: null,
  geomPhoto: null,
  geomCouple: null,
  hover: null,
})

const clearAllLayersTA = () => {
  vectorLayers.value.scan.getSource().clear()
  vectorLayers.value.geomPhoto.getSource().clear()
  vectorLayers.value.cross.getSource().clear()
  vectorLayers.value.cross_alphanum.getSource().clear()
  vectorLayers.value.geomMouseOver.getSource().clear()
  tab_emprise_photo = []
  last_geom = null
  showCardPva.value = false
}

const vectorOtherLayers = ref(null)

let tab_emprise_photo = []
let tab_couples_photo = []
let dic_affiche_photos_clique = {}
let last_geom = null
const rayon_croix_clique = 50

/**
 * Cache les autres couches de la carte
 */
function hideOtherLayers() {
  Object.values(vectorOtherLayers.value).forEach((layer) => {
    layer.setVisible(false)
  })
  otherLayers.value.forEach((layers) => (layers.visible = false))
}

/**
 * Gère la mise à jour de la carte en fonction du territoire sélectionné
 * @param data
 */
const handleTerritoryUpdate = (data) => {
  territoryData.value = data

  zoom.value = data.zoom
  center.value = [data.lon, data.lat]

  console.log('Territoire sélectionné:', data.name)
}

watch(territoryData, (newVal) => {
  if (olMap.value && olView.value) {
    olView.value.animate({
      center: [newVal.lon, newVal.lat],
      zoom: newVal.zoom,
    })
  }
})

watch(activeTab, (newValue) => {
  const newLayers = getLayersForActiveTab(activeTab.value)
  layers.value = newLayers
  otherLayers.value = getOtherLayersForActiveTab(activeTab.value)
  hideOtherLayers()
  scanStore.resetCriteria()
  activeLayerIndex.value = 0

  updateWMTSLayers(olMap.value, newLayers)

  const name = activeTab.value.includes('etranger') ? 'Monde' : 'Metropole'

  territoryData.value = {
    name: name,
    lat: territoires[name].lat,
    lon: territoires[name].lon,
    zoom: territoires[name].zoom,
  }

  //faire une fonction pour pas dupliquer avec reset
  tab_emprise_photo = []
  tab_couples_photo = []
  last_geom = null
  vectorLayers.value.geomMouseOver.getSource().clear()
  vectorLayers.value.geomCouple.getSource().clear()
  showCardPva.value = false
})

const activeLayerIndex = ref(0)
const olView = ref(null)
const visibility_switch = ref(true)
const currentZoom = ref(zoom.value)

/**
 * Change la visibilité de la couche active
 * @param isVisible
 */
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
    geometry: last_geom,
  })
  vectorLayers.value.geomMouseOver.getSource().addFeature(feature)
}

/**
 * Fonction qui renvoie l'index de l'emprise la plus proche du point
 * @param point
 * @param emprises
 * @param range
 */
function aplhaOfPointInRange(point, emprises, range) {
  //function that take a point and return the
  let i, distance, point_emprise_4326, point_souris_4326
  point_souris_4326 = useConvertCoordinates(point[0], point[1], 'EPSG:3857', 'EPSG:4326')

  for (i = 0; i < emprises.length; i++) {
    point_emprise_4326 = useConvertCoordinates(
      emprises[i][2][0],
      emprises[i][2][1],
      'EPSG:3857',
      'EPSG:4326',
    )
    distance = getDistance(point_souris_4326, point_emprise_4326)

    if (distance < range) {
      return [emprises[i][1], i]
    }
  }
  return null
}

/**
 * Fonction qui affiche l'emprise sur laquelle on clique
 * @param point
 * @param emprises
 */
function showPointOnEmprise(point, emprises) {
  //fonction qui parcours les emprises et appelle DrawEmpriseGeometry quand une de ces emprise intersecte
  // le point de la souris ,sinon on vide la couche des emprises à afficher
  let alphaOrI = aplhaOfPointInRange(point, emprises, rayon_croix_clique)
  if (alphaOrI != null) {
    const i = alphaOrI[1]
    const alpha_selec = alphaOrI[0]

    const polygon = new Feature({
      geometry: new Polygon([emprises[i][0]]),
    })

    const geometry = polygon.getGeometry()
    showCardPva.value = true
    scanStore.updateCurrentPhotoInfo(infosPva.value[alpha_selec])
    DrawEmpriseGeometry(geometry)
  } else {
    showCardPva.value = false
    vectorLayers.value.geomMouseOver.getSource().clear()
  }
}

/**
 * Ajoute un nouveau couple à la carte
 * @param tab
 */
function Add_new_couple_to_map(tab) {
  const feature = new Feature({
    geometry: new Polygon([tab]),
  })

  vectorLayers.value.geomCouple.getSource().addFeature(feature)
}

/**
 *
 * @param bool
 */
function updateCoupleVisibility(bool) {
  let i
  vectorLayers.value.geomCouple.getSource().clear()

  if (bool && tab_couples_photo.length > 0) {
    for (i = 0; i < tab_couples_photo.length; i++) {
      Add_new_couple_to_map(tab_couples_photo[i])
    }
  }
}

/**
 * Ajoute un point à la carte
 * @param x
 * @param y
 * @param nom
 * @param crossAlpha
 */
function addPointToMap(x, y, nom, crossAlpha = false) {
  const coord = [x, y]

  const style = new Style({
    image: new Icon({
      src: crossIcon,
      scale: 0.03,
    }),
    text: new Text({
      text: nom,
      offsetY: -20,
      font: '14px Arial, sans-serif',
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
    }),
  })

  const feature = new Feature({
    geometry: new Point(coord),
  })
  feature.setStyle(style)

  if (crossAlpha) {
    vectorLayers.value.cross_alphanum.getSource().addFeature(feature)
  } else {
    vectorLayers.value.cross.getSource().addFeature(feature)
  }

  if (checkboxAlphanum.value) {
    vectorLayers.value.cross.setVisible(false)
  } else {
    vectorLayers.value.cross_alphanum.setVisible(false)
  }
}

/**
 * Suppression de l'emprise cliquée
 * @param name
 */
function removeEmpriseClique(name) {
  //fonction pour retirer une emprise de l'affichage
  vectorLayers.value.geomPhoto.getSource().removeFeature(dic_affiche_photos_clique[name])
  delete dic_affiche_photos_clique[name]
}

/**
 * Affiche l'emprise cliquée
 * @param name
 * @param i
 */
function afficheMasuqeEmpriseClique(name, i) {
  //function qui gere l'ajout et la suppression de l'emprise au clique
  if (dic_affiche_photos_clique[name]) {
    removeEmpriseClique(name)
    return
  }
  const polygon = new Feature({
    geometry: new Polygon([tab_emprise_photo[i][0]]),
    name: name,
  })
  dic_affiche_photos_clique[name] = polygon
  vectorLayers.value.geomPhoto.getSource().addFeature(polygon)
}

/**
 * Ajoute un nouveau nom à la carte
 * @param name
 */
function Add_new_name_to_map(name) {
  const feature_name = new Feature({
    name: name,
  })

  vectorLayers.value.geomPhoto.getSource().addFeature(feature_name)
}

/**
 * Parcourt le tableau et ajoute les polygones à la carte
 * @param url
 */

async function parcour_tab_and_map(url) {
  //Parcour le tableau et envoie les deltas convertis sous forme de tableau dans Add_new_polygone_to_map
  try {
    console.log('url TA : ', url)
    const tab_test = await parcour_txt_to_tab(url)

    if (!tab_test || tab_test.length === 0) {
      throw new Error('Le tableau récupéré est vide ou invalide.')
    }

    let elem,
      i,
      i2,
      x,
      y,
      x_3857,
      y3857,
      centrex_3857,
      centrey_3857,
      tab_points_cliche_3857,
      tab_points_couple_3857,
      alphanum,
      numero,
      infos
    for (i = 0; i < tab_test.length; i++) {
      if (tab_test[i][0] == 'Centre Actif') {
        //"Centre Actif"
        x = tab_test[i][1]
        y = tab_test[i][2]
        alphanum = tab_test[i][3]
        numero = tab_test[i][4]
        infos = tab_test[i][5]
        ;[x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857')
        centrex_3857 = x_3857
        centrey_3857 = y3857

        addPointToMap(x_3857, y3857, numero)
        addPointToMap(x_3857, y3857, alphanum, true)

        infos['territoire'] = storeSelectedScan.value?.properties?.territoire

        infosPva.value[alphanum] = infos
      } else if (tab_test[i][0] == 'Cliche Actif') {
        elem = tab_test[i]
        tab_points_cliche_3857 = []
        for (i2 = 1; i2 < elem.length; i2 = i2 + 2) {
          //Commence a 1 car en 0 il y a le type d'image
          x = elem[i2]
          y = elem[i2 + 1]
          ;[x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857')
          tab_points_cliche_3857.push([x_3857, y3857])
        }

        tab_emprise_photo.push([tab_points_cliche_3857, alphanum, [centrex_3857, centrey_3857]])
        Add_new_name_to_map(alphanum)
      } else if (tab_test[i][0] == 'Couple Actif') {
        elem = tab_test[i]
        tab_points_couple_3857 = []
        for (i2 = 1; i2 < elem.length; i2 = i2 + 2) {
          //Commence a 1 car en 0 il y a le type d'image
          x = elem[i2]
          y = elem[i2 + 1]
          ;[x_3857, y3857] = useConvertCoordinates(x, y, 'EPSG:2154', 'EPSG:3857')
          tab_points_couple_3857.push([x_3857, y3857])
        }
        //Tableau de couples
        tab_couples_photo.push(tab_points_couple_3857)
      } else {
        console.error('probleme dans parcour tab')
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error)
    noResultsFound.value = true

  }
}

/**
 * Gère le changement d'option d'affichage
 * @param layer
 */
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

/**
 * Change la couche active
 * @param index
 */
function changeActiveLayer(index) {
  activeLayerIndex.value = index
  changeActiveWMTSLayer(olMap.value, olView.value, layers.value, index)
}

/**
 * Gère le changement d'option d'affichage
 * @param drawData
 */
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

/**
 * Gère l'activation du mode de dessin
 * @param mode
 */
function handleDrawModeActivated(mode) {
  console.log('Mode de dessin activé:', mode)
  drawModeActive.value = true

  clearIntersection()
}

/**
 * Désactive le mode de dessin
 */
function handleDeactivateDrawMode() {
  console.log('Mode de dessin désactivé')
  drawModeActive.value = false
  clearIntersection()
}

watch(
  selectedPhotos,
  () => {
    const names = selectedPhotos.value.map((pva) => pva.nom)
    Object.keys(dic_affiche_photos_clique).forEach((nom) => {
      if (!names.includes(nom)) {
        removeEmpriseClique(nom)
      }
    })
  },
  { deep: true },
)

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
      geomCouple: createGeomCoupleLayer(),
      hover: createHoverLayer(),
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
        ...Object.values(vectorLayers.value),
        ...Object.values(vectorOtherLayers.value),
      ],
      view: view,
      controls: defaultControls({ zoom: false, rotate: false }),
    })

    vectorLayers.value.pin.setZIndex(999);

    olMap.value.on('pointermove', (event) => {
      const coordinate = olMap.value.getEventCoordinate(event.originalEvent)

      mouseCoordinates.value.x = coordinate[0]
      mouseCoordinates.value.y = coordinate[1]

      showPointOnEmprise(coordinate, tab_emprise_photo)
    })

    initializeIntersectionLayer(olMap)

    olMap.value.on('click', (event) => {
      const coordinate3857 = olMap.value.getEventCoordinate(event.originalEvent)
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

      const alaphaOrI = aplhaOfPointInRange(coordinate3857, tab_emprise_photo, rayon_croix_clique)
      if (alaphaOrI != null) {
        const name = infosPva.value[alaphaOrI[0]].nom
        const i = alaphaOrI[1]

        if (name) {
          scanStore.updateSelectedPhotos(infosPva.value[alaphaOrI[0]])
          // rajout pour gestion affiche / enlever emprise
          afficheMasuqeEmpriseClique(name, i)

          const photoItem = infosPva.value[alaphaOrI[0]]
          const isEmpriseDisplayed = !dic_affiche_photos_clique[name]
          if (isEmpriseDisplayed) {
            scanStore.removeSelectedPhoto(photoItem)
          } else {
            scanStore.updateSelectedPhotos(photoItem)
          }
        }
      }
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

    eventBus.on('clear-cart', () => {
      for (const name in dic_affiche_photos_clique) {
        removeEmpriseClique(name)
      }
    })

    watch(activeSubCategory, (newValue) => {
      if (newValue === null && olMap.value) {
        Object.values(vectorLayers.value).forEach((layer) => layer.getSource().clear())
        vectorLayers.value.emprises.getSource().setUrl('')
        scanStore.resetCriteria()
        clearAllLayersTA()
      }
    })

    watch(storeURL, async (newValue) => {
      console.log('--------- REQUETE GEOSERVER --------')
      console.log('NEW URL:', newValue)
      vectorLayers.value.geom.getSource().clear()
      vectorLayers.value.geomMouseOver.getSource().clear()
      vectorLayers.value.geomCouple.getSource().clear()
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
      // Pour afficher les emprises de scans
      if (activeTab.value.includes('cartotheque')) {
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

    watch(flyTo, () => {
      if (vectorLayers.value.scan.getSource()) {
        const features = vectorLayers.value.scan.getSource().getFeatures()
        if (features.length > 0) {
          const extent = features[0].getGeometry().getExtent()

          olMap.value.getView().fit(extent, {
            padding: [50, 50, 50, 50 + 400],
            minResolution: 10,
            duration: 2000,
          })
        }
      }
    })

    watch(
      dicoUrlPhoto,
      () => {
        clearAllLayersTA()
        if (dicoUrlPhoto.value.length > 0) {
          dicoUrlPhoto.value.forEach((url) => {
            parcour_tab_and_map(url)
          })
        }
      },
      { deep: true },
    )

    watch(deletePhotoAllBool, () => {
      clearAllLayersTA()
    })

    eventBus.on('criteria-reset', () => {
      Object.values(vectorLayers.value).forEach((layer) => layer.getSource().clear())
      vectorLayers.value.emprises.getSource().setUrl('')
      clearAllLayersTA()
      if (vectorLayers.value.geomCouple) {
        vectorLayers.value.geomCouple.getSource().clear()
        tab_couples_photo = []
      }
      clearIntersection()
    })

    window.dispatchEvent(new Event('resize'))
  })
})

/**
 * Gère le changement de la couche active
 * @param param0
 */
function handleDisplayOptionChange({ option, value }) {
  if (option === 'alphanumerique') {
    const currentLayer = value ? vectorLayers.value.cross_alphanum : vectorLayers.value.cross
    const previousLayer = value ? vectorLayers.value.cross : vectorLayers.value.cross_alphanum

    const isVisible = previousLayer.getVisible()

    if (isVisible) {
      previousLayer.setVisible(false)
      currentLayer.setVisible(true)
    }

    checkboxAlphanum.value = value
  }

  if (option === 'numDepartement') {
    const currentLayerId = value ? 'departements' : 'departements_with_no_name'
    const previousLayerId = value ? 'departements_with_no_name' : 'departements'

    if (vectorOtherLayers.value) {
      const isVisible = vectorOtherLayers.value[previousLayerId]?.getVisible()
      if (isVisible) {
        vectorOtherLayers.value[previousLayerId].setVisible(false)
        vectorOtherLayers.value[currentLayerId].setVisible(true)
      }

      const departmentLayer = otherLayers.value.find((layer) => layer.id === previousLayerId)

      if (departmentLayer) {
        departmentLayer.id = currentLayerId
      }
    }
  }

  if (option === 'couplesStero') {
    updateCoupleVisibility(value)
  }

  if (option === 'numFeuille') {
    const layerTypes = [
      { base: 'feuilles_france', withoutName: 'feuilles_france_with_no_name' },
      { base: 'feuilles_monde', withoutName: 'feuilles_monde_with_no_name' },
    ]

    layerTypes.forEach((type) => {
      const currentLayerId = value ? type.base : type.withoutName
      const previousLayerId = value ? type.withoutName : type.base

      if (vectorOtherLayers.value && vectorOtherLayers.value[previousLayerId]) {
        const isVisible = vectorOtherLayers.value[previousLayerId].getVisible()
        if (isVisible) {
          vectorOtherLayers.value[previousLayerId].setVisible(false)
          vectorOtherLayers.value[currentLayerId].setVisible(true)
        }

        const feuilleLayer = otherLayers.value.find((layer) => layer.id === previousLayerId)

        if (feuilleLayer) {
          feuilleLayer.id = currentLayerId
        }
      }
    })
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
</style>
