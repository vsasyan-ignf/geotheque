import { ref } from 'vue'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Style, Fill, Stroke } from 'ol/style'
import { intersects } from 'ol/extent'

const intersectionLayer = ref(null)

export function initializeIntersectionLayer(olMap) {
  const intersectionSource = new VectorSource()

  const layer = new VectorLayer({
    source: intersectionSource,
    style: new Style({
      fill: new Fill({ color: 'rgba(255, 102, 0, 0.3)' }),
      stroke: new Stroke({ color: 'rgba(255, 102, 0, 0.8)', width: 3 }),
    }),
    zIndex: 999,
  })

  olMap.value.addLayer(layer)

  intersectionLayer.value = layer
}

export function findIntersections(drawGeometry, vectorOtherLayers) {
  const intersectedFeatures = ref([])
  const drawExtent = drawGeometry.getExtent()

  Object.entries(vectorOtherLayers).forEach(([layerId, layer]) => {
    if (layer.getVisible()) {
      const source = layer.getSource()
      source.forEachFeature((feature) => {
        const featureExtent = feature.getGeometry().getExtent()

        if (intersects(drawExtent, featureExtent)) {
          if (drawGeometry.intersectsExtent(featureExtent)) {
            const featureWithMetadata = feature.clone()
            featureWithMetadata.set('layerId', layerId)
            featureWithMetadata.set('originalFeature', feature)
            intersectedFeatures.value.push(featureWithMetadata)
            intersectionLayer.value.getSource().addFeature(featureWithMetadata)
          }
        }
      })
    }
  })

  if (intersectedFeatures.value.length > 0) {
    let xMin = Infinity
    let yMin = Infinity
    let xMax = -Infinity
    let yMax = -Infinity

    intersectedFeatures.value.forEach((feature) => {
      const extent = feature.getGeometry().getExtent()
      xMin = Math.min(xMin, extent[0])
      yMin = Math.min(yMin, extent[1])
      xMax = Math.max(xMax, extent[2])
      yMax = Math.max(yMax, extent[3])
    })

    const intersectionExtent = [xMin, yMin, xMax, yMax]
    return intersectionExtent
  }

  return null
}

export function clearIntersection() {
  if (intersectionLayer.value) {
    intersectionLayer.value.getSource().clear()
  }
  return []
}
