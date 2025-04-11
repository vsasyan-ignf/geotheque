import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getTopLeft } from 'ol/extent'
import TileLayer from 'ol/layer/Tile'

/**
 * Récupère l'URL du service WMTS/WMS en fonction de l'identifiant de la couche.
 *
 * @param {string} layerId - Identifiant de la couche.
 * @returns {string} URL du service.
 */

function getWmtsUrl(layerId) {
  if (layerId === 'cartesign' || layerId === 'scan25') {
    return `https://data.geopf.fr/private/wmts?apikey=ign_scan_ws&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`
  } else if (layerId === 'ortho1950') {
    return `https://data.geopf.fr/wms-r`
  }
  return `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`
}

/**
 * Récupère le nom de la couche WMTS/WMS correspondant à un identifiant.
 *
 * @param {string} layerId - Identifiant de la couche.
 * @returns {string} Nom de la couche.
 */

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
    case 'ortho1950':
      return 'ORTHOIMAGERY.ORTHOPHOTOS.1950-1965'
    default:
      return 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2'
  }
}

/**
 * Détermine le niveau de zoom maximum autorisé pour une couche donnée.
 *
 * @param {string} layerId - Identifiant de la couche.
 * @returns {number} Niveau de zoom maximum.
 */

export function getMaxZoom(layerId) {
  switch (layerId) {
    case 'plan':
      return 19
    case 'ortho':
      return 21
    case 'bdparcellaire':
      return 20
    case 'cartesign':
      return 19
    case 'scan25':
      return 16
    case 'ortho1950':
      return 19
    default:
      return 19
  }
}

/**
 * Détermine le format de rendu utilisé pour la couche.
 *
 * @param {string} layerId - Identifiant de la couche.
 * @returns {string} Format MIME de la couche.
 */

function getFormatWmtsLayer(layerId) {
  switch (layerId) {
    case 'cartesign':
    case 'ortho':
    case 'scan25':
      return 'image/jpeg'
    case 'plan':
    case 'bdparcellaire':
      return 'image/png'
    case 'ortho1950':
      return 'image/png'
    default:
      return 'image/jpeg'
  }
}

/**
 * Crée une source WMTS ou WMS en fonction de l'identifiant de la couche.
 *
 * @param {string} layerId - Identifiant de la couche.
 * @returns {OSM|WMTS|TileWMS} Source correspondante.
 */

export function createWmtsSource(layerId) {
  if (layerId === 'osm') {
    return new OSM({
      attributions: null,
      controls: [],
    })
  } else if (layerId === 'ortho1950') {
    return new TileWMS({
      url: getWmtsUrl(layerId),
      params: {
        LAYERS: getWmtsLayerName(layerId),
        VERSION: '1.3.0',
        TRANSPARENT: 'TRUE',
        FORMAT: getFormatWmtsLayer(layerId),
        CRS: 'EPSG:3857',
        EXCEPTIONS: 'INIMAGE',
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous',
      tileLoadFunction: function (tile, src) {
        setTimeout(() => {
          tile.getImage().src = src
        }, 500) // Attendre 500ms avant de charger l'image
      },
    })
  } else {
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
}

/**
 * Crée une liste de couches WMTS prêtes à être ajoutées à la carte.
 *
 * @param {Array<{id: string}>} layers - Liste des couches à créer.
 * @param {number} activeLayerIndex - Index de la couche active.
 * @returns {TileLayer[]} Liste des couches WMTS.
 */

export function createInitialWMTSLayers(layers, activeLayerIndex) {
  return layers.map((layer, index) => {
    const wmtsSource = createWmtsSource(layer.id)
    return new TileLayer({
      source: wmtsSource,
      visible: index === activeLayerIndex,
    })
  })
}

/**
 * Met à jour les sources WMTS existantes dans la carte avec de nouvelles couches.
 *
 * @param {import('ol/Map').default} olMap - Carte OpenLayers.
 * @param {Array<{id: string}>} newLayers - Nouvelles couches à appliquer.
 */

export function updateWMTSLayers(olMap, newLayers) {
  if (!olMap) return

  const mapLayers = olMap.getLayers()
  const wmtsLayers = mapLayers.getArray().filter((layer) => layer instanceof TileLayer)

  wmtsLayers.forEach((layer, index) => {
    if (index < newLayers.length) {
      const newSource = createWmtsSource(newLayers[index].id)
      layer.setSource(newSource)
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

    layersToAdd.forEach((layer) => olMap.addLayer(layer))
  }
}

/**
 * Change la couche WMTS active et ajuste le zoom maximal si besoin.
 *
 * @param {import('ol/Map').default} olMap - Carte OpenLayers.
 * @param {import('ol/View').default} olView - Vue associée à la carte.
 * @param {Array<{id: string}>} layers - Liste des couches disponibles.
 * @param {number} newIndex - Index de la couche à activer.
 */

export function changeActiveWMTSLayer(olMap, olView, layers, newIndex) {
  if (!olMap) return

  const wmtsLayers = olMap
    .getLayers()
    .getArray()
    .filter((layer) => layer instanceof TileLayer)

  wmtsLayers.forEach((layer, layerIndex) => {
    layer.setVisible(layerIndex === newIndex)
  })

  if (olView && layers[newIndex]) {
    olView.setMaxZoom(getMaxZoom(layers[newIndex].id))
  }
}
