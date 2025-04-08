import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { bbox as bboxStrategy } from 'ol/loadingstrategy'
import { Style, Icon, Stroke, Fill, Text } from 'ol/style'
import config from '@/config'

export function createPinLayer(markerIcon) {
  const source = new VectorSource()

  return new VectorLayer({
    source,
    style: new Style({
      image: new Icon({
        src: markerIcon,
        scale: 0.05,
        anchor: [0.5, 1],
      }),
    }),
  })
}

export function createGeomLayer() {
  const source = new VectorSource()

  return new VectorLayer({
    source,
    style: new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 2,
      })
    }),
  })
}

export function createGeomMouseOverLayer() {
  const source = new VectorSource()

  return new VectorLayer({
    source,
    style: new Style({
      stroke: new Stroke({
        color: 'black',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255, 145, 0, 0.5)',
      }),
    }),
  })
}




export function createScanLayer() {
  const source = new VectorSource()

  return new VectorLayer({
    source,
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
}

export function createWFSLayer() {
  const source = new VectorSource({
    format: new GeoJSON(),
    strategy: bboxStrategy,
  })

  return new VectorLayer({
    source,
    style: new Style({
      stroke: new Stroke({
        color: 'red',
        width: 0.5,
      }),
    }),
  })
}

function createVectorSource(urlTemplate, format = new GeoJSON(), strategy = bboxStrategy) {
  return new VectorSource({
    url: (extent) => {
      const bbox = extent.join(',')
      return urlTemplate.replace('{bbox}', bbox)
    },
    format,
    strategy,
  })
}

function createVectorLayer(source, style, visible = false) {
  return new VectorLayer({
    source,
    visible,
    style,
  })
}

export const layersConfig = [
  {
    name: 'communes',
    url: `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:COMMUNESLambert93&outputFormat=application/json&srsName=EPSG:3857&bbox={bbox},EPSG:3857`,
    style: function (feature) {
      return new Style({
        stroke: new Stroke({
          color: 'rgba( 255, 251, 16  , 0.6)',
          width: 4,
        }),
        fill: new Fill({
          color: 'rgba(  255, 251, 16  , 0.2)',
        }),
        text: new Text({
          text: feature.get('NOM_COM'),
          font: '12px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      })
    },
  },
  {
    name: 'departements',
    url: `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:departements&outputFormat=application/json&srsName=EPSG:3857&bbox={bbox},EPSG:3857`,
    style: function (feature) {
      return new Style({
        stroke: new Stroke({
          color: 'rgba(   228, 22, 169 , 0.5)',
          width: 3,
        }),
        fill: new Fill({
          color: 'rgba(  228, 22, 169 , 0.2)',
        }),
        text: new Text({
          text: feature.get('CODE_DEPT'),
          font: '12px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      })
    },
  },
  {
    name: 'departements_with_no_name',
    url: `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:departements&outputFormat=application/json&srsName=EPSG:3857&bbox={bbox},EPSG:3857`,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(   228, 22, 169 , 0.5)',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(  228, 22, 169 , 0.2)',
      }),
    }),
  },
  {
    name: 'feuilles_monde',
    url: `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=feuillesmonde&outputFormat=application/json&srsName=EPSG:3857`,
    style: function (feature) {
      return new Style({
        stroke: new Stroke({
          color: 'rgba(  17, 209, 197  , 0.5)',
          width: 3,
        }),
        fill: new Fill({
          color: 'rgba(  17, 209, 197  , 0.2)',
        }),
        text: new Text({
          text: feature.get('NUMERO'),
          font: '16px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      })
    },
  },
  {
    name: 'feuilles_monde_with_no_name',
    url: `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=feuillesmonde&outputFormat=application/json&srsName=EPSG:3857`,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(  17, 209, 197  , 0.5)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(  17, 209, 197  , 0.2)',
      }),
    }),
  },
  {
    name: 'feuilles_france',
    url: `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=feuilles50000&outputFormat=application/json&srsName=EPSG:3857`,
    style: function (feature) {
      return new Style({
        stroke: new Stroke({
          color: 'rgba(  17, 209, 197  , 0.5)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(  17, 209, 197  , 0.2)',
        }),
        text: new Text({
          text: feature.get('NUMERO'),
          font: '16px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      })
    },
  },
  {
    name: 'feuilles_france_with_no_name',
    url: `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=feuilles50000&outputFormat=application/json&srsName=EPSG:3857`,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(  17, 209, 197  , 0.5)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(  17, 209, 197  , 0.2)',
      }),
    }),
  },
  {
    name: 'pays',
    url: `${config.GEOSERVER_URL}/fondcarte/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=fondcarte:pays&outputFormat=application/json&bbox={bbox},EPSG:3857`,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(0, 255, 0, 0.1)',
      }),
    }),
  },
]

export function initOtherVectorLayers() {
  const layers = {}
  layersConfig.forEach((layerConfig) => {
    const source = createVectorSource(layerConfig.url)
    const layer = createVectorLayer(source, layerConfig.style)
    layers[layerConfig.name] = layer
  })
  return layers
}
