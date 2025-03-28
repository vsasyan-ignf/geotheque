import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
    let selectedCoordinates = ref(null)
    let mapClickedCoordinates = ref(null)

    let mapCenterState = ref({
        coordinates: null,
        shouldCenter: false
    })

    let pinState = ref({
        coordinates: null,
        shouldAddPin: false
    })

    function updateMapClick(clickData) {
        mapClickedCoordinates.value = clickData
        
        pinState.value = {
          coordinates: clickData,
          shouldAddPin: true
        }
      }

    function updateMapInteraction(coords) {
        selectedCoordinates.value = coords

        mapCenterState.value = {
        coordinates: coords,
        shouldCenter: true
        }

        pinState.value = {
        coordinates: coords,
        shouldAddPin: true
        }

        setTimeout(() => {
        mapCenterState.value.shouldCenter = false
        pinState.value.shouldAddPin = false
            }, 100)
        }

    function resetMapInteraction() {
        selectedCoordinates.value = null
        mapCenterState.value = {
        coordinates: null,
        shouldCenter: false
        }
        pinState.value = {
        coordinates: null,
        shouldAddPin: false
        }
    }


    let zoomState = ref({
        delta: null,
        shouldZoom: false
    })
    
    function updateMapZoom(delta) {
        zoomState.value = {
          delta: delta,
          shouldZoom: true
        }
    
        setTimeout(() => {
          zoomState.value.shouldZoom = false
        }, 300)
      }
    
    function zoomIn() {
        updateMapZoom(1)
    }
    
    function zoomOut() {
        updateMapZoom(-1)
    }

    return {
        selectedCoordinates,
        mapCenterState,
        pinState,
        updateMapInteraction,
        resetMapInteraction,
        mapClickedCoordinates,
        updateMapClick,
        zoomState,
        updateMapZoom,
        zoomIn,
        zoomOut
    }
})