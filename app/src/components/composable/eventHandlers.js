// composable/mapEventHandlers.js
import { ref } from 'vue'

import Map from 'ol/Map'
import View from 'ol/View'
export function setupMapEventHandlers(eventBus, olMap, olView, vectorLayers, pins, showPin, projection, currentZoomRef) {
  
  // Gestionnaire pour le toggle des pins
  eventBus.on('toggle-pin', (isVisible) => {
    showPin.value = isVisible
    if (!isVisible) {
      vectorLayers.pin.getSource().clear()
      pins.value = []
    }
  })

  // Gestionnaire pour le zoom
  eventBus.on('map-zoom', (delta) => {
    if (olMap && olView) {
      const zoom = olView.getZoom()
      olView.animate({
        zoom: zoom + delta,
        duration: 250,
      })
    }
  })

  // Gestionnaire pour centrer la carte
  eventBus.on('center-map', ({ x, y }) => {
    if (olMap && olView) {
      olView.animate({
        center: [x, y],
        duration: 750,
      })
    }
  })

  // Gestionnaire pour mettre à jour les coordonnées
  eventBus.on('update-coordinates', ({ x, y }) => {
    vectorLayers.pin.getSource().clear()
    const feature = new Feature({
      geometry: new Point([x, y]),
    })
    vectorLayers.pin.getSource().addFeature(feature)
    pins.value = [[x, y]]
  })

  // Gestionnaire pour réinitialiser les critères
  eventBus.on('criteria-reset', () => {
    if (vectorLayers.pin.getSource()) {
      vectorLayers.pin.getSource().clear()
    }
    if (vectorLayers.emprises.getSource()) {
      vectorLayers.emprises.getSource().clear()
      vectorLayers.emprises.getSource().setUrl('')
      olMap.removeLayer(vectorLayers.emprises)
    }
    if (vectorLayers.geom) {
      vectorLayers.geom.getSource().clear()
      olMap.removeLayer(vectorLayers.geom)
    }
  })

  return { }
}