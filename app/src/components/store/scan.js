import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import config from '@/config'

export const useScanStore = defineStore('scan', () => {
  let storeBbox = ref([])
  let storeScansData = ref(null)
  let storeSelectedGeom = ref([])
  let storeSelectedScan = ref(null)
  let activeSubCategory = ref(null)
  let activeTab = ref('cartotheque')

  let storeCritereSelection = ref({
    yearMin: null,
    yearMax: null,
    scaleMin: null,
    scaleMax: null,
    selectedCollection: null,
  })

  let storeURL = computed(() => {
    if (storeBbox.value.length > 0) {
      let empriseURL = 'emprisesscans'
      let [minX, minY, maxX, maxY] = storeBbox.value

      if (activeTab.value === 'cartotheque_etranger') {
        empriseURL = 'emprisesscansmonde'
        // inverse les coordonnées : lon/lat to lat/lon
        [minX, minY] = [minY, minX]
        [maxX, maxY] = [maxY, maxX]
      }

      const { yearMin, yearMax, scaleMin, scaleMax, selectedCollection } =
        storeCritereSelection.value

      let cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`
      if (yearMin) cqlFilter += `%20AND%20DATE_PUB%3E%3D${yearMin}`
      if (yearMax) cqlFilter += `%20AND%20DATE_FIN%3C%3D${yearMax}`
      if (scaleMin) cqlFilter += `%20AND%20ECHELLE%3E%3D${scaleMin}`
      if (scaleMax) cqlFilter += `%20AND%20ECHELLE%3C%3D${scaleMax}`

      if (selectedCollection) cqlFilter += `%20AND%20COLLECTION%3D'${selectedCollection}'`

      return (
        `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0` +
        `&request=GetFeature&typeNames=${empriseURL}&outputFormat=application/json` +
        `&cql_filter=${cqlFilter}` +
        `&srsName=EPSG:3857`
      )
    }
    return ''
  })

  function updateBbox(newBbox) {
    console.log(newBbox)
    storeBbox.value = newBbox
  }

  function updateCriteria(newCriteria) {
    storeCritereSelection.value = { ...newCriteria }
    console.log('Updated criteria:', storeCritereSelection.value)
  }

  function updateActiveSubCategory(subCategory) {
    activeSubCategory.value = subCategory
    console.log('Sous-catégorie active:', activeSubCategory.value)
  }

  function resetCriteria() {
    storeCritereSelection.value = {
      yearMin: null,
      yearMax: null,
      scaleMin: null,
      scaleMax: null,
      selectedCollection: null,
    }

    storeSelectedGeom.value = []
    storeBbox.value = []
    storeScansData.value = null
    storeSelectedScan.value = null
  }

  function updateSelectedGeom(newVal) {
    storeSelectedGeom.value = newVal
  }

  function updateSelectedScan(newVal) {
    storeSelectedScan.value = newVal
  }

  function updateActiveTab(newVal) {
    activeTab.value = newVal
    console.log('tab selected : ', activeTab.value)
  }

  async function storeGet(url) {
    if (!url) {
      return
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        storeScansData.value = data.features.map((feature, index) => ({
          id: index,
          geom: feature.geometry.coordinates[0],
          name: feature.properties.ID_CARTE,
          properties: feature.properties,
        }))
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return {
    storeScansData,
    storeBbox,
    storeURL,
    storeGet,
    updateBbox,
    updateSelectedScan,
    storeSelectedScan,
    storeCritereSelection,
    updateCriteria,
    updateActiveSubCategory,
    activeSubCategory,
    storeSelectedGeom,
    updateSelectedGeom,
    resetCriteria,
    activeTab,
    updateActiveTab,
  }
})
