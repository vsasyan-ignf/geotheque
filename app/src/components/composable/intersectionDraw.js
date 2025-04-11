import { ref } from 'vue'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Style, Fill, Stroke } from 'ol/style'
import { intersects } from 'ol/extent'


/**
 * Référence à la couche des intersections, utilisée pour afficher les géométries intersectées.
 * @type {import('vue').Ref<import('ol/layer/Vector').default|null>}
 */
const intersectionLayer = ref(null)

/**
 * Initialise une couche OpenLayers dédiée à l'affichage des intersections.
 *
 * @param {import('vue').Ref<import('ol/Map').default>} olMap - Carte OpenLayers (référence réactive).
 */

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

/**
 * Recherche les entités intersectées entre une géométrie dessinée et un ensemble de couches vecteur.
 *
 * @param {import('ol/geom/Geometry').default} drawGeometry - Géométrie utilisée pour tester les intersections.
 * @param {Object<string, import('ol/layer/Vector').default>} vectorOtherLayers - Couches vecteur à tester.
 * @returns {import('ol/extent').Extent|null} Étendue (bounding box) des entités intersectées, ou null si aucune intersection.
 */

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

/**
 * Efface toutes les entités présentes dans la couche d’intersection.
 *
 * @returns {[]} Retourne un tableau vide (utile pour les appels de reset).
 */

export function clearIntersection() {
  if (intersectionLayer.value) {
    intersectionLayer.value.getSource().clear()
  }
  return []
}
