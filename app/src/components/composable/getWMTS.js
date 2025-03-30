import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getTopLeft } from 'ol/extent'
import { Style, Stroke, Fill, Text } from 'ol/style'
import { bbox as bboxStrategy } from 'ol/loadingstrategy'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

import GeoJSON from 'ol/format/GeoJSON'
import config from '@/config'

function getWmtsUrl(layerId) {
  if (layerId === 'cartesign' || layerId === 'scan25') {
    return `https://data.geopf.fr/private/wmts?apikey=ign_scan_ws&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&style=normal`
  } else if (layerId === 'ortho1950') {
    return `https://data.geopf.fr/wms-r`
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
    case 'ortho1950':
      return 'ORTHOIMAGERY.ORTHOPHOTOS.1950-1965'
    default:
      return 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2'
  }
}

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

function getVectorURL(vectorID, bbox){
  switch (vectorID) {
    case 'communes':
      return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:COMMUNESLambert93&outputFormat=application/json&srsName=EPSG:3857&bbox=${bbox},EPSG:3857`;
    case 'departements':
      return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:departements&outputFormat=application/json&srsName=EPSG:3857&bbox=${bbox},EPSG:3857`;
    case 'feuilles':
      return `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=feuillesmonde&outputFormat=application/json&srsName=EPSG:3857`;
    case 'pays':
      return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:pays&outputFormat=application/json&bbox=${bbox},EPSG:3857`;
    default:
      return `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:pays&outputFormat=application/json&bbox=${bbox},EPSG:3857`;
  }
}

function createVectorSource(urlTemplate, format = new GeoJSON(), strategy = bboxStrategy) {
  return new VectorSource({
    url: (extent) => {
      const bbox = extent.join(',');
      return urlTemplate.replace('{bbox}', bbox);
    },
    format,
    strategy,
  });
}


function createVectorLayer(source, style, visible = false) {
  return new VectorLayer({
    source,
    visible,
    style,
  });
}


const layersConfig = [
  {
    name: 'communes',
    url: `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:COMMUNESLambert93&outputFormat=application/json&srsName=EPSG:3857&bbox={bbox},EPSG:3857`,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(200, 200, 200, 0.5)',
      }),
    }),
  },
  {
    name: 'departments',
    url: `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:departements&outputFormat=application/json&srsName=EPSG:3857&bbox={bbox},EPSG:3857`,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.2)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.1)',
      }),
      text: new Text({
        text: 'CODE_DEPT',
        font: '12px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
      }),
    }),
  },
];

export function initLayers(){
  return layersConfig.map((layerConfig) => {
    const source = createVectorSource(layerConfig.url);
    return createVectorLayer(source, layerConfig.style);
  })
}


// layersConfig.forEach((layerConfig) => {
//   const source = createVectorSource(layerConfig.url);
//   const layer = createVectorLayer(source, layerConfig.style);
//   olMap.value.addLayer(layer);
// });