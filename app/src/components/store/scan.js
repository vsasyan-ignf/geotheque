import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import config from '../../config';
import { useConvertCoordinates } from '../composable/convertCoordinates'
import { bbox } from 'ol/loadingstrategy';

export const useScanStore = defineStore('scan', () => {
  let storeBbox = ref([])
  let storeScansData = ref(null)
  let storeSelectedGeom = ref([])
  let storeSelectedScan = ref(null)
  let currentCollecInfo = ref(null)
  let activeSubCategory = ref(null)
  let activeTab = ref("cartotheque")

  let storeCritereSelection = ref({
    yearMin: null,
    yearMax: null,
    scaleMin: 500,
    scaleMax: 100000,
    selectedCollection: null,
  })

  let storeURL = computed(() => {
    if (storeBbox.value.length > 0) {
      let emprise_requete_url = "emprisesscans";
      let [minX, minY, maxX, maxY] = storeBbox.value
      const { yearMin, yearMax, scaleMin, scaleMax, selectedCollection } =
        storeCritereSelection.value


      let cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`
      if (yearMin) cqlFilter += `%20AND%20DATE_PUB%3E%3D${yearMin}`
      if (yearMax) cqlFilter += `%20AND%20DATE_FIN%3C%3D${yearMax}`
      if (scaleMin) cqlFilter += `%20AND%20ECHELLE%3E%3D${scaleMin}`
      if (scaleMax) cqlFilter += `%20AND%20ECHELLE%3C%3D${scaleMax}`

      if (selectedCollection) cqlFilter += `%20AND%20COLLECTION%3D'${selectedCollection}'`

      if (activeTab.value === 'carthotheque_etranger') {
        emprise_requete_url = "emprisesscansmonde";
        cqlFilter = `BBOX(the_geom,${minY},${minX},${maxY},${maxX})`
      }

      return (
        `${config.baseGeoserverUrl}/wfs?service=wfs&version=2.0.0` +
        `&request=GetFeature&typeNames=${emprise_requete_url}&outputFormat=application/json` +
        `&cql_filter=${cqlFilter}`
        + `&srsName=EPSG:3857`
      )

    }
    return ''
  })

  function updateBbox(newBbox) {
    console.log("test " + newBbox)
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

  function updateCurrentScanInfo(collec) {
    currentCollecInfo.value = collec
  }

  function resetCriteria() {
    storeCritereSelection.value = {
      yearMin: null,
      yearMax: null,
      scaleMin: 500,
      scaleMax: 100000,
      selectedCollection: null,
    }
    storeSelectedGeom.value = []
    storeBbox.value = []
    storeScansData.value = null
    currentCollecInfo.value = null
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
          collecInfo:
            feature.properties.COLLECTION +
            '/' +
            feature.properties.SOUS_COLL +
            '/' +
            feature.properties.ID_CARTE,
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
    updateCurrentScanInfo,
    currentCollecInfo,
    storeSelectedGeom,
    updateSelectedGeom,
    resetCriteria,
    resetCriteria,
    activeTab,
    updateActiveTab,
  }
})
