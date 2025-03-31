import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { bbox as bboxStrategy } from 'ol/loadingstrategy'
import { Style, Icon, Stroke, Fill } from 'ol/style'

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
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
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