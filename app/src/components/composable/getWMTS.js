import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getTopLeft } from 'ol/extent'

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